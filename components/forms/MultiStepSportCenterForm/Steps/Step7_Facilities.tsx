import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

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
          name: facility,
          icon: '/assets/facilities/svg/star_shine.svg'
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

  const handleSuggestFacility = async () => {
    if (newFacilityName.trim()) {
      try {
        const response = await fetch('/api/facilities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newFacilityName.trim() })
        });
        
        const result = await response.json();
        
        if (result._id) {
          // Adicionar a nova facility à lista com ícone da estrela
          const newFacility = {
            ...result,
            icon: '/assets/facilities/svg/star_shine.svg'
          };
          setAvailableFacilities(prev => [...prev, newFacility]);
          setNewFacilityName('');
          setShowSuggestModal(false);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        } else {
          // Se a facility já existe ou erro, adiciona localmente
          if (result.error === 'Facility com este nome já existe') {
            dispatch({ type: 'ADD_CUSTOM_FACILITY', payload: newFacilityName.trim() });
            setAvailableFacilities(prev => [...prev, { 
              _id: `custom-${Date.now()}`, 
              name: newFacilityName.trim(),
              icon: '/assets/facilities/svg/star_shine.svg'
            }]);
            setNewFacilityName('');
            setShowSuggestModal(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } else {
            alert(result.error || 'Erro ao adicionar facility');
          }
        }
      } catch (error) {
        console.error('Error suggesting facility:', error);
        // Fallback para adicionar localmente
        dispatch({ type: 'ADD_CUSTOM_FACILITY', payload: newFacilityName.trim() });
        setAvailableFacilities(prev => [...prev, { 
          _id: `custom-${Date.now()}`, 
          name: newFacilityName.trim(),
          icon: '/assets/facilities/svg/star_shine.svg'
        }]);
        setNewFacilityName('');
        setShowSuggestModal(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  const selectedFacilities = state.formData.facilities || [];

  return (
    <div className={styles.stepContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
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
          <span className={styles.addSportText}>Add a facility</span>
        </div>
      </div>

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