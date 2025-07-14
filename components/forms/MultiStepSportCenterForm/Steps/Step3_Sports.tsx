import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import { FormInput } from '../FormComponents';
import styles from './Steps.module.css';

interface Sport {
  _id: string;
  name: string;
  icon?: string;
}

export function Step3_Sports() {
  const { state, dispatch } = useMultiStepForm();
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSports();
  }, []);

  // Validate on mount and when sports change
  useEffect(() => {
    const sports = state.formData.sport || [];
    const validationError = validateSports(sports);
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 2, isValid: validationError === '' }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[2]) {
      setError(validationError);
    } else {
      setError('');
    }
  }, [state.formData.sport, state.showErrors[2]]);

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

  const fetchSports = async () => {
    try {
      const response = await fetch('/api/sports');
      const result = await response.json();
      
      if (result.success) {
        const dbSports = result.data;
        const customSports = state.customSports.map((sport, index) => ({
          _id: `custom-${index}`,
          name: sport,
          icon: '/assets/sports/svg/star_shine.svg'
        }));
        
        setAvailableSports([...dbSports, ...customSports]);
      } else {
        // Fallback para esportes padrão se a API falhar
        const defaultSports = [
          { _id: '1', name: 'Futebol' },
          { _id: '2', name: 'Volei' },
          { _id: '3', name: 'Basquete' },
          { _id: '4', name: 'Tenis' },
          { _id: '5', name: 'Surf' },
          { _id: '6', name: 'Handball' },
          { _id: '7', name: 'Muai Tay' },
          { _id: '8', name: 'Swimming' }
        ];
        
        setAvailableSports([...defaultSports, ...state.customSports.map((sport, index) => ({
          _id: `custom-${index}`,
          name: sport
        }))]);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      
      // Fallback para esportes padrão se houver erro
      const defaultSports = [
        { _id: '1', name: 'Futebol' },
        { _id: '2', name: 'Volei' },
        { _id: '3', name: 'Basquete' },
        { _id: '4', name: 'Tenis' },
        { _id: '5', name: 'Surf' },
        { _id: '6', name: 'Handball' },
        { _id: '7', name: 'Muai Tay' },
        { _id: '8', name: 'Swimming' }
      ];
      
      setAvailableSports([...defaultSports, ...state.customSports.map((sport, index) => ({
        _id: `custom-${index}`,
        name: sport
      }))]);
    }
  };

  const validateSports = (sports: string[]): string => {
    if (!sports || sports.length === 0) {
      return 'Selecione pelo menos 1 esporte';
    }
    return '';
  };

  const updateValidation = (sports: string[]) => {
    const validationError = validateSports(sports);
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 2, isValid: validationError === '' }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[2]) {
      setError(validationError);
    }
  };

  const handleSportToggle = (sportId: string, sportName: string) => {
    const currentSports = state.formData.sport || [];
    const isSelected = currentSports.includes(sportName);
    
    let newSports: string[];
    if (isSelected) {
      newSports = currentSports.filter(s => s !== sportName);
    } else {
      newSports = [...currentSports, sportName];
    }
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        sport: newSports
      }
    });

    // Update validation immediately
    updateValidation(newSports);
  };

  const handleSuggestSport = async () => {
    if (newSportName.trim()) {
      try {
        const response = await fetch('/api/sports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newSportName.trim() })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Adicionar o novo esporte à lista com ícone da estrela
          const newSport = {
            ...result.data,
            icon: '/assets/sports/svg/star_shine.svg'
          };
          setAvailableSports(prev => [...prev, newSport]);
          setNewSportName('');
          setShowSuggestModal(false);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        } else {
          // Se o esporte já existe, ainda adiciona localmente
          if (result.error === 'Esporte já cadastrado') {
            dispatch({ type: 'ADD_CUSTOM_SPORT', payload: newSportName.trim() });
            setAvailableSports(prev => [...prev, { 
              _id: `custom-${Date.now()}`, 
              name: newSportName.trim(),
              icon: '/assets/sports/svg/star_shine.svg'
            }]);
            setNewSportName('');
            setShowSuggestModal(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
          } else {
            alert(result.error || 'Erro ao adicionar esporte');
          }
        }
      } catch (error) {
        console.error('Error suggesting sport:', error);
        // Fallback para adicionar localmente
        dispatch({ type: 'ADD_CUSTOM_SPORT', payload: newSportName.trim() });
        setAvailableSports(prev => [...prev, { 
          _id: `custom-${Date.now()}`, 
          name: newSportName.trim(),
          icon: '/assets/sports/svg/star_shine.svg'
        }]);
        setNewSportName('');
        setShowSuggestModal(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  const selectedSports = state.formData.sport || [];

  return (
    <div className={styles.stepContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.sportsGrid}>
        {availableSports.map(sport => (
          <div
            key={sport._id}
            className={`${styles.sportCard} ${
              selectedSports.includes(sport.name) ? styles.selected : ''
            }`}
            onClick={() => handleSportToggle(sport._id, sport.name)}
          >
            {sport.icon && (
              <div className={styles.sportIconContainer}>
                <img 
                  src={sport.icon} 
                  alt={sport.name} 
                  className={styles.sportIcon}
                />
              </div>
            )}
            <span className={styles.sportName}>{sport.name}</span>
          </div>
        ))}
        
        <div
          className={styles.addSportCard}
          onClick={() => setShowSuggestModal(true)}
        >
          <span className={styles.addSportIcon}>+</span>
          <span className={styles.addSportText}>Add a sport</span>
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
            <h1 className={styles.modalTitle}>Sugira um novo esporte</h1>
            <div className={styles.modalInputWrapper}>
              <input
                type="text"
                value={newSportName}
                onChange={(e) => setNewSportName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestSport()}
                placeholder="Insira o Nome"
                className={styles.modalInput}
                required
                autoFocus
              />
            </div>
            <button 
              className={styles.addButton}
              onClick={handleSuggestSport}
            >
              <span className={styles.addButtonText}>Adicionar +</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}