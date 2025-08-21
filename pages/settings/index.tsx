// nity.zip/pages/settings/index.tsx
import React from 'react';
import SportCenterForm from '../../components/forms/SportCenterForm/SportCenterForm';
import { useAuth } from '../../src/contexts/AuthContext';
import styles from './Settings.module.css';
import Link from 'next/link';
import ExperienceForm from '../../components/forms/ExperienceForm/ExperienceForm';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.container}>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link href='/Auth/signin'>Fazer Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configurações da Conta</h1>
      <p className={styles.userInfo}>
        Logado como: {user.name} ({user.email})
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cadastrar Novo Sport Center</h2>
        <SportCenterForm />
        <ExperienceForm />
      </section>

      {/* Outras seções de configuração podem ser adicionadas aqui */}
    </div>
  );
}
