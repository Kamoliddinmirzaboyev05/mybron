import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User, AuthResponse } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<{ error: any }>;
  signUp: (fullName: string, login: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = api.getToken();
    
    if (token) {
      // Always try to get the latest profile if we have a token
      api.getProfile()
        .then(profile => {
          setUser(profile);
          api.setUser(profile); // Update stored user just in case
          setLoading(false);
        })
        .catch(() => {
          // Token is invalid, clear it
          api.clearToken();
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (login: string, password: string) => {
    try {
      const response = await api.login({ login, password });
      api.setToken(response.token);
      api.setUser(response.user);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (fullName: string, login: string, password: string) => {
    try {
      const response = await api.register({ fullName, login, password, role: 'user' });
      api.setToken(response.token);
      api.setUser(response.user);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
