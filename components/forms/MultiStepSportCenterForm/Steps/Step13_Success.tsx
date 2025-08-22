import React from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';

import styles from './Steps.module.css'; // TODO: Create Step13.module.css

export function Step13_Success() {
  const { state } = useMultiStepForm();

  const handleGoToDashboard = () => {
    window.location.href = '/owner/dashboard';
  };

  const sportCenterName = state.formData.name || 'Nome do sportcenter';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.successContent}>
        <div className={styles.successIcon}>
          <svg
            width='48'
            height='48'
            viewBox='0 0 48 48'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M20 32L12 24L14.83 21.17L20 26.34L33.17 13.17L36 16L20 32Z'
              fill='#10B981'
            />
          </svg>
        </div>

        <h2 className={styles.successTitle}>
          PARABÉNS EQUIPE {sportCenterName.toUpperCase()} SEU CADASTRO FOI
          REALIZADO
        </h2>

        <button
          className={styles.dashboardButton}
          onClick={handleGoToDashboard}
        >
          Ir para painel
        </button>
      </div>
    </div>
  );
}
