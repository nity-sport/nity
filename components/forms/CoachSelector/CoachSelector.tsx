import React, { useState, useEffect } from 'react';
import styles from './CoachSelector.module.css';
import { CoachType } from '../../../src/types/coach';

interface Coach extends CoachType {
  _id: string;
}

interface CoachSelectorProps {
  selectedCoaches: string[]; // Array of coach IDs
  onSelectionChange: (coachIds: string[]) => void;
  label?: string;
  multiple?: boolean;
}

export default function CoachSelector({
  selectedCoaches,
  onSelectionChange,
  label = 'Coaches',
  multiple = true,
}: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coach?public=true&limit=100'); // Get all coaches for selection

      if (!response.ok) {
        throw new Error('Erro ao carregar coaches');
      }

      const data = await response.json();
      setCoaches(data.coaches || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoachToggle = (coachId: string) => {
    if (multiple) {
      // Multiple selection mode
      const isSelected = selectedCoaches.includes(coachId);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedCoaches.filter(id => id !== coachId);
      } else {
        newSelection = [...selectedCoaches, coachId];
      }

      onSelectionChange(newSelection);
    } else {
      // Single selection mode
      onSelectionChange([coachId]);
    }
  };

  const renderCoachImage = (coach: Coach) => {
    if (coach.profileImage) {
      return (
        <img
          src={coach.profileImage}
          alt={coach.name}
          className={styles.coachImage}
        />
      );
    }

    // Default avatar for coaches without profile image
    return (
      <div className={styles.defaultAvatar}>
        <svg
          className={styles.avatarIcon}
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <div className={styles.loading}>Carregando coaches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <div className={styles.error}>Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}{' '}
        {multiple &&
          `(${selectedCoaches.length} selecionado${selectedCoaches.length !== 1 ? 's' : ''})`}
      </label>

      <div className={styles.coachesGrid}>
        {coaches.map(coach => {
          const isSelected = selectedCoaches.includes(coach._id);

          return (
            <div
              key={coach._id}
              className={`${styles.coachCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleCoachToggle(coach._id)}
            >
              <div className={styles.coachContent}>
                <div className={styles.imageContainer}>
                  {renderCoachImage(coach)}
                </div>
                <div className={styles.coachInfo}>
                  <span className={styles.coachName}>{coach.name}</span>
                  {coach.age && (
                    <span className={styles.coachAge}>Idade: {coach.age}</span>
                  )}
                  {coach.miniBio && (
                    <span className={styles.coachBio}>{coach.miniBio}</span>
                  )}
                </div>

                {/* Checkbox/Radio indicator */}
                <div className={styles.selectionIndicator}>
                  {multiple ? (
                    <div
                      className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}
                    >
                      {isSelected && (
                        <svg viewBox='0 0 24 24' className={styles.checkIcon}>
                          <path
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='3'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M20 6L9 17l-5-5'
                          />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`${styles.radio} ${isSelected ? styles.checked : ''}`}
                    >
                      {isSelected && <div className={styles.radioDot}></div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {coaches.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhum coach disponível.</p>
          <p>Entre em contato com um administrador para adicionar coaches.</p>
        </div>
      )}
    </div>
  );
}
