import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPlayer: boolean;
  isOwner: boolean;
  signIn: (phone: string, code: string) => Promise<{ error: any }>;
  signUp: (data: {
    full_name: string;
    phone: string;
    code: string;
  }) => Promise<{ error: any }>;
  sendOTP: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, code: string) => Promise<{ exists: boolean; error: any }>;
  webAuth: (token: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          api.clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (phone: string, code: string) => {
    try {
      const response = await api.login({ phone, code });
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (data: {
    full_name: string;
    phone: string;
    code: string;
  }) => {
    try {
      const response = await api.register({ ...data, role: 'user' });
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      await api.sendOTP(phone);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const verifyOTP = async (phone: string, code: string) => {
    try {
      const response = await api.verifyOTP(phone, code);
      if (response.exists && response.user) {
        setUser(response.user);
      }
      return { exists: response.exists, error: null };
    } catch (error: any) {
      return { exists: false, error };
    }
  };

  const webAuth = async (token: string) => {
    try {
      const response = await api.webAuth(token);
      setUser(response.user);
      return { user: response.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isPlayer: user?.user_role === 'PLAYER',
    isOwner: user?.user_role === 'OWNER',
    signIn,
    signUp,
    sendOTP,
    verifyOTP,
    webAuth,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
