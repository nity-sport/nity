import React from 'react';
import { useMultiStepForm } from './MultiStepFormProvider';
import styles from './StepNavigation.module.css';

interface StepNavigationProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  children?: React.ReactNode;
}

export function StepNavigation({ onCancel, onSubmit, children }: StepNavigationProps) {
  const { state, nextStep, previousStep, isFirstStep, isLastStep, canProceed } = useMultiStepForm();

  const progressPercentage = ((state.currentStep + 1) / state.steps.length) * 100;
  
  // Check if we're on the success step (Step13_Success)
  const isSuccessStep = state.currentStep === state.steps.length - 1;

  const handleBackButton = () => {
    if (isFirstStep) {
      // On first step, use the original onCancel (should exit form)
      onCancel?.();
    } else {
      // On other steps, go to previous step
      previousStep();
    }
  };

  return (
    <div className={styles.fullContainer}>
      {/* Main Form Container */}
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <span className={styles.formSubtitle}>CADASTRE SEU CENTRO ESPORTIVO</span>
          <h1 className={styles.formTitle}>{state.steps[state.currentStep]?.title.toUpperCase()}</h1>
        </div>

        {/* Form Content Area */}
        <div className={styles.formContent}>
          {children}
        </div>

        {/* Bottom Navigation - Hide on success step */}
        {!isSuccessStep && (
          <div className={styles.bottomNavigation}>
            <div className={styles.buttonContainer}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleBackButton}
              >
                {isFirstStep ? 'Cancelar' : 'Voltar'}
              </button>

              <button
                type="button"
                className={styles.continueButton}
                disabled={!canProceed}
                onClick={() => {
                  console.log('🔘 Continue button clicked');
                  console.log('🔍 Current step:', state.currentStep);
                  console.log('🆔 Current step ID:', state.steps[state.currentStep]?.id);
                  console.log('✅ Can proceed:', canProceed);
                  console.log('🏁 Is last step:', isLastStep);
                  console.log('📊 Valid steps:', state.validSteps);
                  console.log('🔍 Current step valid:', state.validSteps[state.currentStep]);
                  console.log('🎯 Step is optional:', state.steps[state.currentStep]?.isOptional);
                  
                  // Check if we're on the Terms step (Step16 - index 15)
                  const currentStepId = state.steps[state.currentStep]?.id;
                  if (currentStepId === 16) {
                    console.log('📋 Terms step - triggering submission');
                    // Terms step should trigger submission
                    onSubmit?.();
                  } else if (isLastStep) {
                    console.log('🏁 Last step - triggering submission');
                    onSubmit?.();
                  } else {
                    console.log('➡️ Regular step - moving to next');
                    nextStep();
                  }
                }}
              >
                {(() => {
                  const currentStepId = state.steps[state.currentStep]?.id;
                  if (currentStepId === 16) return 'Finalizar';
                  return isLastStep ? 'Finalizar' : 'Continuar';
                })()}
              </button>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.timer}>
                <span className={styles.clockIcon}>🕐</span>
                <span className={styles.timeLeft}>4</span>
                <span className={styles.timeLabel}> min</span>
              </div>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}