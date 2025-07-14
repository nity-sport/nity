import React, { useState } from 'react';
import styles from './FormComponents.module.css';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'time';
  required?: boolean;
  error?: string;
}

export function FormInput({ label, value, onChange, placeholder, type = 'text', required, error }: FormInputProps) {
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <InputComponent
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        rows={type === 'textarea' ? 4 : undefined}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function FormSelect({ label, value, onChange, options, placeholder, required, error }: FormSelectProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.select} ${error ? styles.inputError : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

interface FileUploadProps {
  label: string;
  onFileSelect: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  supportedFormats?: string[];
  error?: string;
}

export function FileUpload({ label, onFileSelect, accept, multiple, maxSize = 1024 * 1024, supportedFormats, error }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <div
        className={`${styles.fileUpload} ${dragActive ? styles.dragActive : ''} ${error ? styles.inputError : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className={styles.fileInput}
        />
        <div className={styles.fileUploadContent}>
          <span className={styles.fileUploadText}>Inserir arquivo</span>
          {supportedFormats && (
            <span className={styles.fileUploadHint}>
              Limite de {Math.round(maxSize / (1024 * 1024))}MB, formatos ({supportedFormats.join(', ')})
            </span>
          )}
        </div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={styles.checkbox}
        />
        <span className={styles.checkboxText}>{label}</span>
      </label>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RadioGroup({ label, options, value, onChange, error }: RadioGroupProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.radioGroup}>
        {options.map(option => (
          <label key={option.value} className={styles.radioLabel}>
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className={styles.radio}
            />
            <span className={styles.radioText}>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function Toggle({ label, checked, onChange, error }: ToggleProps) {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.toggleWrapper}>
        <label className={styles.label}>{label}</label>
        <div className={styles.toggleContainer}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSlider}></span>
        </div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}