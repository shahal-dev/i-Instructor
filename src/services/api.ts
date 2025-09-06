const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async authenticateWithFirebase(firebaseToken: string, userData: any) {
    const response = await this.request('/auth/firebase-auth', {
      method: 'POST',
      body: JSON.stringify({ firebaseToken, userData }),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // User methods
  async getUserProfile(userId: string) {
    return this.request(`/users/profile/${userId}`);
  }

  async updateProfile(userData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getOnlineInstructors(subject?: string) {
    const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return this.request(`/users/instructors/online${params}`);
  }

  async getInstructorLeaderboard() {
    return this.request('/users/instructors/leaderboard');
  }

  // Session methods
  async createSession(sessionData: any) {
    return this.request('/sessions/create', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSession(sessionId: string) {
    return this.request(`/sessions/${sessionId}`);
  }

  async updateSessionStatus(sessionId: string, status: string) {
    return this.request(`/sessions/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getUserSessions() {
    return this.request('/sessions/user/history');
  }

  async rateSession(sessionId: string, rating: number, review?: string) {
    return this.request(`/sessions/${sessionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  async getSessionMessages(sessionId: string) {
    return this.request(`/sessions/${sessionId}/messages`);
  }

  // Matching methods
  async addToQueue(queueData: any) {
    return this.request('/matching/queue', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
  }

  async removeFromQueue(queueId: string) {
    return this.request(`/matching/queue/${queueId}`, {
      method: 'DELETE',
    });
  }

  async getAvailableInstructors(subject: string) {
    return this.request(`/matching/instructors/${encodeURIComponent(subject)}`);
  }

  // Payment methods
  async createPaymentIntent(sessionId: string, instructorId: string, amount: number) {
    return this.request('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ sessionId, instructorId, amount }),
    });
  }

  async confirmPayment(paymentIntentId: string, sessionId: string) {
    return this.request('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, sessionId }),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }

  async getInstructorEarnings() {
    return this.request('/payments/earnings');
  }

  async requestPayout(amount: number, method: string, accountDetails: any) {
    return this.request('/payments/request-payout', {
      method: 'POST',
      body: JSON.stringify({ amount, method, accountDetails }),
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Analytics methods (admin only)
  async getAnalyticsOverview(timeframe = 'week') {
    return this.request(`/analytics/overview?timeframe=${timeframe}`);
  }

  async getUserGrowthAnalytics() {
    return this.request('/analytics/user-growth');
  }

  async getSessionAnalytics() {
    return this.request('/analytics/sessions');
  }

  async getInstructorAnalytics() {
    return this.request('/analytics/instructors');
  }

  async getRevenueAnalytics() {
    return this.request('/analytics/revenue');
  }
  async acceptQueueItem(queueId: string) {
    return this.request(`/matching/accept/${queueId}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;