import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import baseStyles from './styles/BaseStep.module.css';
import styles from './Steps.module.css'; // TODO: Create Step7.module.css

interface Facility {
  _id: string;
  name: string;
  icon?: string;
}

export function Step7_Facilities() {
  const { state, dispatch } = useMultiStepForm();
  const [availableFacilities, setAvailableFacilities] = useState<Facility[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerPage = 8; // 8 facilities + 1 add button = 9 total items for 3x3 grid

  const validateFacilities = (facilities: string[]): string => {
    if (!facilities || facilities.length === 0) {
      return 'Selecione pelo menos 1 facilidade';
    }
    return '';
  };

  const updateValidation = (facilities: string[]) => {
    const validationError = validateFacilities(facilities);
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 6, isValid: validationError === '' }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[6]) {
      setError(validationError);
    } else {
      setError('');
    }
  };

  useEffect(() => {
    fetchFacilities();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Validate on mount and when facilities change
  useEffect(() => {
    const facilities = state.formData.facilities || [];
    updateValidation(facilities);
  }, [state.formData.facilities, state.showErrors[6]]);

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

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      const result = await response.json();
      
      if (result.facilities) {
        const dbFacilities = result.facilities;
        const customFacilities = state.customFacilities?.map((facility, index) => ({
          _id: `custom-${index}`,
          name: facility
        })) || [];
        
        setAvailableFacilities([...dbFacilities, ...customFacilities]);
      } else {
        // Fallback para facilities padrão se a API falhar
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
        
        setAvailableFacilities([...defaultFacilities, ...state.customFacilities?.map((facility, index) => ({
          _id: `custom-${index}`,
          name: facility
        })) || []]);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      
      // Fallback para facilities padrão se houver erro
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
      
      setAvailableFacilities([...defaultFacilities, ...state.customFacilities?.map((facility, index) => ({
        _id: `custom-${index}`,
        name: facility
      })) || []]);
    }
  };

  const handleFacilityToggle = (facilityId: string, facilityName: string) => {
    const currentFacilities = state.formData.facilities || [];
    const isSelected = currentFacilities.includes(facilityName);
    
    let newFacilities: string[];
    if (isSelected) {
      newFacilities = currentFacilities.filter(f => f !== facilityName);
    } else {
      newFacilities = [...currentFacilities, facilityName];
    }
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        facilities: newFacilities
      }
    });

    // Update validation immediately
    updateValidation(newFacilities);
  };

  const handleSuggestFacility = () => {
    if (newFacilityName.trim()) {
      // Adicionar facility localmente
      dispatch({ type: 'ADD_CUSTOM_FACILITY', payload: newFacilityName.trim() });
      setAvailableFacilities(prev => [...prev, { 
        _id: `custom-${Date.now()}`, 
        name: newFacilityName.trim()
      }]);
      setNewFacilityName('');
      setShowSuggestModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const selectedFacilities = state.formData.facilities || [];

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

  return (
    <div className={styles.stepContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      
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
          <span className={styles.addSportText}>Add a facility</span>
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
          <p>Thank you!</p>
          <p>Your suggestion has been saved.</p>
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
            <h1 className={styles.modalTitle}>Sugira uma nova facility</h1>
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