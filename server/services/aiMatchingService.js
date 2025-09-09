const { statements } = require('../database/db');

class AIMatchingService {
  constructor() {
    this.userInteractionHistory = new Map();
    this.instructorPerformanceCache = new Map();
    this.subjectDemandAnalytics = new Map();
  }

  // AI-powered instructor recommendation
  async recommendInstructors(learnerRequest) {
    const { learnerId, subject, topic, description, urgency, maxPrice } = learnerRequest;
    
    // Get learner's history and preferences
    const learnerProfile = await this.getLearnerProfile(learnerId);
    
    // Get available instructors
    const availableInstructors = this.getAvailableInstructors(subject);
    
    // Score each instructor using multiple factors
    const scoredInstructors = await Promise.all(
      availableInstructors.map(instructor => this.scoreInstructor(instructor, learnerRequest, learnerProfile))
    );

    // Sort by AI score and apply filters
    return scoredInstructors
      .sort((a, b) => b.aiScore - a.aiScore)
      .filter(instructor => !maxPrice || instructor.estimatedPrice <= maxPrice)
      .slice(0, 5); // Top 5 recommendations
  }

  // Advanced instructor scoring algorithm
  async scoreInstructor(instructor, request, learnerProfile) {
    let score = 0;
    const weights = {
      skillMatch: 0.25,
      ratingQuality: 0.20,
      responseTime: 0.15,
      successRate: 0.15,
      learnerCompatibility: 0.10,
      availability: 0.10,
      priceValue: 0.05
    };

    // 1. Skill matching using NLP-like approach
    const skillMatchScore = this.calculateSkillMatch(instructor.skills, request.subject, request.topic);
    score += skillMatchScore * weights.skillMatch;

    // 2. Rating quality (weighted by number of sessions)
    const ratingScore = this.calculateRatingScore(instructor.rating, instructor.total_sessions);
    score += ratingScore * weights.ratingQuality;

    // 3. Response time optimization
    const responseScore = this.calculateResponseScore(instructor.response_time);
    score += responseScore * weights.responseTime;

    // 4. Success rate based on completion and satisfaction
    const successScore = await this.calculateSuccessRate(instructor.id);
    score += successScore * weights.successRate;

    // 5. Learner compatibility based on past interactions
    const compatibilityScore = this.calculateLearnerCompatibility(instructor.id, learnerProfile);
    score += compatibilityScore * weights.learnerCompatibility;

    // 6. Current availability and load
    const availabilityScore = this.calculateAvailabilityScore(instructor.id);
    score += availabilityScore * weights.availability;

    // 7. Price-value ratio
    const estimatedPrice = this.calculateSessionPrice(request.subject, instructor.rating, request.urgency);
    const priceScore = this.calculatePriceValueScore(estimatedPrice, instructor.rating);
    score += priceScore * weights.priceValue;

    return {
      ...instructor,
      aiScore: Math.round(score * 100) / 100,
      estimatedPrice,
      matchReasons: this.generateMatchReasons(instructor, request, {
        skillMatch: skillMatchScore,
        rating: ratingScore,
        response: responseScore
      })
    };
  }

  // NLP-inspired skill matching
  calculateSkillMatch(instructorSkills, subject, topic) {
    const skills = JSON.parse(instructorSkills || '[]');
    let maxMatch = 0;

    // Direct subject match
    const subjectMatch = skills.some(skill => 
      skill.toLowerCase().includes(subject.toLowerCase()) ||
      subject.toLowerCase().includes(skill.toLowerCase())
    );
    if (subjectMatch) maxMatch = Math.max(maxMatch, 0.9);

    // Topic-based matching
    if (topic) {
      const topicWords = topic.toLowerCase().split(' ');
      const skillWords = skills.join(' ').toLowerCase().split(' ');
      
      const commonWords = topicWords.filter(word => 
        skillWords.some(skillWord => skillWord.includes(word) || word.includes(skillWord))
      );
      
      const topicMatch = commonWords.length / topicWords.length;
      maxMatch = Math.max(maxMatch, topicMatch * 0.7);
    }

    // Semantic similarity (simplified)
    const semanticScore = this.calculateSemanticSimilarity(skills, subject, topic);
    maxMatch = Math.max(maxMatch, semanticScore);

    return Math.min(maxMatch, 1.0);
  }

  // Simplified semantic similarity
  calculateSemanticSimilarity(skills, subject, topic) {
    const synonyms = {
      'mathematics': ['math', 'calculus', 'algebra', 'geometry', 'statistics'],
      'computer science': ['programming', 'coding', 'software', 'algorithms', 'data structures'],
      'physics': ['mechanics', 'thermodynamics', 'quantum', 'electromagnetism'],
      'chemistry': ['organic', 'inorganic', 'biochemistry', 'molecular'],
      'biology': ['genetics', 'molecular biology', 'ecology', 'anatomy']
    };

    const subjectSynonyms = synonyms[subject.toLowerCase()] || [];
    const skills_lower = JSON.parse(skills || '[]').map(s => s.toLowerCase());

    const synonymMatch = subjectSynonyms.some(synonym => 
      skills_lower.some(skill => skill.includes(synonym))
    );

    return synonymMatch ? 0.6 : 0.1;
  }

  // Rating score with session count weighting
  calculateRatingScore(rating, sessionCount) {
    if (!rating || rating === 0) return 0;
    
    // Weight rating by experience (more sessions = more reliable rating)
    const experienceWeight = Math.min(sessionCount / 50, 1); // Max weight at 50 sessions
    const baseScore = (rating - 1) / 4; // Normalize 1-5 to 0-1
    
    return baseScore * (0.5 + 0.5 * experienceWeight);
  }

  // Response time scoring (lower is better)
  calculateResponseScore(responseTime) {
    if (!responseTime) return 0.5;
    
    // Optimal response time is under 2 minutes
    if (responseTime <= 2) return 1.0;
    if (responseTime <= 5) return 0.8;
    if (responseTime <= 10) return 0.6;
    if (responseTime <= 30) return 0.4;
    return 0.2;
  }

  // Calculate instructor success rate
  async calculateSuccessRate(instructorId) {
    try {
      const stats = statements.db.prepare(`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
          AVG(CASE WHEN rating >= 4 THEN 1.0 ELSE 0.0 END) as satisfaction_rate
        FROM sessions 
        WHERE instructor_id = ? AND created_at >= datetime('now', '-30 days')
      `).get(instructorId);

      if (!stats || stats.total_sessions === 0) return 0.5;

      const completionRate = stats.completed_sessions / stats.total_sessions;
      const satisfactionRate = stats.satisfaction_rate || 0;
      
      return (completionRate * 0.6 + satisfactionRate * 0.4);
    } catch (error) {
      console.error('Error calculating success rate:', error);
      return 0.5;
    }
  }

  // Learner compatibility based on past successful sessions
  calculateLearnerCompatibility(instructorId, learnerProfile) {
    if (!learnerProfile.pastInstructors) return 0.5;

    const pastExperience = learnerProfile.pastInstructors.find(p => p.instructorId === instructorId);
    if (!pastExperience) return 0.5;

    // Positive past experience boosts compatibility
    if (pastExperience.avgRating >= 4.5) return 0.9;
    if (pastExperience.avgRating >= 4.0) return 0.7;
    if (pastExperience.avgRating >= 3.5) return 0.6;
    return 0.3;
  }

  // Current availability and workload
  calculateAvailabilityScore(instructorId) {
    // Check current active sessions
    const activeSessions = statements.db.prepare(`
      SELECT COUNT(*) as active_count 
      FROM sessions 
      WHERE instructor_id = ? AND status IN ('active', 'matched')
    `).get(instructorId);

    const activeCount = activeSessions?.active_count || 0;
    
    // Prefer instructors with lower current load
    if (activeCount === 0) return 1.0;
    if (activeCount === 1) return 0.8;
    if (activeCount === 2) return 0.6;
    return 0.3;
  }

  // Price-value calculation
  calculatePriceValueScore(price, rating) {
    const valueRatio = rating / price;
    
    // Normalize value ratio (higher is better)
    if (valueRatio >= 1.5) return 1.0;
    if (valueRatio >= 1.2) return 0.8;
    if (valueRatio >= 1.0) return 0.6;
    if (valueRatio >= 0.8) return 0.4;
    return 0.2;
  }

  // Generate human-readable match reasons
  generateMatchReasons(instructor, request, scores) {
    const reasons = [];
    
    if (scores.skillMatch > 0.8) {
      reasons.push(`Expert in ${request.subject}`);
    }
    
    if (scores.rating > 0.8) {
      reasons.push(`Highly rated (${instructor.rating}/5)`);
    }
    
    if (scores.response < 0.8 && instructor.response_time <= 3) {
      reasons.push(`Fast responder (${instructor.response_time}m avg)`);
    }
    
    if (instructor.total_sessions > 100) {
      reasons.push(`Experienced (${instructor.total_sessions}+ sessions)`);
    }

    return reasons.slice(0, 3); // Top 3 reasons
  }

  // Get learner profile for personalization
  async getLearnerProfile(learnerId) {
    try {
      const profile = statements.db.prepare(`
        SELECT 
          u.*,
          COUNT(s.id) as total_sessions,
          AVG(s.rating) as avg_given_rating,
          GROUP_CONCAT(DISTINCT s.subject) as preferred_subjects
        FROM users u
        LEFT JOIN sessions s ON u.id = s.learner_id
        WHERE u.id = ?
        GROUP BY u.id
      `).get(learnerId);

      // Get past instructor relationships
      const pastInstructors = statements.db.prepare(`
        SELECT 
          instructor_id as instructorId,
          COUNT(*) as session_count,
          AVG(rating) as avgRating
        FROM sessions 
        WHERE learner_id = ? AND rating IS NOT NULL
        GROUP BY instructor_id
      `).all(learnerId);

      return {
        ...profile,
        pastInstructors,
        preferredSubjects: profile?.preferred_subjects?.split(',') || []
      };
    } catch (error) {
      console.error('Error getting learner profile:', error);
      return { pastInstructors: [] };
    }
  }

  // Get available instructors for subject
  getAvailableInstructors(subject) {
    const instructors = statements.getOnlineInstructors.all();
    
    return instructors.filter(instructor => {
      const skills = JSON.parse(instructor.skills || '[]');
      return skills.some(skill => 
        skill.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(skill.toLowerCase())
      );
    });
  }

  // Dynamic pricing calculation
  calculateSessionPrice(subject, instructorRating, urgency) {
    let basePrice = 3; // Base price per 15 minutes

    // Subject multipliers
    const subjectMultipliers = {
      'mathematics': 1.0,
      'computer science': 1.2,
      'physics': 1.1,
      'chemistry': 1.1,
      'biology': 1.0,
      'english': 0.8,
      'economics': 1.1
    };

    basePrice *= subjectMultipliers[subject.toLowerCase()] || 1.0;

    // Instructor rating bonus
    if (instructorRating >= 4.8) basePrice *= 1.3;
    else if (instructorRating >= 4.5) basePrice *= 1.2;
    else if (instructorRating >= 4.0) basePrice *= 1.1;

    // Urgency multipliers
    const urgencyMultipliers = {
      'normal': 1.0,
      'urgent': 1.5,
      'emergency': 2.0
    };

    basePrice *= urgencyMultipliers[urgency] || 1.0;

    return Math.round(basePrice * 100) / 100;
  }

  // Update learning analytics
  updateLearningAnalytics(sessionData) {
    const { subject, success, duration, rating } = sessionData;
    
    if (!this.subjectDemandAnalytics.has(subject)) {
      this.subjectDemandAnalytics.set(subject, {
        totalSessions: 0,
        successRate: 0,
        avgDuration: 0,
        avgRating: 0
      });
    }

    const analytics = this.subjectDemandAnalytics.get(subject);
    analytics.totalSessions++;
    analytics.successRate = (analytics.successRate + (success ? 1 : 0)) / 2;
    analytics.avgDuration = (analytics.avgDuration + duration) / 2;
    analytics.avgRating = (analytics.avgRating + rating) / 2;
  }

  // Get platform insights
  getPlatformInsights() {
    return {
      subjectDemand: Array.from(this.subjectDemandAnalytics.entries()),
      totalRecommendations: this.userInteractionHistory.size,
      cacheSize: this.instructorPerformanceCache.size
    };
  }
}

module.exports = new AIMatchingService();