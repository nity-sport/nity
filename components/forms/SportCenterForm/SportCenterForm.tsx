// nity.zip/components/forms/SportCenterForm.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { SportCenterType } from '../../../src/types/sportcenter';
import { LocationType } from '../../../src/types/location';
import { CoachType } from '../../../src/types/coach';
import { FacilityType } from '../../../src/types/facility';
import { useAuth } from '../../../src/contexts/AuthContext';
import FacilitySelector from '../FacilitySelector/FacilitySelector';
import CoachSelector from '../CoachSelector/CoachSelector';
import styles from './SportCenterForm.module.css';


const initialLocationState: LocationType = {
  city: '',
  country: '',
  number: '',
  state: '',
  street: '',
  zip_code: '',
};

const initialFormState: Omit<SportCenterType, 'owner' | 'ownerMail' | '_id'> = {
  name: '',
  mainPhoto: '',
  profilePhoto: '',
  photos: [],
  category: [],
  achievements: [],
  badge: '',
  coaches: [],
  dormitory: false,
  dormitoryCosts: 0,
  dormitoryMainPhoto: '',
  dormitoryPhotos: [],
  experienceCost: 0,
  extraSport: '',
  facilities: [],
  hostBio: '',
  hosterImage: '',
  hosterName: '',
  location: { ...initialLocationState },
  sport: [],
  sportcenterBio: '',
  yearOfFoundation: '',
};

interface SportCenterFormProps {
  initialData?: Partial<SportCenterType>;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export default function SportCenterForm({ 
  initialData, 
  mode = 'create',
  onSuccess 
}: SportCenterFormProps = {}) {
  const { user, isLoading: authLoading } = useAuth(); //
  const [formData, setFormData] = useState<Omit<SportCenterType, 'owner' | 'ownerMail' | '_id'>>(
    initialData ? { ...initialFormState, ...initialData } : JSON.parse(JSON.stringify(initialFormState)) 
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [dormitoryMainPhotoFile, setDormitoryMainPhotoFile] = useState<File | null>(null);
  const [hosterImageFile, setHosterImageFile] = useState<File | null>(null);
  const [photosFiles, setPhotosFiles] = useState<FileList | null>(null);
  const [dormitoryPhotosFiles, setDormitoryPhotosFiles] = useState<FileList | null>(null);
  const [coachesJson, setCoachesJson] = useState<string>('[]');
  const [facilitiesJson, setFacilitiesJson] = useState<string>('[]');
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);

  // Carregar facilities e coaches pré-selecionados no modo de edição
  React.useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Carregar facilities existentes
      if (initialData.facilities) {
        const loadExistingFacilities = async () => {
          try {
            const response = await fetch('/api/facilities');
            if (response.ok) {
              const data = await response.json();
              const allFacilities = data.facilities || [];
              
              // Encontrar IDs das facilities que correspondem às existentes
              const facilityIds: string[] = [];
              initialData.facilities?.forEach(existingFacility => {
                const matchingFacility = allFacilities.find((facility: any) => 
                  facility.name === existingFacility.name
                );
                if (matchingFacility) {
                  facilityIds.push(matchingFacility._id);
                }
              });
              
              setSelectedFacilityIds(facilityIds);
            }
          } catch (error) {
            console.warn('Erro ao carregar facilities existentes:', error);
          }
        };
        
        loadExistingFacilities();
      }

      // Carregar coaches existentes
      if (initialData.coaches) {
        const loadExistingCoaches = async () => {
          try {
            const response = await fetch('/api/coach?public=true&limit=100');
            if (response.ok) {
              const data = await response.json();
              const allCoaches = data.coaches || [];
              
              // Encontrar IDs dos coaches que correspondem aos existentes
              const coachIds: string[] = [];
              initialData.coaches?.forEach(existingCoach => {
                const matchingCoach = allCoaches.find((coach: any) => 
                  coach.name === existingCoach.name
                );
                if (matchingCoach) {
                  coachIds.push(matchingCoach._id);
                }
              });
              
              setSelectedCoachIds(coachIds);
            }
          } catch (error) {
            console.warn('Erro ao carregar coaches existentes:', error);
          }
        };
        
        loadExistingCoaches();
      }
    }
  }, [mode, initialData]);

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
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData }); //
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
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1] as keyof LocationType;
      setFormData(prev => ({ ...prev, location: { ...prev.location, [locationField]: value } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- MODIFICAÇÃO AQUI ---
  const handleArrayStringChange = (fieldName: keyof Pick<SportCenterType, 'category' | 'sport' | 'achievements'>, rawValue: string) => {
    if (rawValue.trim() === '') {
        setFormData(prev => ({ ...prev, [fieldName]: [] }));
        return;
    }
    // Apenas faz o split e trim de cada item. Mantém strings vazias resultantes de vírgulas consecutivas.
    // Ex: "item1,,item2" se tornará ["item1", "", "item2"] no estado.
    // O input value={formData[fieldName].join(', ')} irá refletir isso como "item1, , item2"
    const newArray = rawValue.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [fieldName]: newArray as string[] })); // Cast para string[]
  };
  // --- FIM DA MODIFICAÇÃO ---

  const resetFormStates = () => {
    setFormData(JSON.parse(JSON.stringify(initialFormState)));
    setMainPhotoFile(null);
    setProfilePhotoFile(null);
    setDormitoryMainPhotoFile(null);
    setHosterImageFile(null);
    setPhotosFiles(null);
    setDormitoryPhotosFiles(null);
    setCoachesJson('[]');
    setFacilitiesJson('[]');
    setSelectedFacilityIds([]);
    setSelectedCoachIds([]);
  }

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
      const mainPhotoUrl = await uploadFile(mainPhotoFile);
      const profilePhotoUrl = await uploadFile(profilePhotoFile);
      const dormitoryMainPhotoUrl = await uploadFile(dormitoryMainPhotoFile);
      const hosterImageUrl = await uploadFile(hosterImageFile);
      const photosUrls = await uploadMultipleFiles(photosFiles);
      const dormitoryPhotosUrls = await uploadMultipleFiles(dormitoryPhotosFiles);

      // Buscar coaches selecionados pelos IDs
      let parsedCoaches: CoachType[] = [];
      if (selectedCoachIds.length > 0) {
        try {
          const coachesResponse = await fetch('/api/coach?public=true&limit=100');
          if (coachesResponse.ok) {
            const coachesData = await coachesResponse.json();
            const allCoaches = coachesData.coaches || [];
            parsedCoaches = allCoaches.filter((coach: any) => 
              selectedCoachIds.includes(coach._id)
            ).map((coach: any) => ({
              name: coach.name,
              age: coach.age,
              miniBio: coach.miniBio,
              achievements: coach.achievements,
              profileImage: coach.profileImage
            }));
          }
        } catch (coachesError: any) {
          console.warn('Erro ao buscar coaches:', coachesError);
          // Em caso de erro, continua sem coaches
        }
      }

      // Buscar facilities selecionadas pelos IDs
      let parsedFacilities: FacilityType[] = [];
      if (selectedFacilityIds.length > 0) {
        try {
          const facilitiesResponse = await fetch('/api/facilities');
          if (facilitiesResponse.ok) {
            const facilitiesData = await facilitiesResponse.json();
            const allFacilities = facilitiesData.facilities || [];
            parsedFacilities = allFacilities.filter((facility: any) => 
              selectedFacilityIds.includes(facility._id)
            ).map((facility: any) => ({
              name: facility.name,
              icon: facility.icon
            }));
          }
        } catch (facilitiesError: any) {
          console.warn('Erro ao buscar facilities:', facilitiesError);
          // Em caso de erro, continua sem facilities
        }
      }

      // --- MODIFICAÇÃO AQUI: Limpeza dos arrays de string antes de enviar ---
      const cleanedCategories = formData.category.filter(item => item && item.trim() !== '');
      const cleanedSports = formData.sport.filter(item => item && item.trim() !== '');
      const cleanedAchievements = formData.achievements.filter(item => item && item.trim() !== '');
      // --- FIM DA MODIFICAÇÃO ---

      const finalSportCenterData: SportCenterType = {
        ...formData,
        mainPhoto: mainPhotoUrl,
        profilePhoto: profilePhotoUrl,
        photos: photosUrls,
        // --- MODIFICAÇÃO AQUI ---
        category: cleanedCategories,
        sport: cleanedSports,
        achievements: cleanedAchievements,
        // --- FIM DA MODIFICAÇÃO ---
        coaches: parsedCoaches,
        dormitoryMainPhoto: dormitoryMainPhotoUrl,
        dormitoryPhotos: dormitoryPhotosUrls,
        facilities: parsedFacilities,
        hosterImage: hosterImageUrl,
        owner: user.id,
        ownerMail: user.email,
      };
      
      const token = localStorage.getItem('auth_token');
      const url = mode === 'edit' && (initialData as any)?._id 
        ? `/api/sportcenter/${(initialData as any)._id}` 
        : '/api/sportcenter';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalSportCenterData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Falha ao ${mode === 'edit' ? 'atualizar' : 'criar'} SportCenter`);
      }
      setSuccess(`SportCenter ${mode === 'edit' ? 'atualizado' : 'cadastrado'} com sucesso!`);
      if (mode === 'create') {
        resetFormStates();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Erro ao submeter formulário:", err);
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) return <p>Carregando dados do usuário...</p>;
  if (!user) return <p>Por favor, faça login para cadastrar um Sport Center.</p>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <fieldset className={styles.fieldset}>
        <legend>Informações Básicas</legend>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome do Sport Center *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="sportcenterBio">Bio do Sport Center</label>
          <textarea name="sportcenterBio" value={formData.sportcenterBio || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category">Categorias (separadas por vírgula)</label>
          {/* Corrigido o tipo de fieldName para a função específica */}
          <input type="text" name="category" value={Array.isArray(formData.category) ? formData.category.join(', ') : ''} onChange={(e) => handleArrayStringChange('category', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="sport">Esportes Principais (separados por vírgula) *</label>
          <input type="text" name="sport" value={Array.isArray(formData.sport) ? formData.sport.join(', ') : ''} onChange={(e) => handleArrayStringChange('sport', e.target.value)} required />
        </div>
         <div className={styles.formGroup}>
          <label htmlFor="extraSport">Esporte Extra/Secundário</label>
          <input type="text" name="extraSport" value={formData.extraSport || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="yearOfFoundation">Ano de Fundação</label>
          <input type="text" name="yearOfFoundation" value={formData.yearOfFoundation || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="badge">Badge (Ex: "Oficial", "Verificado")</label>
          <input type="text" name="badge" value={formData.badge || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="experienceCost">Custo da Experiência (valor numérico)</label>
          <input type="number" name="experienceCost" value={formData.experienceCost || 0} onChange={handleChange} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Localização *</legend>
        {Object.keys(initialLocationState).map((key) => (
          <div className={styles.formGroup} key={key}>
            <label htmlFor={`location.${key}`}>{key.replace('_', ' ')} {key === 'city' || key === 'country' || key === 'state' || key === 'street' || key === 'zip_code' ? '*' : ''}</label>
            <input
              type="text"
              name={`location.${key}`}
              value={formData.location[key as keyof LocationType] || ''}
              onChange={handleChange}
              required={key === 'city' || key === 'country' || key === 'state' || key === 'street' || key === 'zip_code'}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Mídias</legend>
        <div className={styles.formGroup}>
          <label htmlFor="mainPhotoFile">Foto Principal</label>
          <input type="file" name="mainPhotoFile" onChange={handleSingleFileChange(setMainPhotoFile)} accept="image/*" />
          {mainPhotoFile && <img src={URL.createObjectURL(mainPhotoFile)} alt="Preview Foto Principal" className={styles.previewImage} />}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="profilePhotoFile">Foto de Perfil (Logo)</label>
          <input type="file" name="profilePhotoFile" onChange={handleSingleFileChange(setProfilePhotoFile)} accept="image/*" />
          {profilePhotoFile && <img src={URL.createObjectURL(profilePhotoFile)} alt="Preview Foto Perfil" className={styles.previewImage} />}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="photosFiles">Outras Fotos (selecione múltiplas)</label>
          <input type="file" name="photosFiles" onChange={handleMultipleFilesChange(setPhotosFiles)} accept="image/*" multiple />
          {photosFiles && Array.from(photosFiles).map((file, index) => (
            <img key={index} src={URL.createObjectURL(file)} alt={`Preview Foto Adicional ${index + 1}`} className={styles.previewImage} />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Informações do Anfitrião</legend>
        <div className={styles.formGroup}>
          <label htmlFor="hosterName">Nome do Anfitrião</label>
          <input type="text" name="hosterName" value={formData.hosterName || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="hostBio">Bio do Anfitrião</label>
          <textarea name="hostBio" value={formData.hostBio || ''} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="hosterImageFile">Foto do Anfitrião</label>
          <input type="file" name="hosterImageFile" onChange={handleSingleFileChange(setHosterImageFile)} accept="image/*" />
          {hosterImageFile && <img src={URL.createObjectURL(hosterImageFile)} alt="Preview Foto Anfitrião" className={styles.previewImage} />}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Dormitório</legend>
        <div className={styles.formGroup}>
          <label>
            <input type="checkbox" name="dormitory" checked={formData.dormitory} onChange={handleChange} />
            Possui Dormitório? *
          </label>
        </div>
        {formData.dormitory && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="dormitoryCosts">Custo do Dormitório (por noite/período)</label>
              <input type="number" name="dormitoryCosts" value={formData.dormitoryCosts || 0} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dormitoryMainPhotoFile">Foto Principal do Dormitório</label>
              <input type="file" name="dormitoryMainPhotoFile" onChange={handleSingleFileChange(setDormitoryMainPhotoFile)} accept="image/*" />
              {dormitoryMainPhotoFile && <img src={URL.createObjectURL(dormitoryMainPhotoFile)} alt="Preview Foto Dormitório" className={styles.previewImage} />}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dormitoryPhotosFiles">Outras Fotos do Dormitório (selecione múltiplas)</label>
              <input type="file" name="dormitoryPhotosFiles" onChange={handleMultipleFilesChange(setDormitoryPhotosFiles)} accept="image/*" multiple />
              {dormitoryPhotosFiles && Array.from(dormitoryPhotosFiles).map((file, index) => (
                <img key={index} src={URL.createObjectURL(file)} alt={`Preview Foto Dormitório Adicional ${index + 1}`} className={styles.previewImage} />
              ))}
            </div>
          </>
        )}
      </fieldset>
      
      <fieldset className={styles.fieldset}>
        <legend>Conquistas</legend>
        <div className={styles.formGroup}>
          <label htmlFor="achievements">Lista de Conquistas (separadas por vírgula)</label>
          <textarea name="achievements" value={Array.isArray(formData.achievements) ? formData.achievements.join(', ') : ''} onChange={(e) => handleArrayStringChange('achievements', e.target.value)} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Coaches</legend>
        <CoachSelector
          selectedCoaches={selectedCoachIds}
          onSelectionChange={setSelectedCoachIds}
          label="Selecione os coaches disponíveis"
          multiple={true}
        />
      </fieldset>
      
      <fieldset className={styles.fieldset}>
        <legend>Facilities</legend>
        <FacilitySelector
          selectedFacilities={selectedFacilityIds}
          onSelectionChange={setSelectedFacilityIds}
          label="Selecione as facilities disponíveis"
          multiple={true}
        />
      </fieldset>

      <button type="submit" disabled={loading || authLoading} className={styles.submitButton}>
        {loading 
          ? (mode === 'edit' ? 'Atualizando...' : 'Cadastrando...') 
          : (mode === 'edit' ? 'Atualizar Sport Center' : 'Cadastrar Sport Center')
        }
      </button>
    </form>
  );
}