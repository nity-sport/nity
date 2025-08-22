import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AuthContextType,
  AuthState,
  AuthAction,
  User,
  UserRole,
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  let newState: AuthState;
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload };
      break;
    case 'SET_USER':
      newState = { ...state, user: action.payload, isLoading: false };
      break;
    case 'LOGIN_SUCCESS':
      newState = { ...state, user: action.payload, isLoading: false };
      break;
    case 'LOGOUT':
      newState = { ...state, user: null, isLoading: false };
      break;
    case 'UPDATE_PROFILE':
      newState = {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
      break;
    default:
      newState = state;
  }
  return newState;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkInitialAuth = async () => {
      await checkAuthStatus();
      // O console.log do estado atualizado é melhor no reducer ou no valor do provider
    };
    checkInitialAuth();
  }, []); // Removido checkAuthStatus da dependência para evitar loop se ele próprio mudar estado

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('auth_token');
      if (!token) {
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        localStorage.removeItem('auth_token');
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (_) {
      console.error('[Auth] checkAuthStatus - Erro:', _);
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token } = await response.json();
      localStorage.setItem('auth_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (_) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw _;
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      window.location.href = '/api/auth/google';
    } catch (_) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw _;
    }
  };

  const loginWithFacebook = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      window.location.href = '/api/auth/facebook';
    } catch (_) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw _;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    referralCode?: string
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, referralCode }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { user, token } = await response.json();
      localStorage.setItem('auth_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (_) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw _;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'LOGOUT' });

      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (_) {
      console.error('Logout error:', _);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
    } catch (_) {
      throw _;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const isSuperuser = state.user?.role === UserRole.SUPERUSER;
  const isMarketing = state.user?.role === UserRole.MARKETING;
  const isOwner = state.user?.role === UserRole.OWNER;
  const isScout = state.user?.role === UserRole.SCOUT;

  const canManageUsers = isSuperuser;
  const canCreateExperiences = state.user
    ? [UserRole.SUPERUSER, UserRole.MARKETING].includes(state.user.role)
    : false;
  const canManageSportCenters = state.user
    ? [UserRole.SUPERUSER, UserRole.OWNER].includes(state.user.role)
    : false;
  const canManageFacilities = isSuperuser;
  const canManageCoaches = isSuperuser;

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
    hasRole,
    hasAnyRole,
    isSuperuser,
    isMarketing,
    isOwner,
    isScout,
    canManageUsers,
    canCreateExperiences,
    canManageSportCenters,
    canManageFacilities,
    canManageCoaches,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
