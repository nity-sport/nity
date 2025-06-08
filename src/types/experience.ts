// src/types/experience.ts
export interface ExperienceLocationCoordinates {
  lat: number;
  lng: number;
}

export interface ExperienceLocation {
  name: string;
  address: string;
  coordinates: ExperienceLocationCoordinates;
}

export interface ExperienceOwner {
  name: string;
  avatarUrl?: string;
  userId: string;
}

export interface ExperienceType {
  _id?: string;
  title: string;
  description: string;
  coverImage: string; // URL
  gallery: string[]; // URLs
  category: 'tour' | 'event';
  tags?: string[];
  location: ExperienceLocation;
  duration?: string; // Ex: "2 horas", "1 dia"
  price: number;
  currency: string;
  availableDates: string[]; // Para o formulário, trataremos como strings ISO, depois convertemos para Date
  isFeatured?: boolean;
  visibility: 'public' | 'private' | 'draft';
  owner: ExperienceOwner; // Será preenchido pelo backend/frontend com dados do useAuth
  createdAt?: Date;
  updatedAt?: Date;
}