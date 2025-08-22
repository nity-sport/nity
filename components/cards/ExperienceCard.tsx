import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExperienceType } from '../../src/types/experience'; // Ajuste o caminho se necessário
import styles from './ExperienceCard.module.css';
import { Clock, MapPin, Tag as TagIcon } from 'lucide-react'; // Ícones para tags

interface ExperienceCardProps {
  experience: ExperienceType;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const displayLocation =
    experience.location && experience.location.name
      ? `${experience.location.name}`
      : 'Local não informado';
  const displayTag =
    experience.tags && experience.tags.length > 0
      ? experience.tags[0]
      : experience.category;

  return (
    <Link href={`/experiences/${experience._id}`} legacyBehavior>
      <a className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={experience.coverImage || '/assets/placeholder-image.png'} // Use um placeholder se não houver imagem
            alt={experience.title}
            layout='fill'
            objectFit='cover'
            className={styles.image}
          />
          <div className={styles.durationBadge}>
            <Clock size={14} />
            <span>{experience.duration || '3 horas'}</span>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <div className={styles.textInfo}>
              <h3 className={styles.title}>{experience.title}</h3>
              <div className={styles.infoRow}>
                <MapPin size={14} className={styles.icon} />
                <p className={styles.location}>{displayLocation}</p>
              </div>
              <div className={styles.infoRow}>
                <TagIcon size={14} className={styles.icon} />
                <p className={styles.category}>{displayTag}</p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ExperienceCard;
