// src/types/accommodation.ts
import { LocationType } from './location';
import { FacilityType } from './facility';

export interface AccommodationType {
  name: string;
  category?: string;
  coverImage?: string;
  images?: string[];
  facilities?: FacilityType[];
  location: LocationType;
}
