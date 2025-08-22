import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';

import styles from './styles/Step6.module.css';

interface Achievement {
  id: string;
  name: string;
  year: number;
}

export function Step6_Achievements() {
  const { state, dispatch } = useMultiStepForm();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [noAchievements, setNoAchievements] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newAchievementName, setNewAchievementName] = useState('');
  const [newAchievementYear, setNewAchievementYear] = useState('');
  const [error, setError] = useState('');

  const updateValidation = (
    achievementsList?: Achievement[],
    noAchievementsState?: boolean
  ) => {
    // Use parameters if provided, otherwise use current state
    const currentAchievements =
      achievementsList !== undefined ? achievementsList : achievements;
    const currentNoAchievements =
      noAchievementsState !== undefined ? noAchievementsState : noAchievements;

    // Step is valid if they have achievements OR they've checked "no achievements"
    const isValid = currentAchievements.length > 0 || currentNoAchievements;
    const errorMessage = !isValid
      ? 'Adicione pelo menos uma conquista ou marque "Não possuímos conquistas ainda"'
      : '';

    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 5, isValid },
    });

    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[5]) {
      setError(errorMessage);
    } else {
      setError('');
    }
  };

  const handleAddAchievement = () => {
    if (newAchievementName.trim() && newAchievementYear.trim()) {
      const newAchievement: Achievement = {
        id: `achievement-${Date.now()}`,
        name: newAchievementName.trim(),
        year: parseInt(newAchievementYear),
      };

      const updatedAchievements = [...achievements, newAchievement];
      setAchievements(updatedAchievements);

      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          achievements: updatedAchievements.map(a => `${a.name} (${a.year})`),
        },
      });

      setNewAchievementName('');
      setNewAchievementYear('');
      setShowAddModal(false);

      // Update validation after adding achievement
      updateValidation(updatedAchievements, noAchievements);
    }
  };

  const handleDeleteAchievement = (achievementId: string) => {
    const updatedAchievements = achievements.filter(
      a => a.id !== achievementId
    );
    setAchievements(updatedAchievements);

    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        achievements: updatedAchievements.map(a => `${a.name} (${a.year})`),
      },
    });

    setShowDeleteModal(null);

    // Update validation after deleting achievement
    updateValidation(updatedAchievements, noAchievements);
  };

  const handleNoAchievementsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setNoAchievements(checked);

    let finalAchievements = achievements;

    if (checked) {
      finalAchievements = [];
      setAchievements([]);
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          achievements: [],
        },
      });
    }

    // Update validation immediately with the new states
    updateValidation(finalAchievements, checked);
  };

  // Validate on mount and when achievements/noAchievements change
  useEffect(() => {
    updateValidation();
  }, [achievements, noAchievements, state.showErrors[5]]);

  // Initial validation on mount
  useEffect(() => {
    updateValidation();
  }, []);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.achievementsSection}>
        {/* Lista de conquistas */}
        {achievements.length > 0 && (
          <div className={styles.achievementsList}>
            {achievements.map(achievement => (
              <div key={achievement.id} className={styles.achievementItem}>
                <div className={styles.achievementContent}>
                  <span className={styles.achievementName}>
                    {achievement.name}
                  </span>
                  <span className={styles.achievementYear}>
                    {achievement.year}
                  </span>
                </div>
                <div className={styles.achievementActions}>
                  <button className={styles.editAchievementButton}>✏️</button>
                  <button
                    className={styles.deleteAchievementButton}
                    onClick={() => setShowDeleteModal(achievement.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className={styles.addAchievementButton}
          onClick={() => setShowAddModal(true)}
        >
          <span className={styles.addAchievementIcon}>+</span>
          <span className={styles.addAchievementText}>Adicionar conquista</span>
        </button>

        <div className={styles.noAchievementsContainer}>
          <label className={styles.noAchievementsLabel}>
            <input
              type='checkbox'
              checked={noAchievements}
              onChange={handleNoAchievementsChange}
              className={styles.noAchievementsCheckbox}
            />
            <span className={styles.noAchievementsText}>
              Não possuimos conquistas ainda
            </span>
          </label>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <p className={styles.achievementsNote}>
          Essas informações poderão ser editadas depois
        </p>
      </div>

      {/* Modal Adicionar Conquista */}
      {showAddModal && (
        <div
          className={styles.achievementModal}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className={styles.achievementModalContent}
            onClick={e => e.stopPropagation()}
          >
            <button
              className={styles.achievementModalCloseButton}
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>
            <div className={styles.achievementModalIcon}>
              <img
                src='/assets/rewarded_ads.png'
                alt='Trophy'
                className={styles.trophyIcon}
              />
            </div>
            <div className={styles.achievementModalForm}>
              <div className={styles.achievementModalField}>
                <label className={styles.achievementModalLabel}>
                  Nome da conquista
                </label>
                <input
                  type='text'
                  value={newAchievementName}
                  onChange={e => setNewAchievementName(e.target.value)}
                  placeholder='Insira o nome da conquista'
                  className={styles.achievementModalInput}
                />
              </div>
              <div className={styles.achievementModalField}>
                <label className={styles.achievementModalLabel}>
                  Ano da conquista
                </label>
                <input
                  type='number'
                  value={newAchievementYear}
                  onChange={e => setNewAchievementYear(e.target.value)}
                  placeholder='Insira o ano'
                  className={styles.achievementModalInput}
                />
              </div>
              <button
                className={styles.achievementModalAddButton}
                onClick={handleAddAchievement}
              >
                Adicionar conquista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Conquista */}
      {showDeleteModal && (
        <div
          className={styles.achievementModal}
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            className={styles.achievementModalContent}
            onClick={e => e.stopPropagation()}
          >
            <button
              className={styles.achievementModalCloseButton}
              onClick={() => setShowDeleteModal(null)}
            >
              ×
            </button>
            <div className={styles.achievementModalIcon}>
              <div className={styles.achievementModalIconCircle}>!</div>
            </div>
            <h3 className={styles.achievementModalTitle}>
              Tem certeza que deseja excluir conquista?
            </h3>
            <div className={styles.achievementModalActions}>
              <button
                className={styles.achievementModalCancelButton}
                onClick={() => setShowDeleteModal(null)}
              >
                Não, cancelar
              </button>
              <button
                className={styles.achievementModalConfirmButton}
                onClick={() => handleDeleteAchievement(showDeleteModal)}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
