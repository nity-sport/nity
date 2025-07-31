import React, { useEffect, useState } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import baseStyles from './styles/BaseStep.module.css';
import styles from './styles/Step12.module.css';

export function Step12_CreateAccount() {
  const { state, dispatch } = useMultiStepForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        if (!value || value.trim().length === 0) {
          return 'Nome é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        return '';
      case 'lastName':
        if (!value || value.trim().length === 0) {
          return 'Sobrenome é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Sobrenome deve ter pelo menos 2 caracteres';
        }
        return '';
      case 'email':
        if (!value || value.trim().length === 0) {
          return 'E-mail é obrigatório';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'E-mail inválido';
        }
        return '';
      case 'password':
        if (!value || value.length === 0) {
          return 'Senha é obrigatória';
        }
        if (value.length < 6) {
          return 'Senha deve ter pelo menos 6 caracteres';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = () => {
    const accountData = state.formData.accountData || {};
    const newErrors: Record<string, string> = {};

    ['firstName', 'lastName', 'email', 'password'].forEach(field => {
      const error = validateField(field, accountData[field as keyof typeof accountData] || '');
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  };

  const updateStepValidation = () => {
    const accountData = state.formData.accountData;
    if (!accountData) {
      dispatch({
        type: 'SET_STEP_VALID',
        payload: { stepIndex: 14, isValid: false }
      });
      return;
    }

    const allFieldsFilled = (['firstName', 'lastName', 'email', 'password'] as const).every(
      field => {
        const value = accountData[field];
        return value && value.trim().length > 0;
      }
    );
    const validationErrors = validateAllFields();
    const isValid = allFieldsFilled && Object.keys(validationErrors).length === 0;

    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 14, isValid } // Step12_CreateAccount is index 14
    });

    // Only show errors if we're supposed to show errors for this step
    if (state.showErrors[14]) {
      setErrors(validationErrors);
    } else {
      setErrors({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        accountData: {
          ...state.formData.accountData,
          [name]: value
        }
      }
    });
  };

  // Update validation when data changes
  useEffect(() => {
    updateStepValidation();
  }, [state.formData.accountData, state.showErrors[14]]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.createAccountContainer}>

        <div className={styles.socialButtons}>
          <button className={styles.socialButton} type="button">
            <img src="/assets/google-icon.svg" alt="Google" className={styles.socialIcon} />
            <span>Entrar com Google</span>
          </button>
          <button className={styles.socialButton} type="button">
            <img src="/assets/apple-icon.svg" alt="Apple" className={styles.socialIcon} />
            <span>Entrar com Apple</span>
          </button>
        </div>

        <div className={styles.separator}>
          <span>ou</span>
        </div>

        <form className={styles.accountForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.accountLabel}>
                Nome
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={state.formData.accountData?.firstName || ''}
                onChange={handleChange}
                className={`${styles.accountInput} ${errors.firstName ? styles.inputError : ''}`}
                placeholder="Seu nome"
              />
              {errors.firstName && <div className={styles.errorMessage}>{errors.firstName}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.accountLabel}>
                Sobrenome
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={state.formData.accountData?.lastName || ''}
                onChange={handleChange}
                className={`${styles.accountInput} ${errors.lastName ? styles.inputError : ''}`}
                placeholder="Seu sobrenome"
              />
              {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.accountLabel}>
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={state.formData.accountData?.email || ''}
              onChange={handleChange}
              className={`${styles.accountInput} ${errors.email ? styles.inputError : ''}`}
              placeholder="Digite seu e-mail"
            />
            {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.accountLabel}>
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={state.formData.accountData?.password || ''}
              onChange={handleChange}
              className={`${styles.accountInput} ${errors.password ? styles.inputError : ''}`}
              placeholder="Digite sua senha"
            />
            {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}