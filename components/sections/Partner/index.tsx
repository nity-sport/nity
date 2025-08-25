import styles from './PartnerSection.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function PartnerSection() {
  return (
    <section className={styles.partnerSection}>
      {/* Camada Azul */}
      <div className={styles.blueBox}>
        <div className={styles.partnerContent}>
          <h2 className={styles.partnerTitle}>
            BECOME A<br />
            NITY PARTNER
          </h2>
          <p className={styles.partnerDesc}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam,
          </p>
          <Link href='/register-scout'>
            <button className={styles.partnerBtn}>Be a Scout &rarr;</button>
          </Link>
        </div>
      </div>
      {/* Imagem */}
      <div className={styles.partnerImgWrapper}>
        <Image
          src='/assets/partner.png'
          alt='Parceira Nity'
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 800px) 100vw, 516px'
        />
      </div>
    </section>
  );
}
