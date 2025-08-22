// components/sections/Hero.tsx
import styles from './Hero.module.css';

import HeroSearchBar from './HeroSearchBar';
import { useEffect, useState } from 'react';

export default function Hero() {
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
    <>
      <section
        className={`${styles.hero} ${isMobile ? styles.mobileHero : ''}`}
      >
        {!isMobile ? (
          <video
            className={styles.videoBackground}
            src='/videos/nityHero.mp4'
            autoPlay
            loop
            muted
            playsInline
          ></video>
        ) : (
          <div className={styles.mobileBackground}></div>
        )}
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h1 className={styles.title}>YOUR SPORTRAVEL</h1>
        </div>
        {!isMobile && <HeroSearchBar />}
      </section>

      {isMobile && <HeroSearchBar />}
    </>
  );
}
