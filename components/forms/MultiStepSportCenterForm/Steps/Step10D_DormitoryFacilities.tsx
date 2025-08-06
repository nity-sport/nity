import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import baseStyles from './styles/BaseStep.module.css';
import styles from './styles/Step10D.module.css';

interface DormitoryFacility {
  _id: string;
  name: string;
  icon?: string;
}

export function Step10D_DormitoryFacilities() {
  const { state, dispatch } = useMultiStepForm();
  const [availableFacilities, setAvailableFacilities] = useState<DormitoryFacility[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerPage = 8; // 8 facilities + 1 add button = 9 total items for 3x3 grid

  useEffect(() => {
    fetchDormitoryFacilities();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Validation - dormitory facilities are optional
  useEffect(() => {
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 12, isValid: true }
    });
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestModal(false);
      }
    };
    
    if (showSuggestModal) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showSuggestModal]);

  const fetchDormitoryFacilities = async () => {
    try {
      // Try to fetch from main facilities API first
      const response = await fetch('/api/facilities');
      const result = await response.json();
      
      let dbFacilities = [];
      if (result.facilities) {
        // Filter relevant facilities for dormitory
        dbFacilities = result.facilities.filter((facility: any) => 
          [
            'Próximo a estação de metro',
            'Boa localização', 
            'X quadras',
            'Quadras poliesportivas',
            'Piscina',
            'Tênis',
            'Beach tênis',
            'Ginásio',
            'Quadras cobertas',
            'Salão de jogos',
            'Academia',
            'Aula de dança'
          ].includes(facility.name)
        );
      }
      
      // Fallback to default dormitory facilities
      const defaultFacilities = [
        { _id: '1', name: 'Próximo a estação de metro' },
        { _id: '2', name: 'Boa localização' },
        { _id: '3', name: 'X quadras' },
        { _id: '4', name: 'Quadras poliesportivas' },
        { _id: '5', name: 'Piscina' },
        { _id: '6', name: 'Tênis' },
        { _id: '7', name: 'Beach tênis' },
        { _id: '8', name: 'Ginásio' },
        { _id: '9', name: 'Quadras cobertas' },
        { _id: '10', name: 'Salão de jogos' },
        { _id: '11', name: 'Academia' },
        { _id: '12', name: 'Aula de dança' }
      ];
      
      // Use DB facilities if available, otherwise use defaults
      const facilitiesToUse = dbFacilities.length > 0 ? dbFacilities : defaultFacilities;
      
      setAvailableFacilities(facilitiesToUse);
    } catch (error) {
      console.error('Error fetching dormitory facilities:', error);
      
      // Fallback to default facilities
      const defaultFacilities = [
        { _id: '1', name: 'Próximo a estação de metro' },
        { _id: '2', name: 'Boa localização' },
        { _id: '3', name: 'X quadras' },
        { _id: '4', name: 'Quadras poliesportivas' },
        { _id: '5', name: 'Piscina' },
        { _id: '6', name: 'Tênis' },
        { _id: '7', name: 'Beach tênis' },
        { _id: '8', name: 'Ginásio' },
        { _id: '9', name: 'Quadras cobertas' },
        { _id: '10', name: 'Salão de jogos' },
        { _id: '11', name: 'Academia' },
        { _id: '12', name: 'Aula de dança' }
      ];
      
      setAvailableFacilities(defaultFacilities);
    }
  };

  const handleFacilityToggle = (facilityId: string, facilityName: string) => {
    const currentFacilities = state.formData.dormitoryFacilities || [];
    const isSelected = currentFacilities.includes(facilityName);
    
    if (isSelected) {
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          dormitoryFacilities: currentFacilities.filter(f => f !== facilityName)
        }
      });
    } else {
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          dormitoryFacilities: [...currentFacilities, facilityName]
        }
      });
    }
  };

  const handleSuggestFacility = () => {
    if (newFacilityName.trim()) {
      // Add locally for dormitory facilities
      const newFacility = {
        _id: `dormitory-custom-${Date.now()}`,
        name: newFacilityName.trim()
      };
      
      setAvailableFacilities(prev => [...prev, newFacility]);
      setNewFacilityName('');
      setShowSuggestModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  // Pagination logic
  const getPaginatedFacilities = () => {
    if (isMobile) {
      return availableFacilities;
    }
    
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return availableFacilities.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (isMobile) return 1;
    return Math.ceil(availableFacilities.length / itemsPerPage);
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages() - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const selectedFacilities = state.formData.dormitoryFacilities || [];

  return (
    <div className={styles.stepContainer}>
      {!isMobile && getTotalPages() > 1 && (
        <div className={styles.paginationTop}>
          <span className={styles.pageInfo}>
            Página {currentPage + 1} de {getTotalPages()}
          </span>
        </div>
      )}
      
      <div className={styles.facilitiesGrid}>
        {getPaginatedFacilities().map(facility => (
          <div
            key={facility._id}
            className={`${styles.sportCard} ${
              selectedFacilities.includes(facility.name) ? styles.selected : ''
            }`}
            onClick={() => handleFacilityToggle(facility._id, facility.name)}
          >
            <div className={styles.sportIconContainer}>
              <span className={styles.starIcon}>★</span>
            </div>
            <span className={styles.sportName}>{facility.name}</span>
          </div>
        ))}
        
        <div
          className={styles.addSportCard}
          onClick={() => setShowSuggestModal(true)}
        >
          <span className={styles.addSportIcon}>+</span>
          <span className={styles.addSportText}>Add a facilitie</span>
        </div>
      </div>

      {!isMobile && getTotalPages() > 1 && (
        <div className={styles.paginationControls}>
          <button 
            className={`${styles.paginationButton} ${currentPage === 0 ? styles.disabled : ''}`}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            ← Anterior
          </button>
          
          <div className={styles.pageIndicators}>
            {Array.from({ length: getTotalPages() }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageIndicator} ${i === currentPage ? styles.active : ''}`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button 
            className={`${styles.paginationButton} ${currentPage === getTotalPages() - 1 ? styles.disabled : ''}`}
            onClick={handleNextPage}
            disabled={currentPage === getTotalPages() - 1}
          >
            Próximo →
          </button>
        </div>
      )}

      {showSuccessMessage && (
        <div className={styles.successMessage}>
          <p>Obrigado!</p>
          <p>Sua sugestão foi salva.</p>
        </div>
      )}

      {showSuggestModal && (
        <div className={styles.modal} onClick={() => setShowSuggestModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseButton}
              onClick={() => setShowSuggestModal(false)}
            >
              ×
            </button>
            <h1 className={styles.modalTitle}>Sugira uma nova facilidade</h1>
            <div className={styles.modalInputWrapper}>
              <input
                type="text"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestFacility()}
                placeholder="Insira o Nome"
                className={styles.modalInput}
                required
                autoFocus
              />
            </div>
            <button 
              className={styles.addButton}
              onClick={handleSuggestFacility}
            >
              <span className={styles.addButtonText}>Adicionar +</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}