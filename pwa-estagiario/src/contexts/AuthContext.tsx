import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  completeRegistration: (userId: string, registrationData: {
    contractStartDate: string;
    contractEndDate: string;
    totalContractHours: number;
    weeklyHours?: number;
    dailyHours?: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setUser(data.user);
      toast.success('Login realizado!');
      navigate('/home');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  const completeRegistration = async (userId: string, registrationData: {
    contractStartDate: string;
    contractEndDate: string;
    totalContractHours: number;
    weeklyHours?: number;
    dailyHours?: number;
  }) => {
    try {
      const { data } = await api.post('/auth/complete-registration', {
        userId,
        ...registrationData,
      });
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setUser(data.user);
      toast.success('Cadastro finalizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao finalizar cadastro');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, completeRegistration }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
