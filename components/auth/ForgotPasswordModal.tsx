import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './ForgotPasswordModal.module.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setStep('password');
    } else {
      setError('Please enter a valid 6-digit code');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 'email' && 'Forgot Password'}
            {step === 'code' && 'Enter Verification Code'}
            {step === 'password' && 'Create New Password'}
            {step === 'success' && 'Password Reset Successful'}
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <p className={styles.description}>
                Enter your email address and we'll send you a verification code
                to reset your password.
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor='email' className={styles.label}>
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder='Enter your email'
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type='submit'
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit}>
              <p className={styles.description}>
                We've sent a 6-digit verification code to{' '}
                <strong>{email}</strong>. Enter the code below to continue.
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor='code' className={styles.label}>
                  Verification Code
                </label>
                <input
                  type='text'
                  id='code'
                  value={code}
                  onChange={e =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className={styles.codeInput}
                  placeholder='000000'
                  maxLength={6}
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type='submit'
                className={styles.submitButton}
                disabled={code.length !== 6}
              >
                Verify Code
              </button>

              <button
                type='button'
                onClick={() => setStep('email')}
                className={styles.backButton}
              >
                Back to Email
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <p className={styles.description}>
                Create a new password for your account.
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor='newPassword' className={styles.label}>
                  New Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='newPassword'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className={styles.input}
                    placeholder='Enter new password'
                    required
                    disabled={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor='confirmPassword' className={styles.label}>
                  Confirm New Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder='Confirm new password'
                    required
                    disabled={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                type='submit'
                className={styles.submitButton}
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type='button'
                onClick={() => setStep('code')}
                className={styles.backButton}
              >
                Back to Code
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className={styles.successContent}>
              <div className={styles.successIcon}>✓</div>
              <p className={styles.successMessage}>
                Your password has been reset successfully! You can now sign in
                with your new password.
              </p>
              <button onClick={handleClose} className={styles.submitButton}>
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
