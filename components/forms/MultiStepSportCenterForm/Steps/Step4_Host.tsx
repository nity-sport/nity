import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

export function Step4_Host() {
  const { state, dispatch } = useMultiStepForm();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    hosterName: '',
    hostBio: '',
    hosterImage: ''
  });

  const validateHostName = (name: string): string => {
    if (!name || name.trim().length === 0) {
      return 'Nome do host é obrigatório';
    }
    if (name.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (name.trim().length > 100) {
      return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  };

  const validateHostBio = (bio: string): string => {
    if (!bio || bio.trim().length === 0) {
      return 'Bio do host é obrigatória';
    }
    if (bio.trim().length < 10) {
      return 'Bio deve ter pelo menos 10 caracteres';
    }
    if (bio.trim().length > 500) {
      return 'Bio deve ter no máximo 500 caracteres';
    }
    return '';
  };

  const validateHostImage = (image: File | string | undefined): string => {
    if (!image) {
      return 'Foto do host é obrigatória';
    }
    return '';
  };

  const validateForm = () => {
    const nameError = validateHostName(state.formData.hosterName || '');
    const bioError = validateHostBio(state.formData.hostBio || '');
    const imageError = validateHostImage(state.formData.hosterImage);

    const isValid = !nameError && !bioError && !imageError;
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 3, isValid }
    });

    // Only show errors if we're supposed to show errors for this step
    if (state.showErrors[3]) {
      setErrors({
        hosterName: nameError,
        hostBio: bioError,
        hosterImage: imageError
      });
    } else {
      setErrors({
        hosterName: '',
        hostBio: '',
        hosterImage: ''
      });
    }

    return isValid;
  };

  const handleHostNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        hosterName: value
      }
    });

    // Validate immediately for navigation
    const nameError = validateHostName(value);
    const bioError = validateHostBio(state.formData.hostBio || '');
    const imageError = validateHostImage(state.formData.hosterImage);
    const isValid = !nameError && !bioError && !imageError;

    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 3, isValid }
    });

    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[3]) {
      setErrors(prev => ({ ...prev, hosterName: nameError }));
    }
  };

  const handleHostBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        hostBio: value
      }
    });

    // Validate immediately for navigation
    const nameError = validateHostName(state.formData.hosterName || '');
    const bioError = validateHostBio(value);
    const imageError = validateHostImage(state.formData.hosterImage);
    const isValid = !nameError && !bioError && !imageError;

    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 3, isValid }
    });

    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[3]) {
      setErrors(prev => ({ ...prev, hostBio: bioError }));
    }
  };

  const handleHostPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        if (state.showErrors[3]) {
          setErrors(prev => ({ ...prev, hosterImage: 'Arquivo muito grande. Limite de 5MB.' }));
        }
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        if (state.showErrors[3]) {
          setErrors(prev => ({ ...prev, hosterImage: 'Formato não suportado. Use JPEG, PNG, WEBP ou AVIF.' }));
        }
        return;
      }

      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          hosterImage: file
        }
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Validate immediately for navigation
      const nameError = validateHostName(state.formData.hosterName || '');
      const bioError = validateHostBio(state.formData.hostBio || '');
      const imageError = ''; // File is valid if we got here
      const isValid = !nameError && !bioError && !imageError;

      dispatch({
        type: 'SET_STEP_VALID',
        payload: { stepIndex: 3, isValid }
      });

      // Clear image error
      setErrors(prev => ({ ...prev, hosterImage: '' }));
    }
  };

  // Set preview image if file exists
  useEffect(() => {
    if (state.formData.hosterImage && state.formData.hosterImage instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(state.formData.hosterImage);
    }
  }, [state.formData.hosterImage]);

  // Validate on mount and when showErrors changes
  useEffect(() => {
    validateForm();
  }, [state.showErrors[3], state.formData.hosterName, state.formData.hostBio, state.formData.hosterImage]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.hostContainer}>
        <div className={styles.hostPhotoSection}>
          <label className={styles.hostPhotoLabel}>Choose a profile photo</label>
          <div className={styles.hostPhotoUpload}>
            <input
              type="file"
              id="hostPhoto"
              accept="image/*"
              onChange={handleHostPhotoUpload}
              className={styles.fileInput}
            />
            <label htmlFor="hostPhoto" className={`${styles.hostPhotoArea} ${errors.hosterImage ? styles.inputError : ''}`}>
              <div className={styles.hostPhotoPlaceholder}>
                {previewImage ? (
                  <div className={styles.hostPhotoContainer}>
                    <img 
                      src={previewImage} 
                      alt="Host preview" 
                      className={styles.hostPhotoPreview}
                    />
                    <div className={styles.hostPhotoAdd}>+</div>
                  </div>
                ) : (
                  <div className={styles.hostPhotoContainer}>
                    <div className={styles.hostPhotoIcon}>N</div>
                    <div className={styles.hostPhotoAdd}>+</div>
                  </div>
                )}
                <div className={styles.hostNameSection}>
                  <input
                    type="text"
                    value={state.formData.hosterName || ''}
                    onChange={handleHostNameChange}
                    className={`${styles.hostNameInput} ${errors.hosterName ? styles.inputError : ''}`}
                    placeholder="Hoster name"
                  />
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className={styles.hostInfoSection}>
          <div className={styles.hostBioSection}>
            <label className={styles.hostBioLabel}>Hoster bio</label>
            <div className={styles.hostBioContainer}>
              <textarea
                value={state.formData.hostBio || ''}
                onChange={handleHostBioChange}
                className={`${styles.hostBioInput} ${errors.hostBio ? styles.inputError : ''}`}
                placeholder="Insert a hoster bio"
                rows={4}
              />
              {errors.hostBio && <div className={styles.errorMessage}>{errors.hostBio}</div>}
              <div className={styles.characterCount}>
                {(state.formData.hostBio || '').length}/500 caracteres
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}