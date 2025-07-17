import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MultiStepFormProvider, FormStep, useMultiStepForm } from './MultiStepFormProvider';
import { StepNavigation } from './StepNavigation';
import { Step1_Name } from './Steps/Step1_Name';
import { Step2_BasicData } from './Steps/Step2_BasicData';
import { Step3_Sports } from './Steps/Step3_Sports';
import { Step4_Host } from './Steps/Step4_Host';
import { Step5_Photos } from './Steps/Step5_Photos';
import { Step6_Achievements } from './Steps/Step6_Achievements';
import { Step7_Facilities } from './Steps/Step7_Facilities';
import { Step8_Location } from './Steps/Step8_Location';
import { Step9_Categories } from './Steps/Step9_Categories';
import { Step10A_DormitoryQuestion } from './Steps/Step10A_DormitoryQuestion';
import { Step10B_DailyRate } from './Steps/Step10B_DailyRate';
import { Step10C_DormitoryPhotos } from './Steps/Step10C_DormitoryPhotos';
import { Step10D_DormitoryFacilities } from './Steps/Step10D_DormitoryFacilities';
import { Step11_Pricing } from './Steps/Step11_Pricing';
import { Step12_CreateAccount } from './Steps/Step12_CreateAccount';
import { Step12_Terms } from './Steps/Step12_Terms';
import { Step13_Success } from './Steps/Step13_Success';
import { SportCenterType } from '../../../src/types/sportcenter';

interface FormDataType extends Omit<Partial<SportCenterType>, 'photos' | 'dormitoryPhotos' | 'hosterImage' | 'facilities'> {
  logo?: File;
  hosterImage?: File | string;
  photos?: File[] | string[];
  dormitoryPhotos?: File[] | string[];
  facilities?: string[];
  termsAccepted?: boolean;
  accountData?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  userAccount?: {
    token: string;
    user: any;
  };
}
import styles from './MultiStepSportCenterForm.module.css';

interface MultiStepSportCenterFormProps {
  initialData?: Partial<FormDataType>;
  onCancel?: () => void;
}

const steps: FormStep[] = [
  { id: 1, title: 'Nome do Sportcenter', component: Step1_Name },
  { id: 2, title: 'Dados básicos', component: Step2_BasicData },
  { id: 3, title: 'Esportes', component: Step3_Sports },
  { id: 4, title: 'Quem vai representar seu Sportcenter ?', component: Step4_Host },
  { id: 5, title: 'Adicione fotos do seu Centro esportivo', component: Step5_Photos },
  { id: 6, title: 'Conquistas', component: Step6_Achievements },
  { id: 7, title: 'Facilidades', component: Step7_Facilities },
  { id: 8, title: 'Localização', component: Step8_Location },
  { id: 9, title: 'Categorias', component: Step9_Categories },
  { id: 10, title: 'Dormitórios', component: Step10A_DormitoryQuestion, isOptional: true },
  { id: 11, title: 'Valor da diária', component: Step10B_DailyRate, isOptional: true },
  { id: 12, title: 'Fotos do dormitório', component: Step10C_DormitoryPhotos, isOptional: true },
  { id: 13, title: 'Facilidades do dormitório', component: Step10D_DormitoryFacilities, isOptional: true },
  { id: 14, title: 'Preços', component: Step11_Pricing },
  { id: 15, title: 'CRIAR UMA CONTA', component: Step12_CreateAccount },
  { id: 16, title: 'Termos', component: Step12_Terms },
  { id: 17, title: 'Sucesso', component: Step13_Success }
];

export function MultiStepSportCenterForm({ initialData, onCancel }: MultiStepSportCenterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/sportcenters');
    }
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) {
      console.log('📁 No file to upload, returning empty string');
      return '';
    }
    
    console.log('📤 Uploading file:', file.name, 'Size:', file.size);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: uploadFormData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Erro no upload do arquivo: ${file.name}`);
      }
      const data = await res.json();
      console.log('✅ File uploaded successfully:', file.name, '→', data.url);
      return data.url;
    } catch (uploadError: any) {
      console.error("Erro no upload:", uploadError);
      if (uploadError.name === 'AbortError') {
        throw new Error(`Upload timeout para arquivo: ${file.name}`);
      }
      throw uploadError;
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
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

  const handleSubmit = async (formData: FormDataType) => {
    console.log('🔥 handleSubmit called!');
    setIsSubmitting(true);
    
    try {
      // Upload files first
      console.log('📁 Starting file uploads...');
      console.log('📄 Logo file:', formData.logo);
      const mainPhotoUrl = await uploadFile(formData.logo || null);
      console.log('✅ Logo uploaded:', mainPhotoUrl);
      
      console.log('👤 Hoster image file:', formData.hosterImage);
      const hosterImageUrl = await uploadFile(formData.hosterImage instanceof File ? formData.hosterImage : null);
      console.log('✅ Hoster image uploaded:', hosterImageUrl);
      
      // Handle photos array
      console.log('📸 Processing photos array...');
      const photosFiles: File[] = [];
      if (Array.isArray(formData.photos)) {
        formData.photos.forEach(item => {
          if (item instanceof File) {
            photosFiles.push(item);
          }
        });
      }
      console.log('📸 Photos to upload:', photosFiles.length);
      const photosUrls = await uploadMultipleFiles(photosFiles);
      console.log('✅ Photos uploaded:', photosUrls);
      
      // Handle dormitory photos array
      console.log('🏠 Processing dormitory photos...');
      const dormitoryPhotosFiles: File[] = [];
      if (Array.isArray(formData.dormitoryPhotos)) {
        formData.dormitoryPhotos.forEach(item => {
          if (item instanceof File) {
            dormitoryPhotosFiles.push(item);
          }
        });
      }
      console.log('🏠 Dormitory photos to upload:', dormitoryPhotosFiles.length);
      const dormitoryPhotosUrls = await uploadMultipleFiles(dormitoryPhotosFiles);
      console.log('✅ Dormitory photos uploaded:', dormitoryPhotosUrls);

      // Prepare final data with uploaded URLs
      console.log('📋 Preparing final SportCenter data...');
      const finalSportCenterData = {
        ...formData,
        mainPhoto: mainPhotoUrl,
        hosterImage: hosterImageUrl,
        photos: photosUrls,
        dormitoryPhotos: dormitoryPhotosUrls,
        // Convert facilities from string[] to FacilityType[]
        facilities: formData.facilities?.map(name => ({ name })) || [],
        // Remove file objects and temp fields
        logo: undefined,
        termsAccepted: undefined,
        accountData: undefined,
        userAccount: undefined,
      };

      // Send JSON data to SportCenter API
      console.log('🌐 Starting API call...');
      const token = localStorage.getItem('auth_token');
      console.log('🚀 Submitting SportCenter data:', finalSportCenterData);
      console.log('🔑 Using token:', token ? 'Token present' : 'No token');
      
      const response = await fetch('/api/sportcenter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalSportCenterData)
      });

      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ SportCenter created successfully:', result);
        // Success - now move to success step
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Error creating SportCenter:', errorData);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', response.headers);
        throw new Error(errorData.message || 'Erro ao criar SportCenter');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
      alert('Erro ao criar SportCenter. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <MultiStepFormProvider steps={steps} initialData={initialData}>
        <MultiStepFormContent 
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </MultiStepFormProvider>
    </div>
  );
}

interface MultiStepFormContentProps {
  onCancel: () => void;
  onSubmit: (formData: FormDataType) => Promise<boolean>;
  isSubmitting: boolean;
}

function MultiStepFormContent({ onCancel, onSubmit, isSubmitting }: MultiStepFormContentProps) {
  const { state, nextStep } = useMultiStepForm();
  
  const CurrentStepComponent = state.steps[state.currentStep]?.component;

  const handleSubmit = async () => {
    console.log('🎯 MultiStepFormContent handleSubmit called!');
    if (!isSubmitting) {
      console.log('📋 Form data being submitted:', state.formData);
      const success = await onSubmit(state.formData);
      if (success) {
        console.log('✅ Submission successful, moving to success step');
        // Move to success step after successful submission
        nextStep();
      } else {
        console.log('❌ Submission failed');
      }
    } else {
      console.log('⏳ Already submitting, skipping');
    }
  };

  return (
    <div className={styles.formContainer}>
      <StepNavigation 
        onCancel={onCancel}
        onSubmit={handleSubmit}
      >
        {CurrentStepComponent && <CurrentStepComponent />}
      </StepNavigation>
      
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}>
            <span>Criando SportCenter...</span>
          </div>
        </div>
      )}
    </div>
  );
}