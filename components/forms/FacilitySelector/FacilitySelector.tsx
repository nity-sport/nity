import React, { useState, useEffect } from 'react';
import styles from './FacilitySelector.module.css';
import { FacilityType } from '../../../src/types/facility';

interface Facility extends FacilityType {
  _id: string;
}

interface FacilitySelectorProps {
  selectedFacilities: string[]; // Array of facility IDs
  onSelectionChange: (facilityIds: string[]) => void;
  label?: string;
  multiple?: boolean;
}

export default function FacilitySelector({
  selectedFacilities,
  onSelectionChange,
  label = 'Facilities',
  multiple = true,
}: FacilitySelectorProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facilities');

      if (!response.ok) {
        throw new Error('Erro ao carregar facilities');
      }

      const data = await response.json();
      setFacilities(data.facilities || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facilityId: string) => {
    if (multiple) {
      // Multiple selection mode
      const isSelected = selectedFacilities.includes(facilityId);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedFacilities.filter(id => id !== facilityId);
      } else {
        newSelection = [...selectedFacilities, facilityId];
      }

      onSelectionChange(newSelection);
    } else {
      // Single selection mode
      onSelectionChange([facilityId]);
    }
  };

  const renderFacilityIcon = (facility: Facility) => {
    if (facility.icon) {
      return (
        <img
          src={facility.icon}
          alt={facility.name}
          className={styles.facilityIcon}
        />
      );
    }

    // Default SVG icon for facilities without custom icon
    return (
      <svg
        className={styles.facilityIcon}
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M12 2L2 7L12 12L22 7L12 2Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2 17L12 22L22 17'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2 12L12 17L22 12'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <div className={styles.loading}>Carregando facilities...</div>
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
          `(${selectedFacilities.length} selecionada${selectedFacilities.length !== 1 ? 's' : ''})`}
      </label>

      <div className={styles.facilitiesGrid}>
        {facilities.map(facility => {
          const isSelected = selectedFacilities.includes(facility._id);

          return (
            <div
              key={facility._id}
              className={`${styles.facilityCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleFacilityToggle(facility._id)}
            >
              <div className={styles.facilityContent}>
                <div className={styles.iconContainer}>
                  {renderFacilityIcon(facility)}
                </div>
                <span className={styles.facilityName}>{facility.name}</span>

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

      {facilities.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma facility disponível.</p>
          <p>
            Entre em contato com um administrador para adicionar facilities.
          </p>
        </div>
      )}
    </div>
  );
}
