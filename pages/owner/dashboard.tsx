import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalSportCenters: number;
  totalFacilities: number;
  totalCoaches: number;
  averageExperienceCost: number;
  totalDormitoryCapacity: number;
  sportCentersWithDormitory: number;
}

interface SportCenter {
  _id: string;
  name: string;
  sport: string[];
  dormitory: boolean;
  experienceCost?: number;
  facilities?: any[];
  coaches?: any[];
}

const OwnerDashboard: React.FC = () => {
  const { user, canManageSportCenters, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSportCenters: 0,
    totalFacilities: 0,
    totalCoaches: 0,
    averageExperienceCost: 0,
    totalDormitoryCapacity: 0,
    sportCentersWithDormitory: 0
  });
  const [recentSportCenters, setRecentSportCenters] = useState<SportCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManageSportCenters) {
      setError('Acesso negado. Apenas owners podem acessar esta página.');
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [canManageSportCenters, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch all sport centers for the owner
      const response = await fetch('/api/sportcenter', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const data = await response.json();
      const sportCenters = data.sportCenters || [];

      // Calculate statistics
      const calculatedStats: DashboardStats = {
        totalSportCenters: sportCenters.length,
        totalFacilities: sportCenters.reduce((sum: number, sc: any) => sum + (sc.facilities?.length || 0), 0),
        totalCoaches: sportCenters.reduce((sum: number, sc: any) => sum + (sc.coaches?.length || 0), 0),
        averageExperienceCost: sportCenters.length > 0 
          ? sportCenters.reduce((sum: number, sc: any) => sum + (sc.experienceCost || 0), 0) / sportCenters.length
          : 0,
        totalDormitoryCapacity: sportCenters.filter((sc: any) => sc.dormitory).length,
        sportCentersWithDormitory: sportCenters.filter((sc: any) => sc.dormitory).length
      };

      setStats(calculatedStats);
      setRecentSportCenters(sportCenters.slice(0, 5)); // Show last 5
      setError(null);
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      setError(`Erro ao carregar dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verificando permissões...</div>
      </div>
    );
  }

  if (!canManageSportCenters) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Acesso Negado</h1>
          <p>Apenas usuários com permissão podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard do Owner</h1>
          <p className={styles.subtitle}>Bem-vindo, {user?.name}!</p>
        </div>
        <Link href="/admin/sportcenters" className={styles.manageButton}>
          Gerenciar SportCenters
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando dados do dashboard...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          {/* Estatísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏢</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalSportCenters}</h3>
                <p className={styles.statLabel}>SportCenters</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏋️</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalFacilities}</h3>
                <p className={styles.statLabel}>Facilities</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👨‍🏫</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalCoaches}</h3>
                <p className={styles.statLabel}>Coaches</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{formatPrice(stats.averageExperienceCost)}</h3>
                <p className={styles.statLabel}>Preço Médio</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏠</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.sportCentersWithDormitory}</h3>
                <p className={styles.statLabel}>Com Dormitório</p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
            <div className={styles.actionsGrid}>
              <Link href="/admin/sportcenters/create" className={styles.actionCard}>
                <div className={styles.actionIcon}>➕</div>
                <div className={styles.actionContent}>
                  <h3>Criar SportCenter</h3>
                  <p>Adicione um novo centro esportivo</p>
                </div>
              </Link>

              <div className={styles.actionCard} onClick={() => alert('Em breve!')}>
                <div className={styles.actionIcon}>📊</div>
                <div className={styles.actionContent}>
                  <h3>Relatórios</h3>
                  <p>Visualize estatísticas detalhadas</p>
                </div>
              </div>

              <div className={styles.actionCard} onClick={() => alert('Em breve!')}>
                <div className={styles.actionIcon}>⚙️</div>
                <div className={styles.actionContent}>
                  <h3>Configurações</h3>
                  <p>Gerencie suas preferências</p>
                </div>
              </div>
            </div>
          </div>

          {/* SportCenters Recentes */}
          {recentSportCenters.length > 0 && (
            <div className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Seus SportCenters</h2>
                <Link href="/admin/sportcenters" className={styles.viewAllLink}>
                  Ver todos
                </Link>
              </div>
              
              <div className={styles.sportCentersList}>
                {recentSportCenters.map(sportCenter => (
                  <div key={sportCenter._id} className={styles.sportCenterItem}>
                    <div className={styles.sportCenterInfo}>
                      <h4 className={styles.sportCenterName}>{sportCenter.name}</h4>
                      <p className={styles.sportCenterSports}>
                        {sportCenter.sport?.join(', ') || 'Esportes não informados'}
                      </p>
                    </div>
                    <div className={styles.sportCenterMeta}>
                      {sportCenter.dormitory && (
                        <span className={styles.dormitoryBadge}>🏠 Dormitório</span>
                      )}
                      {sportCenter.experienceCost && (
                        <span className={styles.priceBadge}>
                          {formatPrice(sportCenter.experienceCost)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.totalSportCenters === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏢</div>
              <h3>Nenhum SportCenter encontrado</h3>
              <p>Crie seu primeiro SportCenter para começar a gerenciar suas facilities e coaches.</p>
              <Link href="/admin/sportcenters" className={styles.createFirstButton}>
                Criar Primeiro SportCenter
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;