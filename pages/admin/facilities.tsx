import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import { FacilityType } from '../../src/types/facility';
import styles from './facilities.module.css';

interface Facility extends FacilityType {
  _id: string;
}

interface FacilitiesResponse {
  facilities: Facility[];
  count: number;
}

const FacilitiesAdminPage: React.FC = () => {
  const { user, canManageFacilities, isLoading: authLoading } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!canManageFacilities) {
      setError('Acesso negado. Apenas superusuários podem gerenciar facilities.');
      setLoading(false);
      return;
    }
    fetchFacilities();
  }, [searchTerm, canManageFacilities, user]);

  const uploadIconFile = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no upload do arquivo');
    }

    const data = await response.json();
    return data.url;
  };

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/facilities?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar facilities');
      }

      const data: FacilitiesResponse = await response.json();
      setFacilities(data.facilities || []);
      setError(null);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(`Erro ao carregar facilities: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      let iconUrl = '';
      
      // Upload icon file if provided
      if (iconFile) {
        setUploading(true);
        iconUrl = await uploadIconFile(iconFile);
        setUploading(false);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          icon: iconUrl || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar facility');
      }

      setFormData({ name: '', icon: '' });
      setIconFile(null);
      setShowCreateForm(false);
      fetchFacilities();
      alert('Facility criada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao criar facility: ${error.message}`);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleUpdateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      let iconUrl = formData.icon; // Keep existing icon by default
      
      // Upload new icon file if provided
      if (iconFile) {
        setUploading(true);
        iconUrl = await uploadIconFile(iconFile);
        setUploading(false);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/facilities/${editingFacility._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          icon: iconUrl || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar facility');
      }

      setFormData({ name: '', icon: '' });
      setIconFile(null);
      setEditingFacility(null);
      fetchFacilities();
      alert('Facility atualizada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao atualizar facility: ${error.message}`);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta facility?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/facilities/${facilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchFacilities();
      alert('Facility deletada com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar facility: ${error.message}`);
    }
  };

  const startEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({ name: facility.name, icon: facility.icon || '' });
    setIconFile(null);
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingFacility(null);
    setFormData({ name: '', icon: '' });
    setIconFile(null);
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingFacility(null);
    setFormData({ name: '', icon: '' });
    setIconFile(null);
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verificando permissões...</div>
      </div>
    );
  }

  if (!canManageFacilities) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Acesso Negado</h1>
          <p>Apenas superusuários podem gerenciar facilities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciar Facilities</h1>
          <p className={styles.subtitle}>Facilities disponíveis para SportCenters</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/sportcenters" className={styles.backButton}>
            ← SportCenters
          </Link>
          <button onClick={startCreate} className={styles.createButton}>
            + Nova Facility
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar facilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {(showCreateForm || editingFacility) && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {editingFacility ? 'Editar Facility' : 'Nova Facility'}
          </h3>
          <form onSubmit={editingFacility ? handleUpdateFacility : handleCreateFacility}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Ex: Piscina Olímpica"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ícone (SVG)</label>
              <input
                type="file"
                className={styles.fileInput}
                accept=".svg,image/svg+xml"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              />
              {uploading && <span className={styles.uploading}>Fazendo upload...</span>}
              {editingFacility?.icon && !iconFile && (
                <div className={styles.currentIcon}>
                  <span>Ícone atual:</span>
                  <img src={editingFacility.icon} alt="Current icon" className={styles.iconPreview} />
                </div>
              )}
              {iconFile && (
                <div className={styles.filePreview}>
                  Novo arquivo: {iconFile.name}
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <button type="submit" disabled={submitting} className={styles.submitButton}>
                {submitting ? 'Salvando...' : editingFacility ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={editingFacility ? cancelEdit : () => setShowCreateForm(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Carregando facilities...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.facilitiesGrid}>
            {facilities.map(facility => (
              <div key={facility._id} className={styles.facilityCard}>
                <div className={styles.facilityContent}>
                  <div className={styles.facilityHeader}>
                    {facility.icon && (
                      <div className={styles.facilityIcon}>
                        <img src={facility.icon} alt={facility.name} />
                      </div>
                    )}
                    <h3 className={styles.facilityName}>{facility.name}</h3>
                  </div>
                  
                  <div className={styles.facilityActions}>
                    <button
                      onClick={() => startEdit(facility)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(facility._id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {facilities.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <h3>Nenhuma facility encontrada</h3>
              <p>Crie sua primeira facility clicando no botão "Nova Facility".</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacilitiesAdminPage;