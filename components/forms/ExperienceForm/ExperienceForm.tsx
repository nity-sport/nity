import React, { useState, ChangeEvent, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ExperienceType, ExperienceLocation, ExperienceLocationCoordinates } from '../../../src/types/experience'; // Ajuste o caminho se necessário
import { useAuth } from '../../../src/contexts/AuthContext';
import styles from './ExperienceForm.module.css'; // Criaremos este arquivo

const initialLocationCoordinatesState: ExperienceLocationCoordinates = {
  lat: 0,
  lng: 0,
};

const initialLocationState: ExperienceLocation = {
  name: '',
  address: '',
  coordinates: { ...initialLocationCoordinatesState },
};

// Omitimos _id, owner, createdAt, updatedAt do estado inicial do formulário
const initialFormState: Omit<ExperienceType, '_id' | 'owner' | 'createdAt' | 'updatedAt' | 'coverImage' | 'gallery'> & { coverImage: string; gallery: string[] } = {
  title: '',
  description: '',
  coverImage: '', // Será URL após upload
  gallery: [],      // Serão URLs após upload
  category: 'tour',
  tags: [],
  location: { ...initialLocationState },
  duration: '',
  price: 0,
  availableQuantity: 1,
  currency: 'BRL',
  availableDates: [],
  isFeatured: false,
  visibility: 'public',
};


interface ExperienceFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function ExperienceForm({ initialData, onSubmit, onCancel }: ExperienceFormProps) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Função para mesclar corretamente os dados iniciais
  const getInitialFormData = () => {
    if (!initialData) {
      return JSON.parse(JSON.stringify(initialFormState));
    }
    
    // Para duplicação, limpa apenas alguns campos específicos e mantém o resto
    const result = {
      ...JSON.parse(JSON.stringify(initialFormState)), // Base limpa
      ...initialData, // Sobrescreve com dados iniciais
      _id: undefined,
      owner: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      title: initialData.title ? `${initialData.title} (Cópia)` : initialData.title,
      availableDates: [], // Reset dates for duplication
      visibility: 'draft', // Start as draft
      isFeatured: false, // Remove featured status
      // Garante que location sempre existe
      location: initialData.location ? {
        name: initialData.location.name || '',
        address: initialData.location.address || '',
        coordinates: {
          lat: initialData.location.coordinates?.lat || 0,
          lng: initialData.location.coordinates?.lng || 0
        }
      } : { ...initialLocationState }
    };
    
    return result;
  };
  
  const [formData, setFormData] = useState<Omit<ExperienceType, '_id' | 'owner' | 'createdAt' | 'updatedAt'>>(
    getInitialFormData()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    initialData?.availableDates ? 
      initialData.availableDates.map((date: any) => new Date(date)).filter((date: Date) => !isNaN(date.getTime())) : 
      []
  );

  const handleSingleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files && e.target.files[0] ? e.target.files[0] : null);
  };

  const handleMultipleFilesChange = (setter: React.Dispatch<React.SetStateAction<FileList | null>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files ? e.target.files : null);
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Erro no upload do arquivo: ${file.name}`);
      }
      const data = await res.json();
      return data.url;
    } catch (uploadError: any) {
      console.error("Erro no upload:", uploadError);
      setError((prevError) => (prevError ? `${prevError}\n` : '') + `Falha ao enviar ${file.name}: ${uploadError.message}`);
      throw uploadError;
    }
  };

  const uploadMultipleFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i]);
      if (url) {
        uploadedUrls.push(url);
      }
    }
    return uploadedUrls;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith("location.coordinates.")) {
      const coordField = name.split(".")[2] as keyof ExperienceLocationCoordinates;
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: { 
            ...prev.location?.coordinates,
            [coordField]: parseFloat(value) || 0 
          }
        }
      }));
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1] as keyof Omit<ExperienceLocation, 'coordinates'>;
      setFormData(prev => ({ 
        ...prev, 
        location: { 
          ...prev.location,
          [locationField]: value 
        } 
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayStringChange = (fieldName: 'tags', rawValue: string) => {
    if (rawValue.trim() === '') {
      setFormData(prev => ({ ...prev, [fieldName]: [] }));
      return;
    }
    const newArray = rawValue.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [fieldName]: newArray.filter(item => item !== '') }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date && !selectedDates.some(selectedDate => selectedDate.getTime() === date.getTime())) {
      const newDates = [...selectedDates, date].sort((a, b) => a.getTime() - b.getTime());
      setSelectedDates(newDates);
      setFormData(prev => ({ 
        ...prev, 
        availableDates: newDates.map(d => d.toISOString().split('T')[0])
      }));
    }
  };

  const removeDate = (dateToRemove: Date) => {
    const newDates = selectedDates.filter(date => date.getTime() !== dateToRemove.getTime());
    setSelectedDates(newDates);
    setFormData(prev => ({ 
      ...prev, 
      availableDates: newDates.map(d => d.toISOString().split('T')[0])
    }));
  };
  
  const resetFormStates = () => {
    setFormData(JSON.parse(JSON.stringify(initialFormState)));
    setCoverImageFile(null);
    setGalleryFiles(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || authLoading) {
      setError("Usuário não autenticado ou carregando.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const coverImageUrl = await uploadFile(coverImageFile);
      if (!coverImageUrl && !formData.coverImage) { // Se não houver imagem nova e nem uma pré-existente (para edição futura)
        throw new Error("A imagem de capa é obrigatória.");
      }
      
      const galleryUrls = await uploadMultipleFiles(galleryFiles);

      // Use selected dates from DatePicker
      const finalAvailableDates = selectedDates.map(date => date.toISOString());
      // Ensure tags are clean
      const cleanedTags = formData.tags?.filter(tag => tag && tag.trim() !== '') || [];

      const finalExperienceData: Omit<ExperienceType, '_id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        coverImage: coverImageUrl || formData.coverImage, // Usa nova se houver, senão mantém a antiga (para edição)
        gallery: galleryUrls.length > 0 ? galleryUrls : formData.gallery,
        tags: cleanedTags,
        availableDates: finalAvailableDates,
        owner: {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatar || '',
        },
      };
      
      if (onSubmit) {
        // Modo administração - usa callback
        onSubmit(finalExperienceData);
      } else {
        // Modo standalone - faz requisição direta
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(finalExperienceData),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || responseData.message || 'Falha ao criar Experience');
        }
        setSuccess('Experience cadastrada com sucesso!');
        resetFormStates();
      }
    } catch (err: any) {
      console.error("Erro ao submeter formulário de Experience:", err);
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) return <p>Carregando dados do usuário...</p>;
  if (!user) return <p>Por favor, faça login para cadastrar uma Experience.</p>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <fieldset className={styles.fieldset}>
        <legend>Informações da Experiência</legend>
        <div className={styles.formGroup}>
          <label htmlFor="title">Título *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category">Categoria *</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="tour">Tour</option>
            <option value="event">Evento</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (separadas por vírgula)</label>
          <input type="text" name="tags" value={formData.tags?.join(', ') || ''} onChange={(e) => handleArrayStringChange('tags', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="duration">Duração (ex: 2 horas, 1 dia)</label>
          <input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Preço *</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="availableQuantity">Quantidade Disponível *</label>
          <input type="number" name="availableQuantity" value={formData.availableQuantity} onChange={handleChange} required min="1" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="currency">Moeda</label>
          <input type="text" name="currency" value={formData.currency} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="availableDates">Datas Disponíveis</label>
          <DatePicker
            selected={null}
            onChange={handleDateChange}
            minDate={new Date()}
            placeholderText="Selecione uma data para adicionar"
            dateFormat="dd/MM/yyyy"
            className={styles.datePicker}
          />
          <small>Clique em uma data para adicioná-la à lista de datas disponíveis</small>
          
          {selectedDates.length > 0 && (
            <div className={styles.selectedDates}>
              <h4>Datas Selecionadas:</h4>
              <div className={styles.datesList}>
                {selectedDates.map((date, index) => (
                  <div key={index} className={styles.dateItem}>
                    <span>{date.toLocaleDateString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => removeDate(date)}
                      className={styles.removeDateButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>
            <input type="checkbox" name="isFeatured" checked={!!formData.isFeatured} onChange={handleChange} />
            É Destacado?
          </label>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="visibility">Visibilidade *</label>
          <select name="visibility" value={formData.visibility} onChange={handleChange} required>
            <option value="public">Pública</option>
            <option value="private">Privada</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Localização da Experiência *</legend>
        <div className={styles.formGroup}>
          <label htmlFor="location.name">Nome do Local *</label>
          <input type="text" name="location.name" value={formData.location?.name || ''} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location.address">Endereço Completo *</label>
          <input type="text" name="location.address" value={formData.location?.address || ''} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location.coordinates.lat">Latitude *</label>
          <input type="number" name="location.coordinates.lat" value={formData.location?.coordinates?.lat || 0} onChange={handleChange} required step="any" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location.coordinates.lng">Longitude *</label>
          <input type="number" name="location.coordinates.lng" value={formData.location?.coordinates?.lng || 0} onChange={handleChange} required step="any" />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Mídias da Experiência</legend>
        <div className={styles.formGroup}>
          <label htmlFor="coverImageFile">Imagem de Capa *</label>
          <input type="file" name="coverImageFile" onChange={handleSingleFileChange(setCoverImageFile)} accept="image/*" required={!formData.coverImage} />
          {coverImageFile && <img src={URL.createObjectURL(coverImageFile)} alt="Preview Imagem Capa" className={styles.previewImage} />}
          {!coverImageFile && formData.coverImage && <img src={formData.coverImage} alt="Imagem Capa Atual" className={styles.previewImage} />}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="galleryFiles">Galeria de Imagens (selecione múltiplas)</label>
          <input type="file" name="galleryFiles" onChange={handleMultipleFilesChange(setGalleryFiles)} accept="image/*" multiple />
          {galleryFiles && Array.from(galleryFiles).map((file, index) => (
            <img key={`new-${index}`} src={URL.createObjectURL(file)} alt={`Preview Galeria ${index + 1}`} className={styles.previewImage} />
          ))}
          {!galleryFiles && formData.gallery.map((url, index) => (
            <img key={`current-${index}`} src={url} alt={`Galeria Atual ${index + 1}`} className={styles.previewImage} />
          ))}
        </div>
      </fieldset>

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading || authLoading} className={styles.submitButton}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar Experiência' : 'Cadastrar Experiência')}
        </button>
      </div>
    </form>
  );
}