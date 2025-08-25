// components/layout/Footer.tsx
import styles from './Footer.module.css';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Mensagem à esquerda */}
        <div className={styles.footerLeft}>
          <span className={styles.footerQuestion}>
            ALGUMA DÚVIDA
            <br />
            OU SUGESTÃO?
          </span>
          <button className={styles.contactBtn}>Entre em contato</button>
        </div>

        {/* Colunas de links */}
        <div className={styles.footerLinks}>
          <div>
            <strong>Site map</strong>
            <ul>
              <li>Home</li>
              <li>Contato</li>
              <li>Eventos</li>
              <li>Teste</li>
              <li>Tour</li>
              <li>Sobre</li>
              <li>Mais um</li>
            </ul>
          </div>
          <div>
            <strong>Faça parte</strong>
            <ul>
              <li>Tenho um centro de treinamento</li>
              <li>Tenho uma hospedagem</li>
              <li>Tenho um tour</li>
              <li>Parcerias</li>
              <li>Tenho um serviço</li>
              <li>Seja um Scout</li>
            </ul>
          </div>
          <div>
            <strong>Contato</strong>
            <ul>
              <li>Emergência</li>
              <li>Ouvidoria</li>
              <li>Suporte</li>
              <li>Falar com a Nity</li>
              <li>Tenho um serviço</li>
              <li>Eventos</li>
            </ul>
          </div>
        </div>

        {/* Direita: sociais e selo */}
        <div className={styles.footerRight}>
          <div className={styles.socials}>
            <a href='#'>
              <Image
                src='/assets/instagram.png'
                alt='Instagram'
                width={20}
                height={20}
              />
            </a>
            <a href='#'>
              <Image
                src='/assets/facebook.png'
                alt='Facebook'
                width={10}
                height={20}
              />
            </a>
            <a href='#'>
              <Image
                src='/assets/linkedin.png'
                alt='LinkedIn'
                width={20}
                height={20}
              />
            </a>
            <a href='#'>
              <Image
                src='/assets/tiktok.png'
                alt='TikTok'
                width={17}
                height={20}
              />
            </a>
          </div>
          <div className={styles.safeSeal}>
            <Image
              src='/assets/shield.png'
              alt='Seguro'
              width={16}
              height={20}
            />
            <span>Site 100% Seguro</span>
          </div>
        </div>
      </div>

      {/* Logo grande no fundo */}
      <div className={styles.footerBgLogo}>
        <Image
          src='/assets/nity-logo-big.png'
          alt='NITY'
          width={1512}
          height={220}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'bottom'
          }}
        />
      </div>
    </footer>
  );
}
