import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import SubjectGrid from './components/landing/SubjectGrid';
import Pricing from './components/landing/Pricing';
import TestimonialSection from './components/testimonials/TestimonialSection';
import LearnerDashboard from './components/dashboard/LearnerDashboard';
import InstructorDashboard from './components/dashboard/InstructorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import ProfileSettings from './components/profile/ProfileSettings';
import InstructorLeaderboard from './components/instructor/InstructorLeaderboard';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import Footer from './components/Footer';
import GetHelpButton from './components/common/GetHelpButton';
import MobileNavigation from './components/mobile/MobileNavigation';
import { useState } from 'react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showGetHelp, setShowGetHelp] = useState(false);

  // Simple routing based on hash or user state
  const currentPage = window.location.hash.slice(1) || 'home';

  const handleNavigate = (page: string) => {
    window.location.hash = page;
    window.location.reload(); // Simple refresh for demo
  };

  const handleGetHelp = () => {
    setShowGetHelp(true);
  };
  const renderPage = () => {
    if (user && currentPage === 'home') {
      // If user is logged in and on home, show dashboard
      if (user.role === 'learner') return <LearnerDashboard />;
      if (user.role === 'instructor') return <InstructorDashboard />;
      if (user.role === 'admin') return <AdminDashboard />;
    }

    switch (currentPage) {
      case 'dashboard':
        if (user?.role === 'learner') return <LearnerDashboard />;
        if (user?.role === 'instructor') return <InstructorDashboard />;
        if (user?.role === 'admin') return <AdminDashboard />;
        return <div>Please log in to access dashboard</div>;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'profile':
        return user ? <ProfileSettings /> : <div>Please log in to access profile</div>;
      case 'leaderboard':
        return <InstructorLeaderboard />;
      case 'analytics':
        return user?.role === 'admin' ? <AnalyticsDashboard /> : <div>Access denied</div>;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <HowItWorks />
            <SubjectGrid />
            <TestimonialSection />
            <Pricing />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <GetHelpButton />
      <MobileNavigation 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onGetHelp={handleGetHelp}
      />
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