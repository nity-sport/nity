import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { UserRole } from '../../src/types/auth';
import UserForm from '../../components/forms/UserForm/UserForm';
import RoleChangeForm from '../../components/forms/RoleChangeForm/RoleChangeForm';
import styles from './users.module.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const UsersAdminPage: React.FC = () => {
  const { user, isSuperuser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleChangeForm, setShowRoleChangeForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Admin Users] useEffect triggered');
    console.log('[Admin Users] useEffect - isSuperuser:', isSuperuser);
    console.log('[Admin Users] useEffect - user:', user);
    console.log('[Admin Users] useEffect - user?.role:', user?.role);
    console.log('[Admin Users] useEffect - UserRole.SUPERUSER:', UserRole.SUPERUSER);
    console.log('[Admin Users] useEffect - comparison:', user?.role === UserRole.SUPERUSER);
    console.log('[Admin Users] useEffect - typeof user?.role:', typeof user?.role);
    console.log('[Admin Users] useEffect - typeof UserRole.SUPERUSER:', typeof UserRole.SUPERUSER);
    
    if (!isSuperuser) {
      console.log('[Admin Users] Access denied - not superuser');
      console.log('[Admin Users] Access denied - isSuperuser value:', isSuperuser);
      console.log('[Admin Users] Access denied - user role:', user?.role);
      setError('Acesso negado. Apenas super usuários podem acessar esta página.');
      setLoading(false);
      return;
    }
    console.log('[Admin Users] Access granted - fetching users');
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, isSuperuser, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      setError('Erro ao carregar usuários');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowCreateForm(false);
      fetchUsers();
      alert('Usuário criado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao criar usuário: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchUsers();
      alert('Usuário deletado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar usuário: ${error.message}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowRoleChangeForm(false);
      setSelectedUser(null);
      fetchUsers();
      alert('Perfil do usuário alterado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao alterar perfil: ${error.message}`);
    }
  };

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

  const getRoleBadgeClass = (role: UserRole): string => {
    const roleClasses = {
      [UserRole.SUPERUSER]: styles.badgeSuperuser,
      [UserRole.MARKETING]: styles.badgeMarketing,
      [UserRole.OWNER]: styles.badgeOwner,
      [UserRole.USER]: styles.badgeUser,
      [UserRole.ATHLETE]: styles.badgeAthlete
    };
    return `${styles.badge} ${roleClasses[role]}`;
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verificando permissões...</div>
      </div>
    );
  }

  if (!isSuperuser) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Acesso Negado</h1>
          <p>Apenas super usuários podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Administração de Usuários</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className={styles.createButton}
          >
            Criar Usuário
          </button>
        </div>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">Todos os perfis</option>
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando usuários...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.usersTable}>
              <div className={styles.tableHeader}>
                <div>Nome</div>
                <div>Email</div>
                <div>Perfil</div>
                <div>Provedor</div>
                <div>Criado em</div>
                <div>Ações</div>
              </div>
              {users.map(userItem => (
                <div key={userItem.id} className={styles.tableRow}>
                  <div className={styles.userName}>
                    {userItem.avatar && (
                      <img
                        src={userItem.avatar}
                        alt={userItem.name}
                        className={styles.userAvatar}
                      />
                    )}
                    <span>{userItem.name}</span>
                  </div>
                  <div>{userItem.email}</div>
                  <div>
                    <span className={getRoleBadgeClass(userItem.role)}>
                      {getRoleDisplayName(userItem.role)}
                    </span>
                  </div>
                  <div>{userItem.provider}</div>
                  <div>{new Date(userItem.createdAt).toLocaleDateString()}</div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setSelectedUser(userItem);
                        setShowRoleChangeForm(true);
                      }}
                      className={styles.roleButton}
                      disabled={userItem.id === user?.id}
                    >
                      Alterar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userItem.id)}
                      className={styles.deleteButton}
                      disabled={userItem.id === user?.id}
                    >
                      Excluir
                    </button>
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
                <h2>Criar Novo Usuário</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <UserForm
                onSubmit={handleCreateUser}
                showRoleSelection={true}
              />
            </div>
          </div>
        )}

        {showRoleChangeForm && selectedUser && (
          <RoleChangeForm
            userId={selectedUser.id}
            currentRole={selectedUser.role}
            userName={selectedUser.name}
            onSubmit={handleRoleChange}
            onCancel={() => {
              setShowRoleChangeForm(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
  );
};

export default UsersAdminPage;