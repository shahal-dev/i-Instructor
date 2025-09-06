const { statements } = require('../database/db');

class MatchingEngine {
  constructor() {
    this.activeQueue = new Map(); // sessionId -> queueData
    this.instructorPool = new Map(); // instructorId -> availability
  }

  // Add learner to matching queue
  addToQueue(queueData) {
    const { id, learner_id, subject, topic, urgency, max_price } = queueData;
    
    this.activeQueue.set(id, {
      ...queueData,
      timestamp: Date.now(),
      attempts: 0
    });

    // Try immediate matching
    const match = this.findBestMatch(queueData);
    if (match) {
      this.activeQueue.delete(id);
      return match;
    }

    return null;
  }

  // Remove from queue
  removeFromQueue(queueId) {
    return this.activeQueue.delete(queueId);
  }

  // Find best instructor match
  findBestMatch(queueData) {
    const { subject, max_price, urgency } = queueData;
    
    // Get available instructors for subject
    const availableInstructors = this.getAvailableInstructors(subject);
    
    if (availableInstructors.length === 0) {
      return null;
    }

    // Score and rank instructors
    const scoredInstructors = availableInstructors.map(instructor => ({
      ...instructor,
      score: this.calculateInstructorScore(instructor, queueData)
    }));

    // Sort by score (highest first)
    scoredInstructors.sort((a, b) => b.score - a.score);

    // Filter by price if specified
    if (max_price) {
      const affordableInstructors = scoredInstructors.filter(instructor => {
        const sessionPrice = this.calculateSessionPrice(subject, instructor.rating, urgency);
        return sessionPrice <= max_price;
      });
      
      if (affordableInstructors.length > 0) {
        return affordableInstructors[0];
      }
    }

    return scoredInstructors[0];
  }

  // Calculate instructor matching score
  calculateInstructorScore(instructor, queueData) {
    let score = 0;
    
    // Rating weight (40%)
    score += (instructor.rating / 5) * 40;
    
    // Response time weight (30%) - lower is better
    const responseTimeScore = Math.max(0, 30 - (instructor.response_time * 2));
    score += responseTimeScore;
    
    // Experience weight (20%)
    const experienceScore = Math.min(20, instructor.total_sessions / 10);
    score += experienceScore;
    
    // Subject expertise weight (10%)
    const skills = JSON.parse(instructor.skills || '[]');
    const hasExactMatch = skills.some(skill => 
      skill.toLowerCase().includes(queueData.subject.toLowerCase())
    );
    if (hasExactMatch) {
      score += 10;
    }

    return score;
  }

  // Get available instructors for subject
  getAvailableInstructors(subject) {
    const onlineInstructors = statements.getOnlineInstructors.all();
    
    return onlineInstructors.filter(instructor => {
      const skills = JSON.parse(instructor.skills || '[]');
      return skills.some(skill => 
        skill.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(skill.toLowerCase())
      );
    });
  }

  // Calculate session price
  calculateSessionPrice(subject, instructorRating, urgency) {
    let basePrice = 3; // Base price per 15 minutes

    // Subject multiplier
    const subjectMultipliers = {
      'mathematics': 1.0,
      'computer science': 1.2,
      'physics': 1.1,
      'chemistry': 1.1,
      'biology': 1.0,
      'english': 0.8
    };

    const multiplier = subjectMultipliers[subject.toLowerCase()] || 1.0;
    basePrice *= multiplier;

    // Rating bonus
    if (instructorRating >= 4.5) basePrice *= 1.2;
    else if (instructorRating >= 4.0) basePrice *= 1.1;

    // Urgency multiplier
    const urgencyMultipliers = {
      'normal': 1.0,
      'urgent': 1.5,
      'emergency': 2.0
    };

    basePrice *= urgencyMultipliers[urgency] || 1.0;

    return Math.round(basePrice * 100) / 100;
  }

  // Update instructor availability
  updateInstructorAvailability(instructorId, subjects, isAvailable = true) {
    if (isAvailable) {
      this.instructorPool.set(instructorId, {
        subjects,
        lastUpdate: Date.now()
      });
    } else {
      this.instructorPool.delete(instructorId);
    }
  }

  // Get queue statistics
  getQueueStats() {
    const queueBySubject = {};
    const queueByUrgency = {};
    
    for (const [id, queueData] of this.activeQueue) {
      // By subject
      queueBySubject[queueData.subject] = (queueBySubject[queueData.subject] || 0) + 1;
      
      // By urgency
      queueByUrgency[queueData.urgency] = (queueByUrgency[queueData.urgency] || 0) + 1;
    }

    return {
      totalInQueue: this.activeQueue.size,
      availableInstructors: this.instructorPool.size,
      queueBySubject,
      queueByUrgency,
      avgWaitTime: this.calculateAverageWaitTime()
    };
  }

  // Calculate average wait time
  calculateAverageWaitTime() {
    if (this.activeQueue.size === 0) return 0;
    
    const now = Date.now();
    let totalWaitTime = 0;
    
    for (const [id, queueData] of this.activeQueue) {
      totalWaitTime += (now - queueData.timestamp);
    }
    
    return Math.round(totalWaitTime / this.activeQueue.size / 1000 / 60); // in minutes
  }

  // Clean expired queue items
  cleanExpiredItems() {
    const now = Date.now();
    const expiredItems = [];
    
    for (const [id, queueData] of this.activeQueue) {
      const age = now - queueData.timestamp;
      if (age > 30 * 60 * 1000) { // 30 minutes
        expiredItems.push(id);
      }
    }
    
    expiredItems.forEach(id => {
      this.activeQueue.delete(id);
      // Remove from database as well
      statements.removeFromQueue.run(id);
    });
    
    return expiredItems.length;
  }
}

// Singleton instance
const matchingEngine = new MatchingEngine();

// Clean expired items every 5 minutes
setInterval(() => {
  const cleaned = matchingEngine.cleanExpiredItems();
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired queue items`);
  }
}, 5 * 60 * 1000);

module.exports = matchingEngine;