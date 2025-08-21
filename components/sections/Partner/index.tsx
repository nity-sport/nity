import styles from './PartnerSection.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function PartnerSection() {
  const arrows = [
    { y: 110, width: 900 },
    { y: 200, width: 970 },
    { y: 290, width: 1120 },
    { y: 380, width: 980 },
    { y: 470, width: 1060 },
  ];
  return (
    <section className={styles.partnerSection}>
      {/* Arrows SVG wrapper - FORA do blueBox */}
      <div className={styles.arrowsWrapper}>
        <svg className={styles.arrows} width='1800' height='580'>
          {arrows.map((arrow, idx) => (
            <g key={idx}>
              <line
                x1='0'
                y1={arrow.y}
                x2={arrow.width}
                y2={arrow.y}
                stroke='#4892E6'
                strokeWidth='9'
                opacity='0.19'
              />
              <polyline
                points={`
                  ${arrow.width - 40},${arrow.y - 28}
                  ${arrow.width},${arrow.y}
                  ${arrow.width - 40},${arrow.y + 28}
                `}
                stroke='#4892E6'
                strokeWidth='9'
                fill='none'
                opacity='0.19'
              />
            </g>
          ))}
        </svg>
      </div>
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
