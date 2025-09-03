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
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            ...userData,
            id: firebaseUser.uid,
            email: firebaseUser.email || userData.email,
            isOnline: true
          });
        } else {
          // Create basic user profile if it doesn't exist
          const basicUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'learner',
            rating: 0,
            isVerified: firebaseUser.emailVerified,
            isOnline: true,
            responseTime: 0,
            totalSessions: 0
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), basicUser);
          setUser(basicUser);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
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
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'User',
          email: result.user.email || '',
          role: 'learner',
          rating: 0,
          isVerified: result.user.emailVerified,
          isOnline: true,
          responseTime: 0,
          totalSessions: 0
        };
        
        await setDoc(doc(db, 'users', result.user.uid), newUser);
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
      await updateProfile(result.user, {
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
        isVerified: result.user.emailVerified,
        isOnline: true,
        responseTime: 0,
        totalSessions: 0
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
      // Update user status to offline before signing out
      if (user) {
        await updateDoc(doc(db, 'users', user.id), {
          isOnline: false
        });
      }
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
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.id), userData);
      
      // Update Firebase Auth profile if name changed
      if (userData.name && firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: userData.name
        });
      }
      
      // Update local state
      setUser({ ...user, ...userData });
      return true;
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