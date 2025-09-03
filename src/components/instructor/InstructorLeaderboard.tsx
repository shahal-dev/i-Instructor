import React, { useState } from 'react';
import { Star, Trophy, Clock, Users, TrendingUp, Award, Medal, Crown } from 'lucide-react';

const instructors = [
  {
    id: '1',
    name: 'Dr. Sarah Ahmed',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    subjects: ['Mathematics', 'Statistics'],
    rating: 4.9,
    totalSessions: 1247,
    responseTime: 1.2,
    earnings: 3456.78,
    badges: ['Top Helper', 'Fast Responder', 'Math Expert'],
    rank: 1
  },
  {
    id: '2',
    name: 'Mahmud Rahman',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    subjects: ['Computer Science', 'Programming'],
    rating: 4.8,
    totalSessions: 1156,
    responseTime: 1.5,
    earnings: 3234.56,
    badges: ['Code Master', 'Top Helper'],
    rank: 2
  },
  {
    id: '3',
    name: 'Prof. Lisa Chen',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    subjects: ['Physics', 'Engineering'],
    rating: 4.8,
    totalSessions: 987,
    responseTime: 2.1,
    earnings: 2987.43,
    badges: ['Physics Pro', 'Mentor'],
    rank: 3
  },
  {
    id: '4',
    name: 'Dr. Ahmed Hassan',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    subjects: ['Chemistry', 'Biochemistry'],
    rating: 4.7,
    totalSessions: 876,
    responseTime: 1.8,
    earnings: 2654.32,
    badges: ['Chemistry Expert'],
    rank: 4
  },
  {
    id: '5',
    name: 'Prof. Jane Smith',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
    subjects: ['English', 'Literature'],
    rating: 4.7,
    totalSessions: 743,
    responseTime: 2.3,
    earnings: 2234.67,
    badges: ['Writing Coach'],
    rank: 5
  }
];

const InstructorLeaderboard: React.FC = () => {
  const [sortBy, setSortBy] = useState('rating');
  const [timeframe, setTimeframe] = useState('all-time');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Top Helper': 'bg-blue-100 text-blue-800',
      'Fast Responder': 'bg-green-100 text-green-800',
      'Math Expert': 'bg-purple-100 text-purple-800',
      'Code Master': 'bg-indigo-100 text-indigo-800',
      'Physics Pro': 'bg-orange-100 text-orange-800',
      'Chemistry Expert': 'bg-teal-100 text-teal-800',
      'Writing Coach': 'bg-pink-100 text-pink-800',
      'Mentor': 'bg-yellow-100 text-yellow-800'
    };
    return colors[badge as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Instructor Leaderboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Celebrating our top-performing instructors who make learning accessible and enjoyable for students worldwide.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Highest Rating</option>
              <option value="sessions">Most Sessions</option>
              <option value="response">Fastest Response</option>
              <option value="earnings">Top Earnings</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all-time">All Time</option>
              <option value="this-month">This Month</option>
              <option value="this-week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="mb-12">
        <div className="flex justify-center items-end space-x-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={instructors[1].avatar}
                alt={instructors[1].name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-gray-300"
              />
              <div className="absolute -top-2 -right-2">
                <Medal className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{instructors[1].name}</h3>
            <div className="flex items-center justify-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{instructors[1].rating}</span>
            </div>
            <div className="bg-gray-100 h-16 w-24 mx-auto mt-4 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-2xl font-bold text-gray-600">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={instructors[0].avatar}
                alt={instructors[0].name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-yellow-400"
              />
              <div className="absolute -top-2 -right-2">
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{instructors[0].name}</h3>
            <div className="flex items-center justify-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{instructors[0].rating}</span>
            </div>
            <div className="bg-yellow-100 h-20 w-24 mx-auto mt-4 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-2xl font-bold text-yellow-600">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={instructors[2].avatar}
                alt={instructors[2].name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-orange-300"
              />
              <div className="absolute -top-2 -right-2">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{instructors[2].name}</h3>
            <div className="flex items-center justify-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{instructors[2].rating}</span>
            </div>
            <div className="bg-orange-100 h-12 w-24 mx-auto mt-4 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-2xl font-bold text-orange-600">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Instructors</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(instructor.rank)}
                </div>

                {/* Avatar */}
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                    {instructor.rank <= 3 && (
                      <div className="flex space-x-1">
                        {instructor.badges.slice(0, 2).map((badge, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {instructor.subjects.join(', ')}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-gray-900">{instructor.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{instructor.totalSessions}</div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{instructor.responseTime}m</div>
                    <div className="text-xs text-gray-500">Response</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-green-600 mb-1">${instructor.earnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Earned</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Become Instructor CTA */}
      <div className="mt-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
        <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Join Our Top Instructors
        </h3>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Share your knowledge, help students succeed, and earn money doing what you love. 
          Our top instructors earn $500+ per month while making a real impact.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Become an Instructor
        </button>
      </div>
    </div>
  );
};

export default InstructorLeaderboard;