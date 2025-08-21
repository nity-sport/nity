import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import ExperienceForm from '../../components/forms/ExperienceForm/ExperienceForm';
import styles from './experiences.module.css';

interface Experience {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  gallery?: string[];
  category: string;
  tags?: string[];
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  duration?: string;
  price: number;
  availableQuantity: number;
  currency?: string;
  visibility: 'public' | 'private' | 'draft';
  isFeatured?: boolean;
  owner: {
    userId: string;
    name: string;
    avatarUrl?: string;
  };
  availableDates: Date[];
  createdAt: string;
  updatedAt: string;
}

interface ExperiencesResponse {
  experiences: Experience[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ExperiencesAdminPage: React.FC = () => {
  const { user, canCreateExperiences, isLoading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<ExperiencesResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private' | 'draft'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDuplicateForm, setShowDuplicateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canCreateExperiences) {
      setError('Acesso negado. Apenas usuários com permissão podem acessar esta página.');
      setLoading(false);
      return;
    }
    fetchExperiences();
  }, [currentPage, searchTerm, visibilityFilter, canCreateExperiences, user]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(visibilityFilter !== 'all' && { visibility: visibilityFilter })
      });

      const response = await fetch(`/api/experiences?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Admin Experiences] API Error:', errorData);
        throw new Error(errorData.error || 'Erro ao carregar experiências');
      }

      const data: ExperiencesResponse = await response.json();
      
      setExperiences(data.experiences || []);
      setPagination(data.pagination);
      setError(null);
    } catch (error: any) {
      console.error('[Admin Experiences] Fetch error:', error);
      setError(`Erro ao carregar experiências: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperience = async (experienceData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...experienceData,
          owner: {
            userId: user?.id,
            name: user?.name,
            avatarUrl: user?.avatar
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowCreateForm(false);
      fetchExperiences();
      alert('Experiência criada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao criar experiência: ${error.message}`);
    }
  };

  const handleEditExperience = async (experienceData: any) => {
    if (!selectedExperience) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/experiences/${selectedExperience._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(experienceData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowEditForm(false);
      setSelectedExperience(null);
      fetchExperiences();
      alert('Experiência atualizada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao atualizar experiência: ${error.message}`);
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta experiência?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/experiences/${experienceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchExperiences();
      alert('Experiência deletada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar experiência: ${error.message}`);
    }
  };

  const handleDuplicateExperience = (experienceId: string) => {
    const experienceToDuplicate = experiences.find(exp => exp._id === experienceId);
    if (experienceToDuplicate) {
      // Simplesmente passa a experiência original como initialData
      // O formulário se encarregará de duplicar os dados corretamente
      setSelectedExperience(experienceToDuplicate);
      setShowDuplicateForm(true);
    } else {
      alert('Experiência não encontrada para duplicação.');
    }
  };


  const getStatusDisplayName = (visibility: string): string => {
    const statusNames = {
      public: 'Pública',
      private: 'Privada',
      draft: 'Rascunho'
    };
    return statusNames[visibility] || visibility;
  };

  const getStatusClass = (visibility: string): string => {
    const statusClasses = {
      public: styles.statusPublic,
      private: styles.statusPrivate,
      draft: styles.statusDraft
    };
    return `${styles.experienceStatus} ${statusClasses[visibility]}`;
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

  if (!canCreateExperiences) {
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
        <h1 className={styles.title}>Gerenciar Experiências</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createButton}
        >
          Criar Experiência
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
        <select
          value={visibilityFilter}
          onChange={(e) => {
            setVisibilityFilter(e.target.value as 'all' | 'public' | 'private' | 'draft');
            setCurrentPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="all">Todas as visibilidades</option>
          <option value="public">Pública</option>
          <option value="private">Privada</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando experiências...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.experiencesGrid}>
            {experiences && Array.isArray(experiences) && experiences.map(experience => (
              <div key={experience._id} className={styles.experienceCard}>
                {experience.coverImage && (
                  <img
                    src={experience.coverImage}
                    alt={experience.title}
                    className={styles.experienceImage}
                  />
                )}
                <div className={styles.experienceContent}>
                  <h3 className={styles.experienceTitle}>{experience.title}</h3>
                  <p className={styles.experienceDescription}>{experience.description}</p>
                  
                  <div className={styles.experienceDetails}>
                    <span className={styles.experiencePrice}>
                      {formatPrice(experience.price)}
                    </span>
                    <span className={styles.experienceQuantity}>
                      {experience.availableQuantity} disponíveis
                    </span>
                  </div>

                  <span className={getStatusClass(experience.visibility)}>
                    {getStatusDisplayName(experience.visibility)}
                  </span>

                  <div className={styles.experienceActions}>
                    <button
                      onClick={() => {
                        setSelectedExperience(experience);
                        setShowEditForm(true);
                      }}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDuplicateExperience(experience._id)}
                      className={styles.duplicateButton}
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(experience._id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!experiences || experiences.length === 0) && !loading && (
            <div className={styles.errorMessage}>
              <h3>Nenhuma experiência encontrada</h3>
              <p>Crie sua primeira experiência clicando no botão "Criar Experiência".</p>
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

      {showDuplicateForm && selectedExperience && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Duplicar Experiência</h2>
              <button
                onClick={() => {
                  setShowDuplicateForm(false);
                  setSelectedExperience(null);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <ExperienceForm
              initialData={selectedExperience}
              onSubmit={(data) => {
                handleCreateExperience(data);
                setShowDuplicateForm(false);
                setSelectedExperience(null);
              }}
              onCancel={() => {
                setShowDuplicateForm(false);
                setSelectedExperience(null);
              }}
            />
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Criar Nova Experiência</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <ExperienceForm
              onSubmit={handleCreateExperience}
              onCancel={() => {
                setShowCreateForm(false);
              }}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedExperience && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Experiência</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedExperience(null);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <ExperienceForm
              initialData={selectedExperience}
              onSubmit={handleEditExperience}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedExperience(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperiencesAdminPage;