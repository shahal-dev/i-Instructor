import React from 'react';
import { DollarSign, Users, Clock, Star, TrendingUp, Calendar, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  const earnings = {
    today: 24.50,
    thisWeek: 156.75,
    thisMonth: 642.30,
    total: 2847.90
  };

  const stats = {
    totalSessions: 156,
    averageRating: 4.8,
    responseTime: 2,
    activeStudents: 43
  };

  const recentSessions = [
    {
      id: '1',
      student: 'Ahmad Rahman',
      subject: 'Calculus',
      topic: 'Integration by Parts',
      duration: 18,
      earning: 5.40,
      rating: 5,
      time: '2 hours ago'
    },
    {
      id: '2',
      student: 'Sarah Khan',
      subject: 'Programming',
      topic: 'Binary Search Algorithm',
      duration: 25,
      earning: 10.00,
      rating: 4,
      time: '4 hours ago'
    },
    {
      id: '3',
      student: 'John Doe',
      subject: 'Statistics',
      topic: 'Hypothesis Testing',
      duration: 20,
      earning: 6.00,
      rating: 5,
      time: 'Yesterday'
    }
  ];

  const upcomingRequests = [
    {
      id: '1',
      student: 'Maria Ahmed',
      subject: 'Physics',
      topic: 'Quantum Mechanics',
      scheduledTime: 'Today, 3:30 PM',
      estimatedDuration: 30
    },
    {
      id: '2',
      student: 'David Kim',
      subject: 'Mathematics',
      topic: 'Linear Algebra',
      scheduledTime: 'Tomorrow, 10:00 AM',
      estimatedDuration: 20
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! You're helping students succeed.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-800 font-medium text-sm">Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">{stats.averageRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.today}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.thisWeek}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">${earnings.total}</p>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalSessions}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.averageRating}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Response Time</p>
              <p className="text-2xl font-bold text-green-900">{stats.responseTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Active Students</p>
              <p className="text-2xl font-bold text-purple-900">{stats.activeStudents}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
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
                    <h3 className="font-semibold text-gray-900">{session.student}</h3>
                    <p className="text-sm text-gray-600">{session.subject} • {session.topic}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">${session.earning}</div>
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
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{session.time}</span>
                  <span>{session.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
          {upcomingRequests.length > 0 ? (
            <div className="space-y-4">
              {upcomingRequests.map((request) => (
                <div key={request.id} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.student}</h3>
                      <p className="text-sm text-gray-600">{request.subject} • {request.topic}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-medium">{request.scheduledTime}</span>
                    <span className="text-sm text-gray-500">{request.estimatedDuration} min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming sessions</p>
              <p className="text-sm text-gray-400 mt-1">
                Stay online to receive instant help requests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;