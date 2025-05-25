import styles from './AboutSection.module.css';
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.content}>
        <span className={styles.subtitle}>ABOUT US</span>
        <h2 className={styles.title}>NITY SPORTING</h2>
        <p className={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <button className={styles.ctaBtn}>MEET NITY</button>
      </div>

      {/* Overlay bold text */}
      <div className={styles.overlayText1}>
      <span className={styles.outline}>BLEM </span>
        <span className={styles.solid}>THE PROBLEM </span>
        <span className={styles.outline}>THE PROBLEM </span>
        <span className={styles.outline}>THE PROBLEM </span>
      </div>
      <div className={styles.overlayText2}>
      <span className={styles.outline}>E HAVE </span>
      <span className={styles.outline}>WE HAVE </span>
        <span className={styles.solid}>WE HAVE </span>
        <span className={styles.outline}>WE HAVE </span>
        <span className={styles.outline}>WE HAVE </span>

      </div>
      <div className={styles.overlayText3}>
      <span className={styles.outline}>SOLVE </span>
        <span className={styles.outline}>TO SOLVE</span>
        <span className={styles.outline}>TO SOLVE </span>
        <span className={styles.solid}>TO SOLVE </span>
        <span className={styles.outline}>TO SOLVE </span>
        <span className={styles.outline}>TO SOLVE </span>
      </div>

      <div className={styles.imagesRow}>
        <div className={styles.imgBox}>
          <Image src="/assets/about-1.png" alt="Corrida" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={`${styles.imgBox} ${styles.imgBoxCenter}`}>
          <Image src="/assets/about-2.png" alt="Homem Sorrindo" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.imgBox}>
          <Image src="/assets/about-3.png" alt="Volei" fill style={{ objectFit: 'cover' }} />
        </div>
      </div>
    </section>
  );
}
