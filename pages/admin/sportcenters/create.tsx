import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SportCenterForm from '../../../components/forms/SportCenterForm/SportCenterForm';
import { useAuth } from '../../../src/contexts/AuthContext';
import styles from './create.module.css';

export default function CreateSportCenter() {
  const { isAuthenticated, canManageSportCenters, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !canManageSportCenters)) {
      router.push('/');
    }
  }, [isAuthenticated, canManageSportCenters, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !canManageSportCenters) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Create New SportCenter</h1>
          <p className={styles.subtitle}>Fill in the information below to create a new SportCenter</p>
        </div>
        <Link href="/admin/sportcenters" className={styles.backButton}>
          ← Back to SportCenters
        </Link>
      </div>

      <div className={styles.formContainer}>
        <SportCenterForm />
      </div>
    </div>
  );
}