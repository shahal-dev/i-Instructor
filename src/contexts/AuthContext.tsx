import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful login
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email,
          role: email.includes('instructor') ? 'instructor' : 'learner',
          university: 'University of Dhaka',
          department: 'Computer Science',
          year: 3,
          skills: ['JavaScript', 'Python', 'Mathematics'],
          bio: 'Passionate about helping students learn programming and mathematics.',
          rating: 4.8,
          isVerified: true,
          isOnline: true,
          responseTime: 2,
          totalSessions: 156
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setIsLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'learner',
          university: userData.university,
          department: userData.department,
          year: userData.year,
          skills: userData.skills || [],
          bio: userData.bio,
          rating: 0,
          isVerified: false,
          isOnline: true,
          responseTime: 0,
          totalSessions: 0
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        setIsLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        resolve(true);
      }, 500);
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};