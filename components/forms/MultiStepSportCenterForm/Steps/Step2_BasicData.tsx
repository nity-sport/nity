import React, { useEffect, useState } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import { FormInput, FormSelect, FileUpload } from '../FormComponents';
import styles from './Steps.module.css';

export function Step2_BasicData() {
  const { state, dispatch } = useMultiStepForm();
  const [errors, setErrors] = useState({
    yearOfFoundation: '',
    sportcenterBio: '',
    logo: ''
  });

  const validateYear = (year: string): string => {
    if (!year || year.trim() === '') {
      return 'Ano de fundação é obrigatório';
    }
    
    // Check if it's a valid 4-digit format (YYYY)
    const yearRegex = /^\d{1,4}$/;
    if (!yearRegex.test(year.trim())) {
      return 'Digite um ano válido';
    }
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return 'Digite um ano válido';
    }
    
    // Allow any year from 1 to current year (no future dates)
    if (yearNum < 1 || yearNum > new Date().getFullYear()) {
      return 'Digite um ano válido';
    }
    
    return '';
  };

  const validateDescription = (description: string): string => {
    if (!description || description.trim() === '') {
      return 'Descrição é obrigatória';
    }
    if (description.trim().length < 20) {
      return 'Descrição deve ter pelo menos 20 caracteres';
    }
    if (description.trim().length > 500) {
      return 'Descrição deve ter no máximo 500 caracteres';
    }
    return '';
  };

  const validateForm = () => {
    const yearError = validateYear(state.formData.yearOfFoundation || '');
    const descError = validateDescription(state.formData.sportcenterBio || '');
    
    const isValid = !yearError && !descError;
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 1, isValid }
    });
    
    // Only show errors if we're supposed to show errors for this step
    if (state.showErrors[1]) {
      setErrors({
        yearOfFoundation: yearError,
        sportcenterBio: descError,
        logo: ''
      });
    } else {
      setErrors({
        yearOfFoundation: '',
        sportcenterBio: '',
        logo: ''
      });
    }
    
    return isValid;
  };

  const handleFoundationYearChange = (year: string) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { yearOfFoundation: year }
    });
    
    // Validate immediately for navigation
    const yearError = validateYear(year);
    const descError = validateDescription(state.formData.sportcenterBio || '');
    const isValid = !yearError && !descError;
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 1, isValid }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[1]) {
      setErrors(prev => ({ ...prev, yearOfFoundation: yearError }));
    }
  };

  const handleDescriptionChange = (description: string) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { sportcenterBio: description }
    });
    
    // Validate immediately for navigation
    const yearError = validateYear(state.formData.yearOfFoundation || '');
    const descError = validateDescription(description);
    const isValid = !yearError && !descError;
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 1, isValid }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[1]) {
      setErrors(prev => ({ ...prev, sportcenterBio: descError }));
    }
  };

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const logoFile = files[0];
      
      // Validação básica de tamanho (1MB)
      if (logoFile.size > 1024 * 1024) {
        if (state.showErrors[1]) {
          setErrors(prev => ({ ...prev, logo: 'Arquivo muito grande. Limite de 1MB.' }));
        }
        return;
      }
      
      // Validação de formato
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(logoFile.type)) {
        if (state.showErrors[1]) {
          setErrors(prev => ({ ...prev, logo: 'Formato não suportado. Use JPEG, PNG, WEBP ou AVIF.' }));
        }
        return;
      }
      
      setErrors(prev => ({ ...prev, logo: '' }));
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: { logo: logoFile }
      });
      
      validateForm();
    }
  };

  // Validate on mount and when showErrors changes
  useEffect(() => {
    validateForm();
  }, [state.showErrors[1], state.formData.yearOfFoundation, state.formData.sportcenterBio]);

  const getLogoPreview = () => {
    if (state.formData.logo && state.formData.logo instanceof File) {
      return URL.createObjectURL(state.formData.logo);
    }
    return null;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className={styles.stepContainer}>
      <div className={styles.basicDataForm}>
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Ano de fundação</label>
          <input
            type="text"
            value={state.formData.yearOfFoundation || ''}
            onChange={(e) => handleFoundationYearChange(e.target.value)}
            placeholder="Insira o ano"
            className={`${styles.textInput} ${errors.yearOfFoundation ? styles.inputError : ''}`}
            required
          />
          {errors.yearOfFoundation && <div className={styles.errorMessage}>{errors.yearOfFoundation}</div>}
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Descrição do Centro esportivo</label>
          <textarea
            value={state.formData.sportcenterBio || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Descreva o seu centro esportivo"
            className={`${styles.textareaInput} ${errors.sportcenterBio ? styles.inputError : ''}`}
            rows={4}
            required
          />
          {errors.sportcenterBio && <div className={styles.errorMessage}>{errors.sportcenterBio}</div>}
          <div className={styles.characterCount}>
            {(state.formData.sportcenterBio || '').length}/500 caracteres
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.fieldLabel}>Brasão / Logomarca do Centro</label>
          <div className={styles.logoUploadContainer}>
            <div className={styles.logoUploadArea}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => handleLogoUpload(e.target.files)}
                className={styles.fileInput}
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className={styles.logoUploadLabel}>
                {getLogoPreview() ? (
                  <img 
                    src={getLogoPreview() || ''} 
                    alt="Logo preview" 
                    className={styles.logoPreview}
                  />
                ) : (
                  <span className={styles.logoUploadButton}>+</span>
                )}
              </label>
            </div>
            <div className={styles.logoUploadInfo}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => handleLogoUpload(e.target.files)}
                className={styles.fileInput}
                id="logo-upload-button"
              />
              <label htmlFor="logo-upload-button" className={styles.uploadButton}>
                {getLogoPreview() ? 'Alterar arquivo' : 'Inserir arquivo'}
              </label>
              <div className={styles.logoUploadHint}>
                Limite de 1MB, formatos (JPEG, WEBP, AVIF, PNG)
              </div>
            </div>
          </div>
          {errors.logo && <div className={styles.errorMessage}>{errors.logo}</div>}
        </div>
      </div>
    </div>
  );
}