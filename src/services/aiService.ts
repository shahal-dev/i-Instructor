import apiService from './api';

class AIService {
  // Get AI-powered instructor recommendations
  async getInstructorRecommendations(request: {
    subject: string;
    topic: string;
    description?: string;
    urgency?: 'normal' | 'urgent' | 'emergency';
    maxPrice?: number;
  }) {
    try {
      const response = await apiService.request('/ai/recommend-instructors', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      return response;
    } catch (error) {
      console.error('AI recommendation error:', error);
      throw error;
    }
  }

  // Moderate message content
  async moderateMessage(content: string, sessionId: string) {
    try {
      const response = await apiService.request('/ai/moderate-message', {
        method: 'POST',
        body: JSON.stringify({ content, sessionId })
      });
      return response;
    } catch (error) {
      console.error('Content moderation error:', error);
      throw error;
    }
  }

  // Moderate knowledge base submission
  async moderateKnowledge(title: string, content: string) {
    try {
      const response = await apiService.request('/ai/moderate-knowledge', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      return response;
    } catch (error) {
      console.error('Knowledge moderation error:', error);
      throw error;
    }
  }

  // Report inappropriate content
  async reportContent(contentId: string, contentType: string, reason: string) {
    try {
      const response = await apiService.request('/ai/report-content', {
        method: 'POST',
        body: JSON.stringify({ contentId, contentType, reason })
      });
      return response;
    } catch (error) {
      console.error('Content report error:', error);
      throw error;
    }
  }

  // Get AI insights (admin only)
  async getAIInsights() {
    try {
      const response = await apiService.request('/ai/insights');
      return response;
    } catch (error) {
      console.error('AI insights error:', error);
      throw error;
    }
  }

  // Update learning analytics
  async updateAnalytics(data: {
    sessionId: string;
    subject: string;
    success: boolean;
    duration: number;
    rating: number;
  }) {
    try {
      const response = await apiService.request('/ai/update-analytics', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Analytics update error:', error);
      throw error;
    }
  }

  // Smart search suggestions
  generateSearchSuggestions(query: string, subject?: string): string[] {
    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Subject-specific suggestions
    const subjectSuggestions = {
      mathematics: [
        'integration by parts', 'derivatives', 'limits', 'calculus', 'algebra',
        'linear equations', 'quadratic formula', 'trigonometry', 'statistics'
      ],
      'computer science': [
        'binary search', 'data structures', 'algorithms', 'recursion',
        'object oriented programming', 'database design', 'web development'
      ],
      physics: [
        'newton laws', 'thermodynamics', 'quantum mechanics', 'electromagnetism',
        'wave motion', 'optics', 'mechanics'
      ],
      chemistry: [
        'organic reactions', 'periodic table', 'chemical bonding', 'stoichiometry',
        'acid base', 'electrochemistry', 'molecular structure'
      ],
      biology: [
        'cell biology', 'genetics', 'evolution', 'ecology', 'anatomy',
        'molecular biology', 'biochemistry'
      ]
    };

    // Get suggestions for the specific subject
    if (subject && subjectSuggestions[subject.toLowerCase() as keyof typeof subjectSuggestions]) {
      const subjectTerms = subjectSuggestions[subject.toLowerCase() as keyof typeof subjectSuggestions];
      const matches = subjectTerms.filter(term => 
        term.includes(lowerQuery) || lowerQuery.includes(term.split(' ')[0])
      );
      suggestions.push(...matches.slice(0, 5));
    }

    // General academic terms
    const generalTerms = [
      'homework help', 'exam preparation', 'concept explanation',
      'problem solving', 'step by step solution', 'practice problems'
    ];

    const generalMatches = generalTerms.filter(term => 
      term.includes(lowerQuery)
    );
    suggestions.push(...generalMatches.slice(0, 3));

    return [...new Set(suggestions)].slice(0, 8);
  }

  // Analyze learning patterns
  analyzeLearningPattern(sessionHistory: any[]) {
    const analysis = {
      strongSubjects: [] as string[],
      weakSubjects: [] as string[],
      preferredSessionLength: 0,
      bestTimeSlots: [] as string[],
      recommendedTopics: [] as string[]
    };

    if (sessionHistory.length === 0) return analysis;

    // Analyze subject performance
    const subjectPerformance = sessionHistory.reduce((acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = { total: 0, ratings: [], durations: [] };
      }
      acc[session.subject].total++;
      if (session.rating) acc[session.subject].ratings.push(session.rating);
      if (session.duration) acc[session.subject].durations.push(session.duration);
      return acc;
    }, {} as any);

    // Identify strong and weak subjects
    Object.entries(subjectPerformance).forEach(([subject, data]: [string, any]) => {
      const avgRating = data.ratings.reduce((a: number, b: number) => a + b, 0) / data.ratings.length;
      if (avgRating >= 4.5) {
        analysis.strongSubjects.push(subject);
      } else if (avgRating < 3.5) {
        analysis.weakSubjects.push(subject);
      }
    });

    // Calculate preferred session length
    const allDurations = sessionHistory
      .filter(s => s.duration)
      .map(s => s.duration);
    
    if (allDurations.length > 0) {
      analysis.preferredSessionLength = Math.round(
        allDurations.reduce((a, b) => a + b, 0) / allDurations.length
      );
    }

    return analysis;
  }
}

export const aiService = new AIService();
export default aiService;