import React from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

export function Step11_Pricing() {
  const { state, dispatch } = useMultiStepForm();

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