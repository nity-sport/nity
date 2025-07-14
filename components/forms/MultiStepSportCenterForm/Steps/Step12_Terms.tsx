import React, { useState } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import { Checkbox } from '../FormComponents';
import { useAuth } from '../../../../src/contexts/AuthContext';
import styles from './Steps.module.css';

export function Step12_Terms() {
  const { state, dispatch } = useMultiStepForm();
  const { checkAuthStatus } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTermsChange = async (accepted: boolean) => {
    console.log('📋 Terms changed:', accepted);
    setTermsAccepted(accepted);
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        termsAccepted: accepted
      }
    });

    // Create account when terms are accepted
    if (accepted && state.formData.accountData) {
      console.log('👤 Creating user account...');
      await createUserAccount();
    }
  };

  const createUserAccount = async () => {
    if (!state.formData.accountData) {
      setError('Dados da conta não encontrados');
      return;
    }

    const { firstName, lastName, email, password } = state.formData.accountData;

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email: email,
          password: password,
          role: 'OWNER'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in form state for SportCenter creation
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            userAccount: {
              token: data.token,
              user: data.user
            }
          }
        });
        
        // Store in localStorage for immediate authentication
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force AuthContext to refresh and recognize the new user
        await checkAuthStatus();
        
        setError('');
      } else {
        setError(data.message || 'Falha no registro');
      }
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.formSection}>
        <div className={styles.termsSection}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.termsContent}>
            <h3>Termos de Uso</h3>
            <p>Ao usar nossa plataforma, você concorda em seguir nossos termos e condições. Você é responsável por manter a confidencialidade de sua conta e senha.</p>
            
            <h3>Política de Privacidade</h3>
            <p>Respeitamos sua privacidade e nos comprometemos a proteger suas informações pessoais. Coletamos apenas as informações necessárias para fornecer nossos serviços.</p>
            
            <h3>Taxas e Pagamentos</h3>
            <p>As taxas aplicáveis serão claramente informadas antes de qualquer cobrança. Você será notificado sobre mudanças nas taxas com antecedência.</p>
            
            <h3>Responsabilidades</h3>
            <p>Você é responsável por fornecer informações precisas e atualizadas sobre seu centro esportivo. Conteúdo inadequado ou enganoso pode resultar na suspensão da conta.</p>
          </div>
          
          <Checkbox
            label="Concordo com todos os Termos, Política de Privacidade e Taxas"
            checked={termsAccepted}
            onChange={handleTermsChange}
          />
          
          {loading && (
            <div className={styles.loadingMessage}>
              Criando sua conta...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}