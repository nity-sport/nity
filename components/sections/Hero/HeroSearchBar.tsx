import styles from './HeroSearchBar.module.css';
import { useEffect, useState } from 'react';

export default function HeroSearchBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detecta se é um dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Verifica no carregamento e em mudanças de tamanho da tela
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`${styles.container} ${isMobile ? styles.mobileContainer : ''}`}
    >
      <form
        className={`${styles.searchBar} ${isMobile ? styles.mobileSearchBar : ''}`}
      >
        <div className={styles.inputGroupSport}>
          <span className={styles.label}>Sport</span>
          <span className={styles.placeholder}>Select your sport</span>
        </div>
        <div className={styles.inputGroup}>
          <span className={styles.label}>Date</span>
          <span className={styles.placeholder}>Add dates</span>
        </div>
        <div className={styles.inputGroup}>
          <span className={styles.label}>Age</span>
          <span className={styles.placeholder}>Add age</span>
        </div>
        <div className={styles.inputGroup}>
          <span className={styles.label}>Category</span>
          <span className={styles.placeholder}>Add category</span>
        </div>
        <div className={styles.inputGroup}>
          <span className={styles.label}>Who</span>
          <span className={styles.placeholder}>Add coaches</span>
        </div>
        <button type='submit' className={styles.submitBtn} aria-label='Search'>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3'
              stroke='white'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
