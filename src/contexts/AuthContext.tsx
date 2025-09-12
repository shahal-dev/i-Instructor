import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthContextType } from '../types';
import apiService from '../services/api';
import socketService from '../services/socket';

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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Authenticate with backend
          const userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || undefined,
            role: 'learner',
            emailVerified: firebaseUser.emailVerified,
          };
          
          const response = await apiService.authenticateWithFirebase(idToken, userData);
          
          if (response.success) {
            setUser(response.user);
            // Connect to socket server
            socketService.connect(response.user.id);
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
          // Fallback to basic user data
          const basicUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || undefined,
            role: 'learner',
            rating: 0,
            emailVerified: firebaseUser.emailVerified,
            isVerified: false,
            isOnline: true,
            responseTime: 0,
            totalSessions: 0,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            preferences: {
              notifications: true,
              emailUpdates: true,
              theme: 'light'
            }
          };
          setUser(basicUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        socketService.disconnect();
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Configure popup behavior
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      setIsLoading(true);
      
      // The user data will be handled by the onAuthStateChanged listener
      // which will authenticate with the backend automatically
      
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      setIsLoading(false);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        return false;
      } else if (error.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by browser');
        return false;
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return false;
      }
      
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await createUserWithEmailAndPassword(auth, userData.email!, password);
      
      // Update Firebase Auth profile
      await updateFirebaseProfile(result.user, {
        displayName: userData.name
      });

      // User profile will be created by the backend via the onAuthStateChanged listener
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Logout from backend
      await apiService.logout();
      // Disconnect socket
      socketService.disconnect();
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Update profile via API
      const response = await apiService.updateProfile(userData);
      
      if (response.success) {
        // Update Firebase Auth profile if name changed
        if (userData.name && firebaseUser) {
          await updateFirebaseProfile(firebaseUser, {
            displayName: userData.name
          });
        }
        
        // Update local state
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};