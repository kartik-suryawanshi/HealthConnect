import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  specialty?: string;
  hospital?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token and user
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        throw new Error('Token invalid');
      }
    } catch (error) {
      // Token is invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${userData.name}!`,
        });

        // Navigate based on role
        if (userData.role === 'patient') {
          navigate('/patient');
        } else {
          navigate('/doctor');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.register(userData);
      if (response.success && response.data) {
        const { user: newUser, token: userToken } = response.data;
        setUser(newUser);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        toast({
          title: 'Registration successful',
          description: `Welcome to HealthConnect, ${newUser.name}!`,
        });

        // Navigate based on role
        if (newUser.role === 'patient') {
          navigate('/patient');
        } else {
          navigate('/doctor');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
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

