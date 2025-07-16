import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import { FormInput, FormSelect } from '../FormComponents';
import styles from './Steps.module.css';

export function Step8_Location() {
  const { state, dispatch } = useMultiStepForm();
  const [errors, setErrors] = useState({
    zip_code: '',
    country: '',
    street: '',
    number: '',
    city: '',
    state: ''
  });

  const validateLocationField = (field: string, value: string): string => {
    if (!value || value.trim().length === 0) {
      const fieldNames: Record<string, string> = {
        zip_code: 'CEP',
        country: 'País',
        street: 'Rua',
        number: 'Número',
        city: 'Cidade',
        state: 'Estado'
      };
      return `${fieldNames[field]} é obrigatório`;
    }
    return '';
  };

  const validateForm = () => {
    const location = state.formData.location || {
      zip_code: '',
      country: '',
      street: '',
      number: '',
      city: '',
      state: ''
    };
    const fieldErrors = {
      zip_code: validateLocationField('zip_code', location.zip_code || ''),
      country: validateLocationField('country', location.country || ''),
      street: validateLocationField('street', location.street || ''),
      number: validateLocationField('number', location.number || ''),
      city: validateLocationField('city', location.city || ''),
      state: validateLocationField('state', location.state || '')
    };

    const isValid = Object.values(fieldErrors).every(error => error === '');
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 7, isValid }
    });

    // Always update errors for this step since it's called by useEffect
    setErrors(state.showErrors[7] ? fieldErrors : {
      zip_code: '',
      country: '',
      street: '',
      number: '',
      city: '',
      state: ''
    });

    return isValid;
  };

  const handleLocationChange = (field: string, value: string) => {
    const newLocation = {
      ...state.formData.location,
      [field]: value
    };
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        location: newLocation
      }
    });

    // Validate immediately with the new location data
    const fieldErrors = {
      zip_code: validateLocationField('zip_code', newLocation.zip_code || ''),
      country: validateLocationField('country', newLocation.country || ''),
      street: validateLocationField('street', newLocation.street || ''),
      number: validateLocationField('number', newLocation.number || ''),
      city: validateLocationField('city', newLocation.city || ''),
      state: validateLocationField('state', newLocation.state || '')
    };

    const isValid = Object.values(fieldErrors).every(error => error === '');
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 7, isValid }
    });

    // Only show errors if we're supposed to show errors for this step
    if (state.showErrors[7]) {
      setErrors(fieldErrors);
    } else {
      // Clear errors if we shouldn't show them
      setErrors({
        zip_code: '',
        country: '',
        street: '',
        number: '',
        city: '',
        state: ''
      });
    }
  };

  const countryOptions = [
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Peru', label: 'Peru' }
  ];

  // Validate on mount and when showErrors changes
  useEffect(() => {
    validateForm();
  }, [state.showErrors[7], state.formData.location]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.locationForm}>
        <div className={styles.locationRow}>
          <FormInput
            label="Zip code"
            value={state.formData.location?.zip_code || ''}
            onChange={(value) => handleLocationChange('zip_code', value)}
            placeholder="Insert Zip Code"
            required
            error={errors.zip_code}
          />
          
          <FormSelect
            label="Country"
            value={state.formData.location?.country || 'Brazil'}
            onChange={(value) => handleLocationChange('country', value)}
            options={countryOptions}
            required
            error={errors.country}
          />
        </div>

        <div className={styles.locationRowSingle}>
          <FormInput
            label="Street"
            value={state.formData.location?.street || ''}
            onChange={(value) => handleLocationChange('street', value)}
            placeholder="Insert your Street"
            required
            error={errors.street}
          />
        </div>

        <div className={styles.locationRowSingle}>
          <FormInput
            label="State"
            value={state.formData.location?.state || ''}
            onChange={(value) => handleLocationChange('state', value)}
            placeholder="São Paulo"
            required
            error={errors.state}
          />
        </div>

        <div className={styles.locationRow}>
          <FormInput
            label="Number"
            value={state.formData.location?.number || ''}
            onChange={(value) => handleLocationChange('number', value)}
            placeholder="Insert number"
            required
            error={errors.number}
          />
          
          <FormInput
            label="City"
            value={state.formData.location?.city || ''}
            onChange={(value) => handleLocationChange('city', value)}
            placeholder="São Paulo"
            required
            error={errors.city}
          />
        </div>
      </div>
    </div>
  );
}