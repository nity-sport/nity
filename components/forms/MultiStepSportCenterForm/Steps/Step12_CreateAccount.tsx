import React from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

export function Step12_CreateAccount() {
  const { state, dispatch } = useMultiStepForm();

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
                className={styles.accountInput}
                placeholder="Seu nome"
              />
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
                className={styles.accountInput}
                placeholder="Seu sobrenome"
              />
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
              className={styles.accountInput}
              placeholder="Digite seu e-mail"
            />
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
              className={styles.accountInput}
              placeholder="Digite sua senha"
            />
          </div>
        </form>
      </div>
    </div>
  );
}