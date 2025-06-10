import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import { CoachType } from '../../src/types/coach';
import styles from './coaches.module.css';

interface Coach extends CoachType {
  _id: string;
  createdAt?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminCoaches() {
  const { isAuthenticated, canManageCoaches, isLoading } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // New coach form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoach, setNewCoach] = useState<Omit<CoachType, '_id'>>({
    name: '',
    age: undefined,
    miniBio: '',
    achievements: [],
    profileImage: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit states
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<CoachType, '_id'>>({
    name: '',
    age: undefined,
    miniBio: '',
    achievements: [],
    profileImage: ''
  });
  const [editProfileImageFile, setEditProfileImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !canManageCoaches)) {
      window.location.href = '/';
      return;
    }

    if (isAuthenticated && canManageCoaches) {
      fetchCoaches();
    }
  }, [isAuthenticated, canManageCoaches, isLoading, pagination.page, searchTerm]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      
      const response = await fetch(`/api/coach?page=${pagination.page}&limit=${pagination.limit}${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar coaches');
      }

      const data = await response.json();
      setCoaches(data.coaches || []);
      setPagination(data.pagination || pagination);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!file) return '';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload da imagem');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      let profileImageUrl = newCoach.profileImage;
      
      if (profileImageFile) {
        profileImageUrl = await uploadFile(profileImageFile);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newCoach,
          profileImage: profileImageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar coach');
      }

      // Reset form
      setNewCoach({ name: '', age: undefined, miniBio: '', achievements: [], profileImage: '' });
      setProfileImageFile(null);
      setShowCreateForm(false);
      fetchCoaches();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const startEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setEditFormData({
      name: coach.name,
      age: coach.age,
      miniBio: coach.miniBio,
      achievements: coach.achievements || [],
      profileImage: coach.profileImage
    });
    setEditProfileImageFile(null);
  };

  const handleEditCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    
    setEditLoading(true);

    try {
      let profileImageUrl = editFormData.profileImage;
      
      if (editProfileImageFile) {
        profileImageUrl = await uploadFile(editProfileImageFile);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/coach/${editingCoach._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editFormData,
          profileImage: profileImageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar coach');
      }

      setEditingCoach(null);
      fetchCoaches();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteCoach = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este coach?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/coach/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar coach');
      }

      fetchCoaches();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAchievementsChange = (value: string, isEdit = false) => {
    const achievements = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, achievements }));
    } else {
      setNewCoach(prev => ({ ...prev, achievements }));
    }
  };

  if (isLoading || loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (!isAuthenticated || !canManageCoaches) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciar Coaches</h1>
          <p className={styles.subtitle}>
            Total: {pagination.total} coaches
          </p>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.createButton}
          >
            {showCreateForm ? 'Cancelar' : '+ Novo Coach'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar coaches por nome ou bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateCoach} className={styles.createForm}>
          <h2>Criar Novo Coach</h2>
          
          <div className={styles.formGroup}>
            <label>Nome *</label>
            <input
              type="text"
              value={newCoach.name}
              onChange={(e) => setNewCoach(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Idade</label>
            <input
              type="number"
              value={newCoach.age || ''}
              onChange={(e) => setNewCoach(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mini Bio</label>
            <textarea
              value={newCoach.miniBio}
              onChange={(e) => setNewCoach(prev => ({ ...prev, miniBio: e.target.value }))}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Conquistas (separadas por vírgula)</label>
            <textarea
              value={newCoach.achievements?.join(', ') || ''}
              onChange={(e) => handleAchievementsChange(e.target.value)}
              rows={2}
              placeholder="Ex: Campeão Nacional 2020, Melhor Técnico 2021"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Foto de Perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
            />
            {profileImageFile && (
              <img 
                src={URL.createObjectURL(profileImageFile)} 
                alt="Preview" 
                className={styles.imagePreview}
              />
            )}
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={createLoading}>
              {createLoading ? 'Criando...' : 'Criar Coach'}
            </button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Coaches List */}
      <div className={styles.coachesList}>
        {coaches.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum coach encontrado.</p>
            <button onClick={() => setShowCreateForm(true)}>
              Criar Primeiro Coach
            </button>
          </div>
        ) : (
          coaches.map((coach) => (
            <div key={coach._id} className={styles.coachCard}>
              {editingCoach?._id === coach._id ? (
                <form onSubmit={handleEditCoach} className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Idade</label>
                    <input
                      type="number"
                      value={editFormData.age || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Mini Bio</label>
                    <textarea
                      value={editFormData.miniBio}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, miniBio: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Conquistas (separadas por vírgula)</label>
                    <textarea
                      value={editFormData.achievements?.join(', ') || ''}
                      onChange={(e) => handleAchievementsChange(e.target.value, true)}
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Foto de Perfil</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditProfileImageFile(e.target.files?.[0] || null)}
                    />
                    {editProfileImageFile && (
                      <img 
                        src={URL.createObjectURL(editProfileImageFile)} 
                        alt="Preview" 
                        className={styles.imagePreview}
                      />
                    )}
                    {editFormData.profileImage && !editProfileImageFile && (
                      <img 
                        src={editFormData.profileImage} 
                        alt="Atual" 
                        className={styles.imagePreview}
                      />
                    )}
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" disabled={editLoading}>
                      {editLoading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button type="button" onClick={() => setEditingCoach(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.coachInfo}>
                    {coach.profileImage && (
                      <img 
                        src={coach.profileImage} 
                        alt={coach.name}
                        className={styles.coachImage}
                      />
                    )}
                    <div className={styles.coachDetails}>
                      <h3>{coach.name}</h3>
                      {coach.age && <p>Idade: {coach.age}</p>}
                      {coach.miniBio && <p className={styles.bio}>{coach.miniBio}</p>}
                      {coach.achievements && coach.achievements.length > 0 && (
                        <div className={styles.achievements}>
                          <strong>Conquistas:</strong>
                          <ul>
                            {coach.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.coachActions}>
                    <button 
                      onClick={() => startEdit(coach)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteCoach(coach._id)}
                      className={styles.deleteButton}
                    >
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Anterior
          </button>
          <span>
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}