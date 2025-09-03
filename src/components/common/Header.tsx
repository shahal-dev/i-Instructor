import React, { useState } from 'react';
import { User, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                i-Instructor
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                How it Works
              </a>
              <a href="#subjects" className="text-gray-600 hover:text-blue-600 transition-colors">
                Subjects
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </a>
              {user && (
                <a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </a>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How it Works
                </a>
                <a href="#subjects" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Subjects
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </a>
                {user ? (
                  <>
                    <a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Dashboard
                    </a>
                    <div className="flex items-center space-x-2 pt-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-left text-red-600 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="text-left text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('register')}
                      className="text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-fit"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
};

export default Header;