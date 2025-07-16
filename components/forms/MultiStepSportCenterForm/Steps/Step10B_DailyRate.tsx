import React, { useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

export function Step10B_DailyRate() {
  const { state, dispatch } = useMultiStepForm();

  const updateValidation = () => {
    // Daily rate is optional - always valid
    console.log('🔧 Step10B_DailyRate: Setting validation for stepIndex 10 to TRUE');
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 10, isValid: true }
    });
  };

  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except comma
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') return '';
    
    // Convert to cents, then format with decimal places
    const cents = parseInt(numericValue);
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    
    return formatted;
  };

  const handleDailyRateChange = (value: string) => {
    const formatted = formatCurrency(value);
    const numericValue = formatted ? parseFloat(formatted.replace(',', '.')) : undefined;
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        dormitoryCosts: numericValue
      }
    });
    
    // Update validation after change
    updateValidation();
  };

  const displayValue = state.formData.dormitoryCosts !== undefined 
    ? state.formData.dormitoryCosts.toFixed(2).replace('.', ',')
    : '';

  // Initial validation on mount
  useEffect(() => {
    updateValidation();
  }, []);

  // Also validate when dormitoryCosts changes
  useEffect(() => {
    updateValidation();
  }, [state.formData.dormitoryCosts]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.dailyRateContainer}>
        <div className={styles.priceInputWrapper}>
          <span className={styles.currencySymbol}>R$</span>
          <input
            type="text"
            value={displayValue}
            onChange={(e) => handleDailyRateChange(e.target.value)}
            placeholder="0,00"
            className={styles.priceInputField}
          />
          <span className={styles.periodLabel}>/DIA</span>
        </div>
        <p className={styles.priceNote}>
          Deixe em branco caso seu dormitório não tenha custo adicional
        </p>
      </div>
    </div>
  );
}