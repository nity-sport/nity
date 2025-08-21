import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SportCenterForm from '../../../../components/forms/SportCenterForm/SportCenterForm';
import { useAuth } from '../../../../src/contexts/AuthContext';
import styles from './edit.module.css';

export default function EditSportCenter() {
  const {
    user,
    isAuthenticated,
    canManageSportCenters,
    isSuperuser,
    isLoading,
  } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [sportCenter, setSportCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !canManageSportCenters)) {
      router.push('/');
      return;
    }

    if (id && typeof id === 'string') {
      fetchSportCenter(id);
    }
  }, [isAuthenticated, canManageSportCenters, isLoading, router, id]);

  const fetchSportCenter = async (sportCenterId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`/api/sportcenter/${sportCenterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('SportCenter não encontrado');
      }

      const data = await response.json();

      // Handle new standardized API response format
      const sportCenter = data.success ? data.data : data;

      // Verifica se o usuário tem permissão para editar este sportcenter específico
      if (user && sportCenter.owner !== user.id && !isSuperuser) {
        setError('Você não tem permissão para editar este SportCenter');
        return;
      }

      setSportCenter(sportCenter);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !canManageSportCenters) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Erro</h1>
          <p>{error}</p>
          <Link href='/admin/sportcenters' className={styles.backButton}>
            ← Voltar para SportCenters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Editar SportCenter</h1>
          {sportCenter && (
            <div className={styles.titleInfo}>
              <p className={styles.subtitle}>
                Editando: {(sportCenter as any).name}
              </p>
              {user && (sportCenter as any).owner === user.id ? (
                <span className={styles.ownSportCenter}>Seu SportCenter</span>
              ) : isSuperuser ? (
                <span className={styles.adminAccess}>
                  Acesso de Administrador
                </span>
              ) : null}
            </div>
          )}
        </div>
        <Link href='/admin/sportcenters' className={styles.backButton}>
          ← Voltar para SportCenters
        </Link>
      </div>

      {sportCenter && (
        <div className={styles.formContainer}>
          <SportCenterForm
            initialData={sportCenter}
            mode='edit'
            onSuccess={() => {
              alert('SportCenter atualizado com sucesso!');
              router.push('/admin/sportcenters');
            }}
          />
        </div>
      )}
    </div>
  );
}
