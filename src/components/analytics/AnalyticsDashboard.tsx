import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, DollarSign, Activity } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('week');

  const metrics = {
    totalSessions: 1247,
    activeUsers: 456,
    revenue: 12543.67,
    avgSessionTime: 18.5,
    popularSubjects: [
      { name: 'Mathematics', sessions: 345, percentage: 28 },
      { name: 'Computer Science', sessions: 298, percentage: 24 },
      { name: 'Physics', sessions: 187, percentage: 15 },
      { name: 'Chemistry', sessions: 156, percentage: 13 },
      { name: 'English', sessions: 134, percentage: 11 },
      { name: 'Biology', sessions: 127, percentage: 9 }
    ],
    peakHours: [
      { hour: '14:00', sessions: 45 },
      { hour: '15:00', sessions: 52 },
      { hour: '16:00', sessions: 48 },
      { hour: '17:00', sessions: 41 },
      { hour: '18:00', sessions: 38 },
      { hour: '19:00', sessions: 35 },
      { hour: '20:00', sessions: 42 },
      { hour: '21:00', sessions: 39 }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform performance and insights</p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalSessions.toLocaleString()}</p>
              <p className="text-sm text-green-600">+12% vs last {timeframe}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
              <p className="text-sm text-green-600">+8% vs last {timeframe}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.revenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+15% vs last {timeframe}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Session Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgSessionTime}m</p>
              <p className="text-sm text-blue-600">Optimal range</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Popular Subjects */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Subjects</h2>
          <div className="space-y-4">
            {metrics.popularSubjects.map((subject, index) => (
              <div key={subject.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-600">{subject.sessions} sessions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {subject.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Peak Usage Hours</h2>
          <div className="space-y-3">
            {metrics.peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{hour.hour}</div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(hour.sessions / 52) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {hour.sessions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Growth Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Interactive Charts</p>
            <p className="text-sm">Advanced analytics charts would be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;