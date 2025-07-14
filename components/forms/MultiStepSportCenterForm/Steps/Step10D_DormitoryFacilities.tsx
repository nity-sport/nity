import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

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

  useEffect(() => {
    fetchDormitoryFacilities();
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
        { _id: '1', name: 'Próximo a estação de metro', icon: '/assets/facilities/svg/metro.svg' },
        { _id: '2', name: 'Boa localização', icon: '/assets/facilities/svg/location.svg' },
        { _id: '3', name: 'X quadras', icon: '/assets/facilities/svg/courts.svg' },
        { _id: '4', name: 'Quadras poliesportivas', icon: '/assets/facilities/svg/sports_courts.svg' },
        { _id: '5', name: 'Piscina', icon: '/assets/facilities/svg/pool.svg' },
        { _id: '6', name: 'Tênis', icon: '/assets/facilities/svg/tennis.svg' },
        { _id: '7', name: 'Beach tênis', icon: '/assets/facilities/svg/beach_tennis.svg' },
        { _id: '8', name: 'Ginásio', icon: '/assets/facilities/svg/gym.svg' },
        { _id: '9', name: 'Quadras cobertas', icon: '/assets/facilities/svg/covered_courts.svg' },
        { _id: '10', name: 'Salão de jogos', icon: '/assets/facilities/svg/game_room.svg' },
        { _id: '11', name: 'Academia', icon: '/assets/facilities/svg/fitness.svg' },
        { _id: '12', name: 'Aula de dança', icon: '/assets/facilities/svg/dance.svg' }
      ];
      
      // Use DB facilities if available, otherwise use defaults
      const facilitiesToUse = dbFacilities.length > 0 ? dbFacilities : defaultFacilities;
      
      setAvailableFacilities(facilitiesToUse);
    } catch (error) {
      console.error('Error fetching dormitory facilities:', error);
      
      // Fallback to default facilities
      const defaultFacilities = [
        { _id: '1', name: 'Próximo a estação de metro', icon: '/assets/facilities/svg/metro.svg' },
        { _id: '2', name: 'Boa localização', icon: '/assets/facilities/svg/location.svg' },
        { _id: '3', name: 'X quadras', icon: '/assets/facilities/svg/courts.svg' },
        { _id: '4', name: 'Quadras poliesportivas', icon: '/assets/facilities/svg/sports_courts.svg' },
        { _id: '5', name: 'Piscina', icon: '/assets/facilities/svg/pool.svg' },
        { _id: '6', name: 'Tênis', icon: '/assets/facilities/svg/tennis.svg' },
        { _id: '7', name: 'Beach tênis', icon: '/assets/facilities/svg/beach_tennis.svg' },
        { _id: '8', name: 'Ginásio', icon: '/assets/facilities/svg/gym.svg' },
        { _id: '9', name: 'Quadras cobertas', icon: '/assets/facilities/svg/covered_courts.svg' },
        { _id: '10', name: 'Salão de jogos', icon: '/assets/facilities/svg/game_room.svg' },
        { _id: '11', name: 'Academia', icon: '/assets/facilities/svg/fitness.svg' },
        { _id: '12', name: 'Aula de dança', icon: '/assets/facilities/svg/dance.svg' }
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

  const handleSuggestFacility = async () => {
    if (newFacilityName.trim()) {
      // Add locally for dormitory facilities
      const newFacility = {
        _id: `dormitory-custom-${Date.now()}`,
        name: newFacilityName.trim(),
        icon: '/assets/facilities/svg/star_shine.svg'
      };
      
      setAvailableFacilities(prev => [...prev, newFacility]);
      setNewFacilityName('');
      setShowSuggestModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const selectedFacilities = state.formData.dormitoryFacilities || [];

  return (
    <div className={styles.stepContainer}>
      <div className={styles.sportsGrid}>
        {availableFacilities.map(facility => (
          <div
            key={facility._id}
            className={`${styles.sportCard} ${
              selectedFacilities.includes(facility.name) ? styles.selected : ''
            }`}
            onClick={() => handleFacilityToggle(facility._id, facility.name)}
          >
            {facility.icon && (
              <div className={styles.sportIconContainer}>
                <img 
                  src={facility.icon} 
                  alt={facility.name} 
                  className={styles.sportIcon}
                />
              </div>
            )}
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