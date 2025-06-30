import React, { useState } from 'react';
import { UserRole } from '../../../src/types/auth';
import styles from './RoleChangeForm.module.css';

interface RoleChangeFormProps {
  userId: string;
  currentRole: UserRole;
  userName: string;
  onSubmit: (userId: string, newRole: UserRole) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const RoleChangeForm: React.FC<RoleChangeFormProps> = ({
  userId,
  currentRole,
  userName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      [UserRole.SUPERUSER]: 'Super Usuário',
      [UserRole.MARKETING]: 'Marketing',
      [UserRole.OWNER]: 'Proprietário',
      [UserRole.USER]: 'Usuário',
      [UserRole.ATHLETE]: 'Atleta',
      [UserRole.SCOUT]: 'Scout'
    };
    return roleNames[role];
  };

  const getRoleDescription = (role: UserRole): string => {
    const descriptions = {
      [UserRole.SUPERUSER]: 'Acesso total: pode deletar usuários, criar experiências, gerenciar sport centers e modificar perfis',
      [UserRole.MARKETING]: 'Pode criar e gerenciar experiências e anúncios',
      [UserRole.OWNER]: 'Pode criar e gerenciar sport centers',
      [UserRole.USER]: 'Pode visualizar conteúdo e se inscrever em experiências',
      [UserRole.ATHLETE]: 'Pode se inscrever em experiências e visualizar sport centers',
      [UserRole.SCOUT]: 'Pode criar e gerenciar times'
    };
    return descriptions[role];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === currentRole) {
      onCancel();
      return;
    }

    try {
      await onSubmit(userId, selectedRole);
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(e.target.value as UserRole);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Alterar Perfil de Acesso</h2>
          <p className={styles.subtitle}>
            Usuário: <strong>{userName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.currentRole}>
            <span className={styles.label}>Perfil atual:</span>
            <span className={styles.currentRoleValue}>
              {getRoleDisplayName(currentRole)}
            </span>
          </div>

          <div className={styles.roleOptions}>
            <span className={styles.label}>Novo perfil:</span>
            {Object.values(UserRole).map(role => (
              <label key={role} className={styles.roleOption}>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={handleRoleChange}
                  disabled={isLoading}
                  className={styles.radioInput}
                />
                <div className={styles.roleContent}>
                  <div className={styles.roleName}>
                    {getRoleDisplayName(role)}
                  </div>
                  <div className={styles.roleDescription}>
                    {getRoleDescription(role)}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || selectedRole === currentRole}
            >
              {isLoading ? 'Alterando...' : 'Alterar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleChangeForm;