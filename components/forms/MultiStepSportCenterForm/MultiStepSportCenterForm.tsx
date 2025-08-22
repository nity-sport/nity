import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  MultiStepFormProvider,
  FormStep,
  useMultiStepForm,
} from './MultiStepFormProvider';
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

interface FormDataType
  extends Omit<
    Partial<SportCenterType>,
    'photos' | 'dormitoryPhotos' | 'hosterImage' | 'facilities'
  > {
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
  {
    id: 3,
    title: 'Quais esportes seu centro oferece?',
    component: Step3_Sports,
  },
  {
    id: 4,
    title: 'Quem vai representar seu Sportcenter',
    component: Step4_Host,
  },
  {
    id: 5,
    title: 'Adicione fotos do seu Centro esportivo',
    component: Step5_Photos,
  },
  {
    id: 6,
    title: 'Quais as conquistas do seu centro?',
    component: Step6_Achievements,
  },
  {
    id: 7,
    title: 'Quais facilidades seu centro possui',
    component: Step7_Facilities,
  },
  { id: 8, title: 'Localização', component: Step8_Location },
  { id: 9, title: 'Categorias que pratica', component: Step9_Categories },
  {
    id: 10,
    title: 'Seu centro possue Dormitórios?',
    component: Step10A_DormitoryQuestion,
    isOptional: true,
  },
  {
    id: 11,
    title: 'Valor da diária',
    component: Step10B_DailyRate,
    isOptional: true,
  },
  {
    id: 12,
    title: 'Fotos do dormitório',
    component: Step10C_DormitoryPhotos,
    isOptional: true,
  },
  {
    id: 13,
    title: 'Facilidades do dormitório',
    component: Step10D_DormitoryFacilities,
    isOptional: true,
  },
  {
    id: 14,
    title: 'Qual o valor da sua experiência?',
    component: Step11_Pricing,
  },
  { id: 15, title: 'CRIAR UMA CONTA', component: Step12_CreateAccount },
  { id: 16, title: 'Termos de uso', component: Step12_Terms },
  { id: 17, title: 'Sucesso', component: Step13_Success },
];

export function MultiStepSportCenterForm({
  initialData,
  onCancel,
}: MultiStepSportCenterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/sportcenters');
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          0.8
        ); // 80% quality
      };

      img.onerror = () => resolve(file); // Fallback to original if loading fails
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File | null): Promise<string> => {
    if (!file) {
      return '';
    }
    // Compress image if it's an image and larger than 2MB
    let fileToUpload = file;
    if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      fileToUpload = await compressImage(file);
    }

    // Check individual file size (5MB limit for upload to work around Vercel limits)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (fileToUpload.size > maxFileSize) {
      throw new Error(
        `Arquivo muito grande após compressão: ${file.name} (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB). Tente uma imagem menor.`
      );
    }
    const uploadFormData = new FormData();
    uploadFormData.append('file', fileToUpload);

    try {
      const token = localStorage.getItem('auth_token');

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: uploadFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `Erro no upload do arquivo: ${file.name}`;
        try {
          const errData = await res.json();
          errorMessage = errData.error || errorMessage;
        } catch (_) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await res.text();
            if (
              errorText.includes('Request Entity Too Large') ||
              res.status === 413
            ) {
              errorMessage = `Arquivo muito grande: ${file.name}. Tente com uma imagem menor.`;
            } else if (res.status === 500) {
              errorMessage = `Erro interno no upload: ${file.name}`;
            } else {
              errorMessage = `Erro no upload (${res.status}): ${file.name}`;
            }
          } catch (_) {
            errorMessage = `Erro no upload (${res.status}): ${file.name}`;
          }
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
          console.error('❌ Error parsing upload response JSON:', jsonError);
          throw new Error(`Erro ao processar resposta do upload: ${file.name}`);
        }

        return data.url;
      } catch (uploadError: any) {
        console.error('Erro no upload:', uploadError);
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
      setIsSubmitting(true);

      try {
        // Validate all files before starting uploads
        const maxFileSize = 50 * 1024 * 1024; // 50MB original file limit (will be compressed)
        const filesToCheck: Array<{ file: File; name: string }> = [];

        // Check logo
        if (formData.logo && formData.logo instanceof File) {
          filesToCheck.push({ file: formData.logo, name: 'Logo' });
        }

        // Check hoster image
        if (formData.hosterImage && formData.hosterImage instanceof File) {
          filesToCheck.push({
            file: formData.hosterImage,
            name: 'Foto do representante',
          });
        }

        // Check photos
        if (Array.isArray(formData.photos)) {
          formData.photos.forEach((item, index) => {
            if (item instanceof File) {
              filesToCheck.push({ file: item, name: `Foto ${index + 1}` });
            }
          });
        }

        // Check dormitory photos
        if (Array.isArray(formData.dormitoryPhotos)) {
          formData.dormitoryPhotos.forEach((item, index) => {
            if (item instanceof File) {
              filesToCheck.push({
                file: item,
                name: `Foto do dormitório ${index + 1}`,
              });
            }
          });
        }

        // Validate each file (allow larger files that will be compressed)
        // let totalSize = 0;
        for (const { file, name } of filesToCheck) {
          if (file.size > maxFileSize) {
            throw new Error(
              `${name} muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Tente uma imagem menor.`
            );
          }
          // totalSize += file.size;
        }
        // Upload files first
        const mainPhotoUrl = await uploadFile(formData.logo || null);
        const hosterImageUrl = await uploadFile(
          formData.hosterImage instanceof File ? formData.hosterImage : null
        );
        // Handle photos array
        const photosFiles: File[] = [];
        if (Array.isArray(formData.photos)) {
          formData.photos.forEach(item => {
            if (item instanceof File) {
              photosFiles.push(item);
            }
          });
        }
        const photosUrls = await uploadMultipleFiles(photosFiles);
        // Handle dormitory photos array
        const dormitoryPhotosFiles: File[] = [];
        if (Array.isArray(formData.dormitoryPhotos)) {
          formData.dormitoryPhotos.forEach(item => {
            if (item instanceof File) {
              dormitoryPhotosFiles.push(item);
            }
          });
        }
        const dormitoryPhotosUrls =
          await uploadMultipleFiles(dormitoryPhotosFiles);
        // Prepare final data with uploaded URLs
        const finalSportCenterData = {
          ...formData,
          mainPhoto: mainPhotoUrl,
          hosterImage: hosterImageUrl,
          photos: photosUrls,
          dormitoryPhotos: dormitoryPhotosUrls,
          // Convert facilities from string[] to FacilityType[]
          facilities: formData.facilities?.map(name => ({ name })) || [],
          // Remove file objects and temp fields
          logo: undefined as any,
          termsAccepted: undefined as any,
          accountData: undefined as any,
          userAccount: undefined as any,
        };

        // Send JSON data to SportCenter API
        const token = localStorage.getItem('auth_token');
        // Log payload size for debugging (no limit on total size)
        const jsonString = JSON.stringify(finalSportCenterData);
        new Blob([jsonString]).size;

        const response = await fetch('/api/sportcenter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(finalSportCenterData),
        });

        if (response.ok) {
          try {
            await response.json();
            // Success - now move to success step
            return true;
          } catch (_) {
            console.error('❌ Error parsing success response JSON:', _);
            return true; // Assume success if we can't parse JSON but status is ok
          }
        } else {
          console.error(
            '❌ Error creating SportCenter - Status:',
            response.status
          );
          console.error('❌ Response headers:', response.headers);

          let errorMessage = 'Erro ao criar SportCenter';
          try {
            const errorData = await response.json();
            console.error('❌ Error data:', errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (_) {
            // If JSON parsing fails, try to get text response
            try {
              const errorText = await response.text();
              console.error('❌ Error response text:', errorText);

              // Check for common server errors
              if (
                errorText.includes('Request Entity Too Large') ||
                response.status === 413
              ) {
                errorMessage =
                  'Arquivos muito grandes. Tente com imagens menores.';
              } else if (errorText.includes('Payload Too Large')) {
                errorMessage =
                  'Dados muito grandes. Tente reduzir o tamanho das imagens.';
              } else if (response.status === 500) {
                errorMessage = 'Erro interno do servidor. Tente novamente.';
              } else if (response.status === 401) {
                errorMessage = 'Não autorizado. Faça login novamente.';
              } else if (response.status === 403) {
                errorMessage = 'Acesso negado. Verifique suas permissões.';
              } else {
                errorMessage = `Erro do servidor (${response.status}): ${errorText.substring(0, 100)}`;
              }
            } catch (_) {
              console.error('❌ Error parsing error response:', _);
              errorMessage = `Erro do servidor (${response.status})`;
            }
          }

          throw new Error(errorMessage);
        }
      } catch (error: any) {
        console.error('Error submitting form:', error);

        // Show more specific error message to user
        const errorMessage =
          error.message || 'Erro ao criar SportCenter. Tente novamente.';
        alert(errorMessage);

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

  function MultiStepFormContent({
    onCancel,
    onSubmit,
    isSubmitting,
  }: MultiStepFormContentProps) {
    const { state, nextStep } = useMultiStepForm();

    const CurrentStepComponent = state.steps[state.currentStep]?.component;

    const handleSubmit = async () => {
      if (!isSubmitting) {
        const success = await onSubmit(state.formData);
        if (success) {
          // Move to success step after successful submission
          nextStep();
        }
      }
    };

    return (
      <div className={styles.formContainer}>
        <StepNavigation onCancel={onCancel} onSubmit={handleSubmit}>
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
