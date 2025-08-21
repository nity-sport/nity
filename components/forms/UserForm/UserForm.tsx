import React, { useState } from 'react';
import { UserRole } from '../../../src/types/auth';
import { getRoleDisplayName } from '../../../src/utils/userRole';
import styles from './UserForm.module.css';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
  showRoleSelection?: boolean;
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialData = {},
  isEditing = false,
  showRoleSelection = true,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData.name || '',
    email: initialData.email || '',
    password: '',
    role: initialData.role || UserRole.USER,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor='name' className={styles.label}>
          Nome *
        </label>
        <input
          id='name'
          name='name'
          type='text'
          value={formData.name}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='email' className={styles.label}>
          Email *
        </label>
        <input
          id='email'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='password' className={styles.label}>
          {isEditing
            ? 'Nova Senha (deixe vazio para manter a atual)'
            : 'Senha *'}
        </label>
        <input
          id='password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          disabled={isLoading}
        />
        {errors.password && (
          <span className={styles.error}>{errors.password}</span>
        )}
      </div>

      {showRoleSelection && (
        <div className={styles.formGroup}>
          <label htmlFor='role' className={styles.label}>
            Perfil de Acesso *
          </label>
          <select
            id='role'
            name='role'
            value={formData.role}
            onChange={handleInputChange}
            className={styles.select}
            disabled={isLoading}
          >
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type='submit'
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}{' '}
          Usuário
        </button>
      </div>
    </form>
  );
};

export default UserForm;
