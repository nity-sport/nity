// src/components/sections/TrainingCentersSection/TrainingCenterCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './TrainingCenterCard.module.css';
import { SportCenterType } from '../../../src/types/sportcenter'; // Ajuste o caminho se necessário

interface TrainingCenterCardProps {
  center: SportCenterType & { _id?: string }; // Adicionando _id opcional se vier do banco
}

export default function TrainingCenterCard({ center }: TrainingCenterCardProps) {
  const displayCategory = center.category?.join(', ') || center.yearOfFoundation || 'N/A';
  const displaySports = center.sport?.join(', ') || 'N/A';

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {center.mainPhoto ? (
          <Image
            src={center.mainPhoto}
            alt={`Imagem de ${center.name}`}
            layout="fill"
            objectFit="cover"
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>Sem Imagem Principal</div>
        )}
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.rowTop}>
          <div className={styles.clubInfo}>
            {center.profilePhoto && (
              <div className={styles.clubLogo}>
                <Image
                  src={center.profilePhoto}
                  alt={`Logo de ${center.name}`}
                  width={30}
                  height={30}
                  objectFit="cover"
                />
              </div>
            )}
            <div>
              <h3 className={styles.clubName}>{center.name}</h3>
              <p className={styles.clubLocation}>
                {center.location.city}, {center.location.state}
              </p>
            </div>
          </div>
          {center.hosterName && (
  <div className={styles.hosterInfo}>
    {center.hosterImage && (
      <div className={styles.hosterAvatar}>
        <Image
          src={center.hosterImage}
          alt={center.hosterName}
          width={32}
          height={32}
          className={styles.hosterAvatarImage} // Garanta que esta classe aplique object-fit: cover e border-radius se necessário
        />
      </div>
    )}
    {/* Contêiner para o texto */}
    <div className={styles.hosterTextContainer}>
      <span className={styles.hosterLabel}>Hoster</span>
      <p className={styles.hosterName}>{center.hosterName}</p>
      {/* Supondo que você tenha um dado como center.hosterSince */}
      {center.hosterSince && (
        <span className={styles.hosterDetail}>{center.hosterSince}</span>
      )}
    </div>
  </div>
)}
        </div>
        <div className={styles.rowBottom}>
          <div className={styles.details}>
            <p className={styles.detailItem}>
              <span className={styles.detailIcon}> {/* Ícone para Sports */} </span>
              Sports: {displaySports}
            </p>
            <p className={styles.detailItem}>
              <span className={styles.detailIcon}> {/* Ícone para Categorias */} </span>
              Categorias: {displayCategory}
            </p>
          </div>
          {center._id && (
            <Link
              href={`/sport-centers/${center._id}`}
              className={styles.goToClubButton} 
            >
              Go to Club{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}