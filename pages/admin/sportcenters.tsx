import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import styles from './sportcenters.module.css';

interface SportCenter {
  _id: string;
  name: string;
  sportcenterBio?: string;
  mainPhoto?: string;
  profilePhoto?: string;
  categories: string[];
  sport: string[];
  location: {
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    number?: string;
    zip_code?: string;
  };
  dormitory: boolean;
  dormitoryCosts?: number;
  experienceCost?: number;
  yearOfFoundation?: string;
  hosterName?: string;
  hosterImage?: string;
  hostBio?: string;
  owner: string;
  facilities?: any[];
  coaches?: any[];
  achievements?: string[];
}

interface SportCentersResponse {
  sportCenters: SportCenter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const SportCentersAdminPage: React.FC = () => {
  const {
    user,
    canManageSportCenters,
    isSuperuser,
    isLoading: authLoading,
  } = useAuth();
  const [sportCenters, setSportCenters] = useState<SportCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<
    SportCentersResponse['pagination'] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManageSportCenters) {
      setError(
        'Acesso negado. Apenas usuários com permissão podem acessar esta página.'
      );
      setLoading(false);
      return;
    }
    fetchSportCenters();
  }, [currentPage, searchTerm, canManageSportCenters, user]);

  const fetchSportCenters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/sportcenter?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Admin SportCenters] API Error:', errorData);
        throw new Error(errorData.message || 'Erro ao carregar sportcenters');
      }

      const data = await response.json();

      // Handle new standardized API response format
      if (data.success && data.data && Array.isArray(data.data)) {
        setSportCenters(data.data);
        setPagination(data.metadata?.pagination || null);
      }
      // Fallback for old API format (backward compatibility)
      else if (data.sportCenters && Array.isArray(data.sportCenters)) {
        setSportCenters(data.sportCenters);
        setPagination(data.pagination);
      } else {
        setSportCenters([]);
        setPagination(null);
      }
      setError(null);
    } catch (error: any) {
      console.error('[Admin SportCenters] Fetch error:', error);
      setError(`Erro ao carregar sportcenters: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSportCenter = async (sportCenterId: string) => {
    if (!confirm('Tem certeza que deseja deletar este sportcenter?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/sportcenter/${sportCenterId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchSportCenters();
      alert('SportCenter deletado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar sportcenter: ${error.message}`);
    }
  };

  const formatLocation = (location: SportCenter['location']): string => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(', ') || 'Localização não informada';
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const canEditSportCenter = (sportCenter: SportCenter): boolean => {
    if (!user) return false;
    // SUPERUSER pode editar qualquer sportcenter
    if (isSuperuser) return true;
    // OWNER pode editar apenas seus próprios sportcenters
    return sportCenter.owner === user.id;
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
        <h1 className={styles.title}>Gerenciar SportCenters</h1>
        <Link href='/admin/sportcenters/create' className={styles.createButton}>
          Criar SportCenter
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          type='text'
          placeholder='Buscar por nome, esporte, cidade...'
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando sportcenters...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.sportCentersGrid}>
            {sportCenters &&
              Array.isArray(sportCenters) &&
              sportCenters.map(sportCenter => (
                <div key={sportCenter._id} className={styles.sportCenterCard}>
                  {sportCenter.mainPhoto && (
                    <img
                      src={sportCenter.mainPhoto}
                      alt={sportCenter.name}
                      className={styles.sportCenterImage}
                    />
                  )}
                  <div className={styles.sportCenterContent}>
                    <h3 className={styles.sportCenterTitle}>
                      {sportCenter.name}
                    </h3>
                    <p className={styles.sportCenterDescription}>
                      {sportCenter.sportcenterBio || 'Sem descrição disponível'}
                    </p>

                    <div className={styles.sportCenterDetails}>
                      <div className={styles.sportCenterLocation}>
                        📍 {formatLocation(sportCenter.location)}
                      </div>

                      {sportCenter.sport && sportCenter.sport.length > 0 && (
                        <div className={styles.sportCenterSports}>
                          🏆 {sportCenter.sport.join(', ')}
                        </div>
                      )}

                      {sportCenter.dormitory && (
                        <div className={styles.sportCenterDormitory}>
                          🏠 Dormitório:{' '}
                          {formatPrice(sportCenter.dormitoryCosts)}
                        </div>
                      )}

                      {sportCenter.experienceCost && (
                        <div className={styles.sportCenterExperience}>
                          💫 Experiência:{' '}
                          {formatPrice(sportCenter.experienceCost)}
                        </div>
                      )}
                    </div>

                    <div className={styles.sportCenterMeta}>
                      {sportCenter.yearOfFoundation && (
                        <span className={styles.foundationYear}>
                          Fundado em {sportCenter.yearOfFoundation}
                        </span>
                      )}
                      {sportCenter.hosterName && (
                        <span className={styles.hosterName}>
                          Host: {sportCenter.hosterName}
                        </span>
                      )}
                      <div className={styles.ownershipInfo}>
                        {sportCenter.owner === user?.id ? (
                          <span className={styles.ownSportCenter}>
                            Seu SportCenter
                          </span>
                        ) : isSuperuser ? (
                          <span className={styles.otherOwnerSportCenter}>
                            Outro proprietário
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.sportCenterActions}>
                      {canEditSportCenter(sportCenter) ? (
                        <>
                          <Link
                            href={`/admin/sportcenters/${sportCenter._id}/edit`}
                            className={styles.editButton}
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() =>
                              alert(
                                'Funcionalidade de duplicação será implementada'
                              )
                            }
                            className={styles.duplicateButton}
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteSportCenter(sportCenter._id)
                            }
                            className={styles.deleteButton}
                          >
                            Excluir
                          </button>
                        </>
                      ) : (
                        <div className={styles.noPermissions}>
                          <span>Apenas visualização</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(!sportCenters || sportCenters.length === 0) && !loading && (
            <div className={styles.errorMessage}>
              <h3>Nenhum sportcenter encontrado</h3>
              <p>
                Crie seu primeiro sportcenter clicando no botão "Criar
                SportCenter".
              </p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SportCentersAdminPage;
