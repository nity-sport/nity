import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, AuthAction, User, UserRole } from '../types/auth';

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
      console.log('[AuthReducer] LOGIN_SUCCESS - payload recebido:', action.payload);
      console.log('[AuthReducer] LOGIN_SUCCESS - role no payload:', action.payload?.role);
      newState = { ...state, user: action.payload, isLoading: false };
      console.log('[AuthReducer] LOGIN_SUCCESS - novo estado user:', newState.user);
      console.log('[AuthReducer] LOGIN_SUCCESS - role no novo estado:', newState.user?.role);
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
  console.log('[AuthReducer] Estado NOVO:', newState);
  console.log('[AuthReducer] Usuário autenticado após reducer:', !!newState.user);
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
      console.log('[Auth] Iniciando checkAuthStatus...');
      await checkAuthStatus();
      // O console.log do estado atualizado é melhor no reducer ou no valor do provider
    };
    checkInitialAuth();
  }, []); // Removido checkAuthStatus da dependência para evitar loop se ele próprio mudar estado
  
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('[Auth] checkAuthStatus - Verificando token...');
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('[Auth] checkAuthStatus - Nenhum token encontrado.');
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }
  
      console.log('[Auth] checkAuthStatus - Token encontrado, validando...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const user = await response.json();
        console.log('[Auth] checkAuthStatus - Usuário validado:', user);
        console.log('[Auth] checkAuthStatus - Role específico:', user.role);
        console.log('[Auth] checkAuthStatus - Todas as propriedades:', Object.keys(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        console.log('[Auth] checkAuthStatus - Falha ao validar token, limpando.');
        localStorage.removeItem('auth_token');
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('[Auth] checkAuthStatus - Erro:', error);
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
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      window.location.href = '/api/auth/google';
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      window.location.href = '/api/auth/facebook';
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, referralCode?: string) => {
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
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'LOGOUT' });
      
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
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
    } catch (error) {
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    console.log('[Auth] hasRole - state.user:', state.user);
    console.log('[Auth] hasRole - state.user?.role:', state.user?.role);
    console.log('[Auth] hasRole - target role:', role);
    console.log('[Auth] hasRole - comparison result:', state.user?.role === role);
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const isSuperuser = state.user?.role === UserRole.SUPERUSER;
  console.log('[Auth] isSuperuser calculation:');
  console.log('  - state.user:', state.user);
  console.log('  - state.user?.role:', state.user?.role);
  console.log('  - UserRole.SUPERUSER:', UserRole.SUPERUSER);
  console.log('  - Comparison result:', state.user?.role === UserRole.SUPERUSER);
  console.log('  - Final isSuperuser value:', isSuperuser);
  const isMarketing = state.user?.role === UserRole.MARKETING;
  const isOwner = state.user?.role === UserRole.OWNER;
  const isScout = state.user?.role === UserRole.SCOUT;

  const canManageUsers = isSuperuser;
  const canCreateExperiences = state.user ? [UserRole.SUPERUSER, UserRole.MARKETING].includes(state.user.role) : false;
  const canManageSportCenters = state.user ? [UserRole.SUPERUSER, UserRole.OWNER].includes(state.user.role) : false;
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