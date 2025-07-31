import React, { useState, useEffect } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import { FormInput, FormSelect } from '../FormComponents';
import { CategoryType } from '../../../../src/types/sportcenter';
import baseStyles from './styles/BaseStep.module.css';
import styles from './styles/Step9.module.css';

export function Step9_Categories() {
  const { state, dispatch } = useMultiStepForm();
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([
    {
      id: '1',
      name: 'Sub 14',
      ageRange: [13, 14],
      gender: 'Masculino',
      schedule: {
        days: ['Seg', 'Qua', 'Sex'],
        times: ['14:30', '16:00']
      }
    },
    {
      id: '2',
      name: 'Sub 16',
      ageRange: [15, 16], 
      gender: 'Feminino',
      schedule: {
        days: ['Ter', 'Qui'],
        times: ['14:30', '18:00']
      }
    },
    {
      id: '3',
      name: 'Sub 16',
      ageRange: [15, 16],
      gender: 'Masculino',
      schedule: {
        days: ['Seg', 'Qua'],
        times: ['16:00', '17:30']
      }
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [newCategory, setNewCategory] = useState<Partial<CategoryType>>({
    name: '',
    ageRange: [],
    gender: 'Masculino',
    schedule: {
      days: [],
      times: []
    }
  });

  const validateCategories = (categoriesList: CategoryType[]): string => {
    // Categories are optional - always valid
    return '';
  };

  const updateValidation = (categoriesList: CategoryType[]) => {
    const validationError = validateCategories(categoriesList);
    
    dispatch({
      type: 'SET_STEP_VALID',
      payload: { stepIndex: 8, isValid: validationError === '' }
    });
    
    // Only show error if we're supposed to show errors for this step
    if (state.showErrors[8]) {
      setError(validationError);
    } else {
      setError('');
    }
  };

  const ageOptions = [
    { value: 9, label: '<10' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' },
    { value: 13, label: '13' },
    { value: 14, label: '14' },
    { value: 15, label: '15' },
    { value: 16, label: '16' },
    { value: 17, label: '17' },
    { value: 18, label: '18' },
    { value: 19, label: '>18' }
  ];

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Misto', label: 'Misto' }
  ];

  const dayOptions = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const handleAddCategory = () => {
    if (newCategory.name?.trim() && newCategory.ageRange?.length && newCategory.schedule?.days.length && newCategory.schedule?.times?.length) {
      const categoryToAdd: CategoryType = {
        id: `category-${Date.now()}`,
        name: newCategory.name.trim(),
        ageRange: newCategory.ageRange,
        gender: newCategory.gender || 'Masculino',
        schedule: {
          days: newCategory.schedule.days,
          times: newCategory.schedule.times || []
        }
      };
      
      const updatedCategories = [...categories, categoryToAdd];
      setCategories(updatedCategories);
      
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          categories: updatedCategories
        }
      });
      
      setNewCategory({
        name: '',
        ageRange: [],
        gender: 'Masculino',
        schedule: {
          days: [],
          times: []
        }
      });
      setNewTimeInput('');
      setShowAddModal(false);
      
      // Update validation after adding category
      updateValidation(updatedCategories);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        categories: updatedCategories
      }
    });
    
    setShowDeleteModal(null);
    
    // Update validation after deleting category
    updateValidation(updatedCategories);
  };

  const handleAgeToggle = (age: number) => {
    const currentAges = newCategory.ageRange || [];
    const isSelected = currentAges.includes(age);
    
    if (isSelected) {
      setNewCategory(prev => ({
        ...prev,
        ageRange: currentAges.filter(a => a !== age)
      }));
    } else {
      setNewCategory(prev => ({
        ...prev,
        ageRange: [...currentAges, age].sort((a, b) => a - b)
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    const currentDays = newCategory.schedule?.days || [];
    const isSelected = currentDays.includes(day);
    
    if (isSelected) {
      setNewCategory(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          days: currentDays.filter(d => d !== day)
        }
      }));
    } else {
      setNewCategory(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          days: [...currentDays, day]
        }
      }));
    }
  };

  const handleAddTime = () => {
    if (newTimeInput.trim() && !newCategory.schedule?.times?.includes(newTimeInput)) {
      setNewCategory(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          times: [...(prev.schedule?.times || []), newTimeInput]
        }
      }));
      setNewTimeInput('');
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setNewCategory(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        times: prev.schedule?.times?.filter(time => time !== timeToRemove) || []
      }
    }));
  };

  const handleEditCategory = (categoryId: string) => {
    const categoryToEdit = categories.find(c => c.id === categoryId);
    if (categoryToEdit) {
      setNewCategory({
        name: categoryToEdit.name,
        ageRange: categoryToEdit.ageRange,
        gender: categoryToEdit.gender,
        schedule: {
          days: categoryToEdit.schedule.days,
          times: categoryToEdit.schedule.times
        }
      });
      setShowEditModal(categoryId);
    }
  };

  const handleUpdateCategory = () => {
    if (showEditModal && newCategory.name?.trim() && newCategory.ageRange?.length && newCategory.schedule?.days.length && newCategory.schedule?.times?.length) {
      const updatedCategories = categories.map(category => 
        category.id === showEditModal 
          ? {
              ...category,
              name: newCategory.name!.trim(),
              ageRange: newCategory.ageRange!,
              gender: newCategory.gender!,
              schedule: {
                days: newCategory.schedule!.days,
                times: newCategory.schedule!.times
              }
            }
          : category
      );
      
      setCategories(updatedCategories);
      
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          categories: updatedCategories
        }
      });
      
      setNewCategory({
        name: '',
        ageRange: [],
        gender: 'Masculino',
        schedule: {
          days: [],
          times: []
        }
      });
      setNewTimeInput('');
      setShowEditModal(null);
      
      // Update validation after editing category
      updateValidation(updatedCategories);
    }
  };

  const handleClearForm = () => {
    setNewCategory({
      name: '',
      ageRange: [],
      gender: 'Masculino',
      schedule: {
        days: [],
        times: []
      }
    });
    setNewTimeInput('');
  };

  // Validate on mount and when categories change
  useEffect(() => {
    updateValidation(categories);
  }, [categories, state.showErrors[8]]);

  // Initial validation on mount
  useEffect(() => {
    // Update form data with initial categories
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        categories: categories
      }
    });
    updateValidation(categories);
  }, []);

  return (
    <div className={styles.stepContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.categoriesContainer}>
        <div className={styles.categoriesGrid}>
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categoryCardSelected : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <div className={styles.categoryCardHeader}>
                <h4 className={styles.categoryCardName}>{category.name}</h4>
                <span className={styles.categoryCardAge}>
                  {category.ageRange.join(', ')} anos
                </span>
                <button
                  className={styles.categoryDeleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(category.id);
                  }}
                >
                  ×
                </button>
                {selectedCategory === category.id && (
                  <button
                    className={styles.categoryEditButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category.id);
                    }}
                  >
                    ✏️
                  </button>
                )}
              </div>
              
              <div className={styles.categoryCardContent}>
                <div className={styles.categoryGenderIcons}>
                  <span className={`${styles.genderIcon} ${category.gender === 'Masculino' || category.gender === 'Misto' ? styles.genderIconActive : ''}`}>
                    ♂
                  </span>
                  <span className={`${styles.genderIcon} ${category.gender === 'Feminino' || category.gender === 'Misto' ? styles.genderIconActive : ''}`}>
                    ♀
                  </span>
                </div>
                <div className={styles.categoryScheduleInfo}>
                  <div className={styles.categoryScheduleRow}>
                    <span className={styles.categoryScheduleIcon}>📅</span>
                    <span className={styles.categoryScheduleText}>
                      {category.schedule.days.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className={styles.addCategoryCard} onClick={() => setShowAddModal(true)}>
            <div className={styles.addCategoryContent}>
              <span className={styles.addCategoryIcon}>+</span>
              <span className={styles.addCategoryText}>Adicione categoria</span>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.modalCloseButton}
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>
            
            <h3 className={styles.modalTitle}>Adicione uma Categoria</h3>
            
            <div className={styles.modalForm}>
              <FormInput
                label="Nome da Categoria"
                value={newCategory.name || ''}
                onChange={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
                placeholder="Ex: Sub14"
              />

              <div className={styles.ageSelector}>
                <label className={styles.modalLabel}>Quais idades essa categoria contempla</label>
                <div className={styles.ageGrid}>
                  {ageOptions.map(age => (
                    <div
                      key={age.label}
                      className={`${styles.ageOption} ${
                        newCategory.ageRange?.includes(age.value) ? styles.selected : ''
                      }`}
                      onClick={() => handleAgeToggle(age.value)}
                    >
                      {age.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.genderSelector}>
                <label className={styles.modalLabel}>Gênero</label>
                <div className={styles.genderGrid}>
                  {genderOptions.map(gender => (
                    <div
                      key={gender.value}
                      className={`${styles.genderOption} ${
                        newCategory.gender === gender.value ? styles.selected : ''
                      }`}
                      onClick={() => setNewCategory(prev => ({ ...prev, gender: gender.value as any }))}
                    >
                      {gender.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.scheduleSelector}>
                <label className={styles.modalLabel}>Quais dias e horários</label>
                <div className={styles.dayGrid}>
                  {dayOptions.map(day => (
                    <div
                      key={day}
                      className={`${styles.dayOption} ${
                        newCategory.schedule?.days.includes(day) ? styles.selected : ''
                      }`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className={styles.timeInputs}>
                  <div className={styles.timeInputGroup}>
                    {newCategory.schedule?.times?.map((time, index) => (
                      <div key={index} className={styles.timeChip}>
                        <span className={styles.timeText}>{time}</span>
                        <button
                          className={styles.removeTimeButton}
                          onClick={() => handleRemoveTime(time)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    <FormInput
                      label=""
                      value={newTimeInput}
                      onChange={setNewTimeInput}
                      type="time"
                      placeholder="14:30"
                    />
                    <button 
                      className={styles.addTimeButton}
                      onClick={handleAddTime}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalButtonContainer}>
              <button 
                className={styles.modalClearButton}
                onClick={handleClearForm}
                title="Limpar formulário"
              >
                🗑️
              </button>
              <button 
                className={styles.modalAddButton}
                onClick={handleAddCategory}
              >
                Adicionar categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.modalCloseButton}
              onClick={() => setShowEditModal(null)}
            >
              ×
            </button>
            
            <h3 className={styles.modalTitle}>Editar Categoria</h3>
            
            <div className={styles.modalForm}>
              <FormInput
                label="Nome da Categoria"
                value={newCategory.name || ''}
                onChange={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
                placeholder="Ex: Sub14"
              />

              <div className={styles.ageSelector}>
                <label className={styles.modalLabel}>Quais idades essa categoria contempla</label>
                <div className={styles.ageGrid}>
                  {ageOptions.map(age => (
                    <div
                      key={age.label}
                      className={`${styles.ageOption} ${
                        newCategory.ageRange?.includes(age.value) ? styles.selected : ''
                      }`}
                      onClick={() => handleAgeToggle(age.value)}
                    >
                      {age.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.genderSelector}>
                <label className={styles.modalLabel}>Gênero</label>
                <div className={styles.genderGrid}>
                  {genderOptions.map(gender => (
                    <div
                      key={gender.value}
                      className={`${styles.genderOption} ${
                        newCategory.gender === gender.value ? styles.selected : ''
                      }`}
                      onClick={() => setNewCategory(prev => ({ ...prev, gender: gender.value as any }))}
                    >
                      {gender.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.scheduleSelector}>
                <label className={styles.modalLabel}>Quais dias e horários</label>
                <div className={styles.dayGrid}>
                  {dayOptions.map(day => (
                    <div
                      key={day}
                      className={`${styles.dayOption} ${
                        newCategory.schedule?.days.includes(day) ? styles.selected : ''
                      }`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className={styles.timeInputs}>
                  <div className={styles.timeInputGroup}>
                    {newCategory.schedule?.times?.map((time, index) => (
                      <div key={index} className={styles.timeChip}>
                        <span className={styles.timeText}>{time}</span>
                        <button
                          className={styles.removeTimeButton}
                          onClick={() => handleRemoveTime(time)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    <FormInput
                      label=""
                      value={newTimeInput}
                      onChange={setNewTimeInput}
                      type="time"
                      placeholder="14:30"
                    />
                    <button 
                      className={styles.addTimeButton}
                      onClick={handleAddTime}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalButtonContainer}>
              <button 
                className={styles.modalClearButton}
                onClick={handleClearForm}
                title="Limpar formulário"
              >
                🗑️
              </button>
              <button 
                className={styles.modalAddButton}
                onClick={handleUpdateCategory}
              >
                Atualizar categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.deleteModal}>
          <div className={styles.deleteModalContent}>
            <button 
              className={styles.deleteModalCloseButton}
              onClick={() => setShowDeleteModal(null)}
            >
              ×
            </button>
            
            <div className={styles.deleteModalIcon}>
              <div className={styles.deleteModalIconCircle}>
                !
              </div>
            </div>
            
            <h3 className={styles.deleteModalTitle}>TEM CERTEZA QUE DESEJA EXCLUIR CATEGORIA?</h3>
            
            <div className={styles.deleteModalActions}>
              <button 
                className={styles.deleteModalCancelButton}
                onClick={() => setShowDeleteModal(null)}
              >
                Não, cancelar
              </button>
              <button 
                className={styles.deleteModalConfirmButton}
                onClick={() => handleDeleteCategory(showDeleteModal)}
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