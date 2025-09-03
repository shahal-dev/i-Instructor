import React, { useState } from 'react';
import { Clock, Star, BookOpen, Users, TrendingUp, Calendar, Search, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GetHelpModal from '../common/GetHelpModal';
import SessionScheduler from '../scheduling/SessionScheduler';
import HomeworkHelp from '../homework/HomeworkHelp';

const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showGetHelpModal, setShowGetHelpModal] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showHomeworkHelp, setShowHomeworkHelp] = useState(false);

  const recentSessions = [
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Integration by Parts',
      instructor: 'Dr. Sarah Ahmed',
      date: '2 hours ago',
      duration: 18,
      rating: 5,
      status: 'completed'
    },
    {
      id: '2',
      subject: 'Computer Science',
      topic: 'Binary Search Trees',
      instructor: 'Mahmud Rahman',
      date: 'Yesterday',
      duration: 25,
      rating: 4,
      status: 'completed'
    },
    {
      id: '3',
      subject: 'Physics',
      topic: 'Quantum Mechanics',
      instructor: 'Prof. Lisa Chen',
      date: '3 days ago',
      duration: 30,
      rating: 5,
      status: 'completed'
    }
  ];

  const upcomingSessions = [
    {
      id: '4',
      subject: 'Chemistry',
      topic: 'Organic Reactions',
      instructor: 'Dr. Ahmed Hassan',
      time: 'Today, 3:00 PM',
      duration: 20
    }
  ];

  const stats = {
    totalSessions: 24,
    hoursLearned: 8.5,
    avgRating: 4.8,
    favoriteSubject: 'Mathematics'
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to learn something new today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setShowGetHelpModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-xl transition-colors text-left"
          >
            <Search className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Get Help Now</h3>
            <p className="text-orange-100 text-sm">Find an instructor instantly</p>
          </button>

          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg text-blue-900">Schedule Session</h3>
            <button 
              onClick={() => setShowScheduler(true)}
              className="text-blue-700 text-sm hover:text-blue-800 transition-colors"
            >
              Book for later
            </button>
          </div>

          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
            <BookOpen className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-lg text-green-900">Knowledge Base</h3>
            <a 
              href="#knowledge"
              className="text-green-700 text-sm hover:text-green-800 transition-colors"
            >
              Browse solutions
            </a>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-xl">
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-lg text-purple-900">Homework Help</h3>
            <button 
              onClick={() => setShowHomeworkHelp(true)}
              className="text-purple-700 text-sm hover:text-purple-800 transition-colors"
            >
              Submit assignment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursLearned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Subject</p>
                <p className="text-lg font-bold text-gray-900">{stats.favoriteSubject}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                      <p className="text-sm text-gray-600">{session.subject} • {session.instructor}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{session.date}</span>
                    <span>{session.duration} minutes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                    <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                    <p className="text-sm text-gray-600">{session.subject} • {session.instructor}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-blue-700 font-medium">{session.time}</span>
                      <span className="text-sm text-gray-500">{session.duration} minutes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming sessions</p>
                <button
                  onClick={() => setShowGetHelpModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Schedule one now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGetHelpModal && (
        <GetHelpModal onClose={() => setShowGetHelpModal(false)} />
      )}

      {showScheduler && (
        <SessionScheduler 
          onClose={() => setShowScheduler(false)}
          onSchedule={(data) => {
            console.log('Scheduled session:', data);
            setShowScheduler(false);
            alert('Session scheduled successfully!');
          }}
        />
      )}

      {showHomeworkHelp && (
        <HomeworkHelp onClose={() => setShowHomeworkHelp(false)} />
      )}
    </>
  );
};

export default LearnerDashboard;