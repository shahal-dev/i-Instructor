export interface User {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'instructor';
  avatar?: string;
  university?: string;
  department?: string;
  year?: number;
  skills?: string[];
  bio?: string;
  rating?: number;
  isVerified?: boolean;
  isOnline?: boolean;
  responseTime?: number; // in minutes
  totalSessions?: number;
  createdAt?: Date;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  phoneNumber?: string;
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    theme?: 'light' | 'dark';
  };
}

export interface Session {
  id: string;
  learnerId: string;
  instructorId: string;
  subject: string;
  topic: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime: Date;
  duration: number; // in minutes
  price: number;
  rating?: number;
  review?: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'code' | 'math';
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  averagePrice: number;
  availableInstructors: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  author: string;
  upvotes: number;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}