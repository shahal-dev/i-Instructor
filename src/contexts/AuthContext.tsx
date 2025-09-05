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
      
      const result = await signInWithPopup(auth, provider);
      setIsLoading(true);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'User',
          email: result.user.email || '',
          avatar: result.user.photoURL || undefined,
          role: 'learner',
          rating: 0,
          emailVerified: result.user.emailVerified,
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
        
        await setDoc(doc(db, 'users', result.user.uid), newUser);
      } else {
        // Update existing user's last login and online status
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLoginAt: new Date(),
          isOnline: true,
          avatar: result.user.photoURL || userDoc.data().avatar
        });
      }
      
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
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

      // Create user profile in Firestore
      const newUser: User = {
        id: result.user.uid,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'learner',
        university: userData.university,
        department: userData.department,
        year: userData.year,
        skills: userData.skills || [],
        bio: userData.bio,
        rating: 0,
        emailVerified: result.user.emailVerified,
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
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
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