export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  MARKETING = 'MARKETING',
  OWNER = 'OWNER',
  SCOUT = 'SCOUT',
  USER = 'USER',
  ATHLETE = 'ATHLETE'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  role: UserRole;
  affiliateCode?: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isSuperuser: boolean;
  isMarketing: boolean;
  isOwner: boolean;
  isScout: boolean;
  canManageUsers: boolean;
  canCreateExperiences: boolean;
  canManageSportCenters: boolean;
  canManageFacilities: boolean;
  canManageCoaches: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };