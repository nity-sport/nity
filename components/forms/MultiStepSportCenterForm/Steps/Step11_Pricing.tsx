import React, { useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import baseStyles from './styles/BaseStep.module.css';
import styles from './Steps.module.css'; // TODO: Create Step11.module.css

export function Step11_Pricing() {
  const { state, dispatch } = useMultiStepForm();

  // Validation - mark as valid always (pricing can be empty)
  useEffect(() => {
    console.log('🔧 Step11_Pricing: Setting validation for stepIndex 13 to TRUE');
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 13, isValid: true }
    });
  }, []);

  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except comma
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') return '';
    
    // Convert to cents, then format with decimal places
    const cents = parseInt(numericValue);
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    
    return formatted;
  };

  const handlePricingChange = (value: string) => {
    const formatted = formatCurrency(value);
    const numericValue = formatted ? parseFloat(formatted.replace(',', '.')) : undefined;
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        experienceCost: numericValue
      }
    });
  };

  const displayValue = state.formData.experienceCost !== undefined 
    ? state.formData.experienceCost.toFixed(2).replace('.', ',')
    : '';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.dailyRateContainer}>
        <div className={styles.priceInputWrapper}>
          <span className={styles.currencySymbol}>R$</span>
          <input
            type="text"
            value={displayValue}
            onChange={(e) => handlePricingChange(e.target.value)}
            placeholder="0,00"
            className={styles.priceInputField}
          />
          <span className={styles.periodLabel}>/DIA</span>
        </div>
        <p className={styles.priceNote}>
          Deixe em branco caso sua experiência não tenha custo adicional
        </p>
      </div>
    </div>
  );
}