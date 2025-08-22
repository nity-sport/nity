// src/components/sections/TrainingCentersSection/TrainingCenterCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './TrainingCenterCard.module.css';
import { SportCenterType } from '../../../src/types/sportcenter'; // Ajuste o caminho se necessário

interface TrainingCenterCardProps {
  center: SportCenterType & { _id?: string }; // Adicionando _id opcional se vier do banco
}

export default function TrainingCenterCard({
  center,
}: TrainingCenterCardProps) {
  const displayCategory = center.categories?.length > 0
    ? center.categories.map(cat => typeof cat === 'string' ? cat : cat.name || cat.toString()).join(', ')
    : center.yearOfFoundation || 'N/A';
  const displaySports = center.sport?.length > 0
    ? center.sport.map(sport => typeof sport === 'string' ? sport : sport.name || sport.toString()).join(', ')
    : 'N/A';

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {center.mainPhoto ? (
          <Image
            src={center.mainPhoto}
            alt={`Imagem de ${center.name}`}
            layout='fill'
            objectFit='cover'
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>Sem Imagem Principal</div>
        )}
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.mainRow}>
          {/* Brasão */}
          <div className={styles.clubLogo}>
            {center.profilePhoto ? (
              <Image
                src={center.profilePhoto}
                alt={`Logo de ${center.name}`}
                width={58}
                height={58}
                objectFit='cover'
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                {center.name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            )}
          </div>
          
          {/* Nome e cidade */}
          <div className={styles.clubInfo}>
            <h3 className={styles.clubName}>{center.name}</h3>
            {(center.location.city || center.location.state) && (
              <p className={styles.clubLocation}>
                {center.location.city}{center.location.state && `, ${center.location.state}`}
              </p>
            )}
          </div>
          
          {/* Sports */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Sports</span>
            <span className={styles.infoValue}>{displaySports}</span>
          </div>
          
          {/* Categorias */}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Categorias</span>
            <span className={styles.infoValue}>{displayCategory}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
