import React, { useState } from 'react';
import { Clock, Users, Star, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../common/AuthModal';
import GetHelpModal from '../common/GetHelpModal';

const Hero: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGetHelpModal, setShowGetHelpModal] = useState(false);

  const handleGetHelp = () => {
    if (user && user.role === 'learner') {
      setShowGetHelpModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Headline */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stuck on homework?{' '}
              <span className="text-blue-600">Get help in 2 minutes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect instantly with qualified peers and instructors for short, focused learning sessions. 
              Available 24/7 for students across Bangladesh and beyond.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">2 min avg. wait time</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium">500+ active instructors</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">4.8/5 avg. rating</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button
              onClick={handleGetHelp}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Help Now
            </button>
            {!user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Become an Instructor
              </button>
            )}
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">S</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-2">Student</div>
                        <div className="bg-white rounded-lg p-3 text-left">
                          I'm stuck on this calculus problem. Can you help me understand integration by parts?
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">T</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-2">Instructor</div>
                        <div className="bg-white rounded-lg p-3 text-left">
                          Absolutely! Let me walk you through the formula step by step. The key is to remember LIATE...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Live Session Active</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Subject:</span>
                        <span className="font-semibold">Calculus</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold">12:34</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-semibold">$3/15min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          mode="register"
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => {}}
        />
      )}
      
      {showGetHelpModal && (
        <GetHelpModal onClose={() => setShowGetHelpModal(false)} />
      )}
    </>
  );
};

export default Hero;