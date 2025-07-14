import React, { useState } from 'react';
import { useMultiStepForm } from '../MultiStepFormProvider';
import styles from './Steps.module.css';

interface PhotoItem {
  id: string;
  file: File;
  url: string;
  isMain: boolean;
}

export function Step10C_DormitoryPhotos() {
  const { state, dispatch } = useMultiStepForm();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: PhotoItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = `dormitory-photo-${Date.now()}-${i}`;
        const url = URL.createObjectURL(file);
        
        newPhotos.push({
          id,
          file,
          url,
          isMain: photos.length === 0 && i === 0
        });
      }
      
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          dormitoryPhotos: updatedPhotos.map(p => p.file)
        }
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    setDraggedItem(photoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedItem && targetIndex > 0) { // Can't drop on position 0 (upload slot)
      const draggedIndex = photos.findIndex(p => p.id === draggedItem);
      const actualTargetIndex = targetIndex - 1; // Adjust for upload slot
      
      if (draggedIndex !== -1 && draggedIndex !== actualTargetIndex) {
        const newPhotos = [...photos];
        const draggedPhoto = newPhotos[draggedIndex];
        
        newPhotos.splice(draggedIndex, 1);
        newPhotos.splice(actualTargetIndex, 0, draggedPhoto);
        
        setPhotos(newPhotos);
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            dormitoryPhotos: newPhotos.map(p => p.file)
          }
        });
      }
    }
    
    setDraggedItem(null);
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        dormitoryPhotos: updatedPhotos.map(p => p.file)
      }
    });
    setShowDeleteModal(null);
  };

  const handleSetMainPhoto = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId
    }));
    setPhotos(updatedPhotos);
  };

  // Render 6 slots (first slot always upload, next 5 for photos)
  const renderPhotoSlots = () => {
    const slots = [];
    
    // First slot: always upload
    slots.push(
      <div key="upload" className={`${styles.photoSlot} ${styles.firstSlot}`}>
        <input
          type="file"
          id="dormitory-photo-upload"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className={styles.fileInput}
        />
        <label htmlFor="dormitory-photo-upload" className={styles.photoUploadButton}>
          <span className={`${styles.uploadIcon} ${styles.firstSlotIcon}`}>+</span>
        </label>
      </div>
    );
    
    // Next 5 slots: for photos
    for (let i = 1; i < 6; i++) {
      const photo = photos[i - 1]; // Adjust index for photos array
      
      if (photo) {
        slots.push(
          <div
            key={photo.id}
            className={`${styles.photoSlot} ${styles.photoContainer} ${draggedItem === photo.id ? styles.dragging : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
          >
            <img src={photo.url} alt="Dormitório" className={styles.photoImage} />
            {photo.isMain && (
              <div className={styles.mainBadge}>Main</div>
            )}
            <div className={styles.photoActions}>
              {!photo.isMain && (
                <button
                  className={styles.setMainButton}
                  onClick={() => handleSetMainPhoto(photo.id)}
                >
                  main
                </button>
              )}
              <button
                className={styles.deleteButton}
                onClick={() => setShowDeleteModal(photo.id)}
              >
                ×
              </button>
            </div>
          </div>
        );
      } else {
        slots.push(
          <div
            key={`empty-${i}`}
            className={`${styles.photoSlot} ${styles.emptySlot}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
          >
            {/* Empty slot for drag and drop */}
          </div>
        );
      }
    }
    
    return slots;
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.photosSection}>
        <label className={styles.photosLabel}>Confira a ordem das fotos</label>
        <div className={styles.photosGrid}>
          {renderPhotoSlots()}
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.deleteModal} onClick={() => setShowDeleteModal(null)}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.deleteModalCloseButton}
              onClick={() => setShowDeleteModal(null)}
            >
              ×
            </button>
            <div className={styles.deleteModalIcon}>
              <div className={styles.deleteModalIconCircle}>!</div>
            </div>
            <h3 className={styles.deleteModalTitle}>Tem certeza que deseja excluir a imagem?</h3>
            <div className={styles.deleteModalActions}>
              <button 
                className={styles.deleteModalCancelButton}
                onClick={() => setShowDeleteModal(null)}
              >
                Não, cancelar
              </button>
              <button 
                className={styles.deleteModalConfirmButton}
                onClick={() => handleDeletePhoto(showDeleteModal)}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}