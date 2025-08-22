import React, { useEffect, useState } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';

import baseStyles from './styles/BaseStep.module.css';
import styles from './styles/Step1.module.css';

export function Step1_Name() {
  const { state, dispatch } = useMultiStepForm();
  const [error, setError] = useState('');

  const validateName = (name: string): string => {
    if (!name || name.trim().length === 0) {
      return 'Nome do SportCenter é obrigatório';
    }
    if (name.trim().length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (name.trim().length > 100) {
      return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  };

  const handleNameChange = (name: string) => {
    const validationError = validateName(name);

    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { name: name },
    });

    // Update step validation status immediately for navigation
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 0, isValid: validationError === '' },
    });

    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[0]) {
      setError(validationError);
    } else {
      setError(''); // Clear error if we shouldn't show it
    }
  };

  // Update validation when showErrors changes
  useEffect(() => {
    const validationError = validateName(state.formData.name || '');
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 0, isValid: validationError === '' },
    });

    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[0]) {
      setError(validationError);
    } else {
      setError('');
    }
  }, [state.showErrors[0], state.formData.name]);

  const isValid =
    !error && state.formData.name && state.formData.name.length >= 3;

  return (
    <div className={baseStyles.stepContainer}>
      <div className={baseStyles.inputWrapper} style={{ marginTop: '7.5rem' }}>
        <input
          type='text'
          value={state.formData.name || ''}
          onChange={e => handleNameChange(e.target.value)}
          placeholder='INSIRA O NOME'
          className={`${styles.nameInput} ${error ? styles.inputError : ''} ${isValid ? styles.inputValid : ''}`}
          required
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
}
