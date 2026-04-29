import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
    // Check if user is already logged in (read from localStorage)
    const token = api.getToken();
    if (token) {
      const stored = api.getUser();
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const signIn = async (phone: string, code: string) => {
    try {
      const response = await api.login({ phone, code });
      api.setTokens(response.access, response.refresh);
      api.setUser(response.user);
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
      api.setTokens(response.access, response.refresh);
      api.setUser(response.user);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, sendOTP, verifyOTP, webAuth, signOut }}>
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
