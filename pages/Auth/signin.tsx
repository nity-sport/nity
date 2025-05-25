import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import styles from './Auth.module.css';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className={styles.container}>
      <div className={styles.leftImage}>
        <img src="/assets/auth-bg.svg" alt="Background" className={styles.bgImage} />
      </div>

      <div className={styles.rightForm}>
        
      <div className={styles.authHeader}>
        <h1 className={styles.title}>NICE TO SEE YOU AGAIN</h1>
        <p className={styles.subtitle}>PLEASE LOGIN INTO YOUR NITY ACCOUNT</p>
        </div>
        <div className={styles.socialButtons}>
          <button className={styles.socialButton}>
            <span><img src="/assets/google-icon.svg" alt="Google Icon" style={{ width: '20px', height: '20px' }} /></span> Sign in with Google
          </button>
          <button className={styles.socialButton}>
            <span><img src="/assets/apple-icon.svg" alt="Apple Icon" style={{ width: '20px', height: '20px' }} /></span> Sign in with Apple
          </button>
        </div>

        <div className={styles.separator}>
          <span>or</span>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
            placeholder="Enter your E-mail"
          />

          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Enter your Password"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className={styles.eyeButton}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p className={styles.signUpText}>
          Don't you have an account?{' '}
          <Link href="/Auth/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
