import React, { useState } from 'react';
import { 
  Users, DollarSign, Clock, AlertTriangle, TrendingUp, 
  Shield, FileText, Settings, BarChart3, Activity 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalUsers: 2847,
    activeUsers: 456,
    totalSessions: 12543,
    revenue: 45678.90,
    avgSessionTime: 18.5,
    disputeRate: 0.8
  };

  const recentSessions = [
    {
      id: '1',
      learner: 'Ahmad Rahman',
      instructor: 'Dr. Sarah Ahmed',
      subject: 'Mathematics',
      duration: 18,
      status: 'completed',
      revenue: 5.40
    },
    {
      id: '2',
      learner: 'Maria Khan',
      instructor: 'Prof. John Smith',
      subject: 'Physics',
      duration: 25,
      status: 'active',
      revenue: 10.00
    }
  ];

  const disputes = [
    {
      id: '1',
      type: 'Payment Issue',
      learner: 'Student A',
      instructor: 'Instructor B',
      amount: 15.00,
      status: 'pending',
      createdAt: '2 hours ago'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600">+12% this month</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-blue-600">Peak: 678 users</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions.toLocaleString()}</p>
              <p className="text-sm text-green-600">+8% this week</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+15% this month</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgSessionTime}m</p>
              <p className="text-sm text-gray-600">Optimal range</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dispute Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disputeRate}%</p>
              <p className="text-sm text-green-600">Below target</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{session.learner}</div>
                  <div className="text-sm text-gray-600">{session.subject} • {session.duration}m</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">${session.revenue}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {session.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Disputes</h3>
          {disputes.length > 0 ? (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{dispute.type}</div>
                    <div className="text-sm text-orange-600 font-medium">${dispute.amount}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {dispute.learner} vs {dispute.instructor}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{dispute.createdAt}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p>No active disputes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4" />
        <p>User management interface would be implemented here</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4" />
        <p>Advanced analytics dashboard would be implemented here</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform management and analytics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4" />
            <p>Platform configuration settings would be implemented here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;