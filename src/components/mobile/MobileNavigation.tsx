import React from 'react';
import { Home, Zap, BookOpen, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onGetHelp: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  onGetHelp 
}) => {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => onNavigate('home')
    },
    {
      id: 'help',
      label: 'Get Help',
      icon: Zap,
      onClick: onGetHelp,
      special: true
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      icon: BookOpen,
      onClick: () => onNavigate('knowledge')
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: MessageSquare,
      onClick: () => onNavigate('dashboard'),
      requireAuth: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => onNavigate('profile'),
      requireAuth: true
    }
  ];

  const visibleItems = navItems.filter(item => !item.requireAuth || user);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              item.special
                ? 'bg-orange-500 text-white'
                : currentPage === item.id
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;