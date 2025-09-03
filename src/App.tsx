import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import SubjectGrid from './components/landing/SubjectGrid';
import Pricing from './components/landing/Pricing';
import LearnerDashboard from './components/dashboard/LearnerDashboard';
import InstructorDashboard from './components/dashboard/InstructorDashboard';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import Footer from './components/Footer';
import GetHelpButton from './components/common/GetHelpButton';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // Simple routing based on hash or user state
  const currentPage = window.location.hash.slice(1) || 'home';

  const renderPage = () => {
    if (user && currentPage === 'home') {
      // If user is logged in and on home, show dashboard
      return user.role === 'learner' ? <LearnerDashboard /> : <InstructorDashboard />;
    }

    switch (currentPage) {
      case 'dashboard':
        return user?.role === 'learner' ? <LearnerDashboard /> : <InstructorDashboard />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <HowItWorks />
            <SubjectGrid />
            <Pricing />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <GetHelpButton />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;