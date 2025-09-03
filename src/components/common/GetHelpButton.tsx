import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GetHelpModal from './GetHelpModal';

const GetHelpButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user || user.role !== 'learner') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 group"
        aria-label="Get help now"
      >
        <Zap className="w-6 h-6" />
        <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Get Help Now
        </span>
      </button>

      {showModal && (
        <GetHelpModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default GetHelpButton;