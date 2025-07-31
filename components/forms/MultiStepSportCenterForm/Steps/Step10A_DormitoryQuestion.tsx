import React, { useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import baseStyles from './styles/BaseStep.module.css';
import styles from './styles/Step10.module.css';

function Step10A_DormitoryQuestion() {
  const { state, dispatch } = useMultiStepForm();

  const updateValidation = () => {
    // Step is valid when dormitory has been answered (true or false, not undefined)
    const isValid = state.formData.dormitory !== undefined;
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 9, isValid }
    });
  };

  const handleAccommodationToggle = (hasAccommodation: string) => {
    const available = hasAccommodation === 'Sim';
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        dormitory: available
      }
    });
    
    // Update validation immediately after selection
    setTimeout(() => updateValidation(), 0);
  };

  // Validate on mount
  useEffect(() => {
    updateValidation();
  }, [state.formData.dormitory]);

  // Initial validation on mount
  useEffect(() => {
    updateValidation();
  }, []);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.dormitoryQuestionContainer}>
        <div className={styles.dormitoryOptionsWrapper}>
          <button
            type="button"
            className={`${styles.dormitoryOption} ${
              state.formData.dormitory === true ? styles.dormitoryOptionSelected : ''
            }`}
            onClick={() => handleAccommodationToggle('Sim')}
          >
            Sim
          </button>
          <button
            type="button"
            className={`${styles.dormitoryOption} ${
              state.formData.dormitory === false ? styles.dormitoryOptionSelected : ''
            }`}
            onClick={() => handleAccommodationToggle('Não')}
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}

export { Step10A_DormitoryQuestion };