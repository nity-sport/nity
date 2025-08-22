import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Team } from '../../src/types/team';
import { User } from '../../src/types/auth';
import styles from './teams.module.css';

interface TeamsResponse {
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface TeamFormData {
  name: string;
}

const TeamsAdminPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<
    TeamsResponse['pagination'] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Você precisa estar logado para acessar esta página.');
      setLoading(false);
      return;
    }
    fetchTeams();
  }, [currentPage, isAuthenticated]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/teams?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar times');
      }

      const data: TeamsResponse = await response.json();
      setTeams(data.teams);
      setPagination(data.pagination);
    } catch (error) {
      setError('Erro ao carregar times');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (searchTerm: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        search: searchTerm,
        limit: '20',
      });

      const response = await fetch(`/api/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleCreateTeam = async (formData: TeamFormData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowCreateForm(false);
      fetchTeams();
      alert('Time criado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao criar time: ${error.message}`);
    }
  };

  const handleAddMember = async (teamId: string, userId: string) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      const memberIds = [...team.memberIds, userId];

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchTeams();
      setShowUserSearch(false);
      setSelectedTeam(null);
      alert('Membro adicionado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao adicionar membro: ${error.message}`);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      const memberIds = team.memberIds.filter(id => id !== userId);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchTeams();
      alert('Membro removido com sucesso!');
    } catch (error: any) {
      alert(`Erro ao remover membro: ${error.message}`);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Tem certeza que deseja deletar este time?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchTeams();
      alert('Time deletado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar time: ${error.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verificando permissões...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Acesso Negado</h1>
          <p>Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gerenciamento de Times</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createButton}
        >
          Criar Time
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando times...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.teamsGrid}>
            {teams.map(team => (
              <div key={team.id} className={styles.teamCard}>
                <div className={styles.teamHeader}>
                  <h3 className={styles.teamName}>{team.name}</h3>
                  <div className={styles.teamActions}>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowUserSearch(true);
                      }}
                      className={styles.addMemberButton}
                    >
                      + Membro
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className={styles.scoutInfo}>
                  <strong>Scout:</strong> {team.scout?.name} (
                  {team.scout?.email})
                </div>

                <div className={styles.membersSection}>
                  <div className={styles.membersHeader}>
                    <span>
                      <strong>Membros ({team.members?.length || 0}):</strong>
                    </span>
                  </div>
                  {team.members && team.members.length > 0 ? (
                    <div className={styles.membersList}>
                      {team.members.map(member => (
                        <div key={member.id} className={styles.memberItem}>
                          <div className={styles.memberInfo}>
                            {member.avatar && (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className={styles.memberAvatar}
                              />
                            )}
                            <div>
                              <div className={styles.memberName}>
                                {member.name}
                              </div>
                              <div className={styles.memberEmail}>
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveMember(team.id, member.id)
                            }
                            className={styles.removeMemberButton}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyMembers}>
                      Nenhum membro no time
                    </div>
                  )}
                </div>

                <div className={styles.teamDates}>
                  <small>
                    Criado em: {new Date(team.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>

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

      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Criar Novo Time</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateTeam({
                  name: formData.get('name') as string,
                });
              }}
              className={styles.form}
            >
              <div className={styles.formGroup}>
                <label htmlFor='name' className={styles.label}>
                  Nome do Time
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  required
                  className={styles.input}
                  placeholder='Digite o nome do time'
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type='submit' className={styles.submitButton}>
                  Criar Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserSearch && selectedTeam && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Adicionar Membro ao Time: {selectedTeam.name}</h2>
              <button
                onClick={() => {
                  setShowUserSearch(false);
                  setSelectedTeam(null);
                  setUserSearchTerm('');
                  setSearchResults([]);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.userSearch}>
              <input
                type='text'
                value={userSearchTerm}
                onChange={e => {
                  setUserSearchTerm(e.target.value);
                  if (e.target.value.length >= 2) {
                    searchUsers(e.target.value);
                  } else {
                    setSearchResults([]);
                  }
                }}
                placeholder='Buscar usuário por nome ou email...'
                className={styles.searchInput}
              />
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map(user => (
                    <div key={user.id} className={styles.userResult}>
                      <div className={styles.userInfo}>
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={styles.userAvatar}
                          />
                        )}
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleAddMember(selectedTeam.id, user.id)
                        }
                        className={styles.addButton}
                        disabled={selectedTeam.memberIds.includes(user.id)}
                      >
                        {selectedTeam.memberIds.includes(user.id)
                          ? 'Já é membro'
                          : 'Adicionar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsAdminPage;
