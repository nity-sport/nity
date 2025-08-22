import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Auth/Auth.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { ref, team } = router.query;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          ...(ref && { referralCode: ref }),
          ...(team && { teamId: team }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // If user was invited to a team, show success message
        if (ref && team) {
          alert('Welcome! You have been successfully added to the team.');
        }

        router.push('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (ref && team) {
      return 'JOIN THE TEAM';
    }
    return 'CREATE AN ACCOUNT';
  };

  const getSubtitle = () => {
    if (ref && team) {
      return 'You have been invited to join a team on Nity';
    }
    return 'Join the Nity community';
  };

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
          <h1 className={styles.title}>{getTitle()}</h1>
          <p className={styles.subtitle}>{getSubtitle()}</p>
          <p className={styles.subtitle}>
            Already have an account?{' '}
            <Link href='/Auth/signin' className={styles.link}>
              Log in
            </Link>
          </p>
        </div>

        {ref && (
          <div className={styles.inviteInfo}>
            <p>
              🎉 You're registering with referral code: <strong>{ref}</strong>
            </p>
            {team && (
              <p>
                You'll be automatically added to the team after registration!
              </p>
            )}
          </div>
        )}

        <div className={styles.socialButtons}>
          <button className={styles.socialButton}>
            <span>
              <img
                src='/assets/google-icon.svg'
                alt='Google Icon'
                style={{ width: '20px', height: '20px' }}
              />
            </span>{' '}
            Sign in with Google
          </button>
          <button className={styles.socialButton}>
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
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor='firstName' className={styles.label}>
                First Name
              </label>
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder='Your first name'
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor='lastName' className={styles.label}>
                Last Name
              </label>
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                required
                placeholder='Your last name'
              />
            </div>
          </div>

          <div className={styles.formGroup}>
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
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='password' className={styles.label}>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder='Enter your Password'
            />
          </div>

          <div className={styles.terms}>
            <input type='checkbox' id='terms' required />
            <label htmlFor='terms'>
              I agree to all Term, Privacy Policy and Fees
            </label>
          </div>

          <button
            type='submit'
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>
      </div>
    </div>
  );
}
