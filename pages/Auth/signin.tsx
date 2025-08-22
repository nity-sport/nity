import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Auth.module.css';
import { useAuth } from '../../src/contexts/AuthContext';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  // const [loading, setLoading] = useState(false); // O useAuth já tem isLoading
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isLoading: authLoading, loginWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      // Confirmado como "Login failed"

      let displayMessage = 'Login failed. Please try again.';

      if (err && err.message) {
        const lowerCaseMessage = err.message.toLowerCase();

        // Ajuste a condição para verificar a mensagem que você está recebendo
        if (lowerCaseMessage === 'login failed') {
          // <--- MUDANÇA AQUI
          displayMessage =
            'Invalid email or password. Please check your details and try again.';
        } else if (
          lowerCaseMessage.includes('email and password are required')
        ) {
          displayMessage = 'Please fill in your email and password.';
        }
        // Adicione mais 'else if' para outras mensagens de erro específicas, se houver.
        else {
          displayMessage = 'Unable to log in. Try again later';
          // O console.error("Login API error:", err.message) não é mais necessário aqui
          // pois você já logou err.message acima.
        }
      }
      setError(displayMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      // O backend e o AuthProvider cuidarão do redirecionamento e estado
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    }
  };

  // Adicione uma função similar para handleFacebookSignIn se necessário

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className={styles.container}>
      <div className={styles.leftImage}>
        <img
          src='/assets/auth-bg.svg'
          alt='Background'
          className={styles.bgImage}
        />
      </div>

      <div className={styles.rightForm}>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>NICE TO SEE</h1>
          <h1 className={styles.title}>YOU AGAIN</h1>
          <p className={styles.subtitle}>PLEASE LOGIN INTO YOUR NITY ACCOUNT</p>
        </div>
        <div className={styles.socialButtons}>
          {/* Atualize para usar as funções do useAuth se disponíveis */}
          <button
            className={styles.socialButton}
            onClick={handleGoogleSignIn}
            disabled={authLoading}
          >
            <span>
              <img
                src='/assets/google-icon.svg'
                alt='Google Icon'
                style={{ width: '20px', height: '20px' }}
              />
            </span>{' '}
            Sign in with Google
          </button>
          <button
            className={styles.socialButton}
            /* onClick={handleFacebookSignIn} */ disabled={authLoading}
          >
            <span>
              <img
                src='/assets/apple-icon.svg'
                alt='Apple Icon'
                style={{ width: '20px', height: '20px' }}
              />
            </span>{' '}
            Sign in with Apple
          </button>
        </div>

        <div className={styles.separator}>
          <span>or</span>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ... (campos de email e senha como antes) ... */}
          <label htmlFor='email' className={styles.label}>
            E-mail
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
            placeholder='Enter your E-mail'
            disabled={authLoading}
          />

          <label htmlFor='password' className={styles.label}>
            Password
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder='Enter your Password'
              disabled={authLoading}
            />
            <button
              type='button'
              onClick={toggleShowPassword}
              className={styles.eyeButton}
              aria-label='Toggle password visibility'
              disabled={authLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button
              type='button'
              onClick={() => setShowForgotPasswordModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4da6ff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
              }}
            >
              Forgot your password?
            </button>
          </div>

          <button
            type='submit'
            disabled={authLoading} // Usar o isLoading do contexto
            className={styles.submitButton}
          >
            {authLoading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p className={styles.signUpText}>
          Don't you have an account?{' '}
          <Link href='/Auth/signup' className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}
