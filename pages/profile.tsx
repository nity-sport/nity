import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { UserRole } from '../src/types/auth';
import Link from 'next/link';
import styles from './settings/Settings.module.css';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isSuperuser, canCreateExperiences } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <h1>Acesso negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link href="/Auth/signin">Fazer login</Link>
      </div>
    );
  }

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      [UserRole.SUPERUSER]: 'Super Usuário',
      [UserRole.MARKETING]: 'Marketing',
      [UserRole.OWNER]: 'Proprietário',
      [UserRole.USER]: 'Usuário',
      [UserRole.ATHLETE]: 'Atleta'
    };
    return roleNames[role];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meu Perfil</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Informações Pessoais</h2>
          <div className={styles.field}>
            <label>Nome:</label>
            <span>{user?.name}</span>
          </div>
          <div className={styles.field}>
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className={styles.field}>
            <label>Perfil:</label>
            <span>{getRoleDisplayName(user!.role)}</span>
          </div>
          <div className={styles.field}>
            <label>Provedor:</label>
            <span>{user?.provider}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/settings" className={styles.button}>
            Editar Perfil
          </Link>
          
          {isSuperuser && (
            <Link href="/admin/users" className={styles.button}>
              Administrar Usuários
            </Link>
          )}
          
          {canCreateExperiences && (
            <Link href="/admin/experiences" className={styles.button}>
              Gerenciar Experiências
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;