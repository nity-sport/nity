import { CoachType } from "./coach";
import { FacilityType } from "./facility";
import { LocationType } from "./location";



export interface SportCenterType {
  name: string;
  mainPhoto?: string;
  profilePhoto?: string;
  photos?: string[];
  category: string[];
  achievements?: string[];
  badge?: string;
  coaches?: CoachType[];
  dormitory: boolean;
  dormitoryCosts?: number;
  dormitoryMainPhoto?: string;
  dormitoryPhotos?: string[];
  experienceCost?: number;
  extraSport?: string;
  facilities?: FacilityType[];
  hostBio?: string;
  hosterImage?: string;
  hosterName?: string;
  location: LocationType;
  owner: string;
  ownerMail?: string;
  sport: string[];
  sportcenterBio?: string;
  yearOfFoundation?: string;
  hosterSince?: string;
}
