const { statements } = require('../database/db');

class ContentModerationService {
  constructor() {
    this.bannedWords = [
      // Add inappropriate words here
      'spam', 'scam', 'fake', 'cheat'
    ];
    
    this.suspiciousPatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card patterns
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email patterns
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone number patterns
      /\b(?:whatsapp|telegram|discord|skype)\b/i // External platform mentions
    ];
  }

  // Moderate chat messages
  moderateMessage(content, userId, sessionId) {
    const issues = [];
    
    // Check for banned words
    const lowerContent = content.toLowerCase();
    const foundBannedWords = this.bannedWords.filter(word => 
      lowerContent.includes(word.toLowerCase())
    );
    
    if (foundBannedWords.length > 0) {
      issues.push({
        type: 'banned_words',
        severity: 'high',
        words: foundBannedWords
      });
    }

    // Check for suspicious patterns
    const foundPatterns = this.suspiciousPatterns.filter(pattern => 
      pattern.test(content)
    );
    
    if (foundPatterns.length > 0) {
      issues.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        patterns: foundPatterns.length
      });
    }

    // Check message length (spam detection)
    if (content.length > 1000) {
      issues.push({
        type: 'excessive_length',
        severity: 'low',
        length: content.length
      });
    }

    // Log moderation results
    if (issues.length > 0) {
      this.logModerationEvent(userId, sessionId, 'message', content, issues);
    }

    return {
      allowed: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      filteredContent: this.filterContent(content, issues)
    };
  }

  // Moderate knowledge base submissions
  moderateKnowledgeSubmission(title, content, authorId) {
    const issues = [];
    
    // Check title and content
    const titleCheck = this.moderateMessage(title, authorId, null);
    const contentCheck = this.moderateMessage(content, authorId, null);
    
    if (!titleCheck.allowed) {
      issues.push(...titleCheck.issues.map(i => ({...i, location: 'title'})));
    }
    
    if (!contentCheck.allowed) {
      issues.push(...contentCheck.issues.map(i => ({...i, location: 'content'})));
    }

    // Check for educational value
    const educationalScore = this.assessEducationalValue(content);
    if (educationalScore < 0.3) {
      issues.push({
        type: 'low_educational_value',
        severity: 'medium',
        score: educationalScore
      });
    }

    return {
      allowed: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      needsReview: issues.length > 0
    };
  }

  // Assess educational value of content
  assessEducationalValue(content) {
    let score = 0;
    
    // Educational keywords
    const educationalKeywords = [
      'explain', 'solution', 'step', 'formula', 'theorem', 'proof',
      'example', 'practice', 'understand', 'learn', 'concept',
      'method', 'approach', 'technique', 'principle'
    ];
    
    const lowerContent = content.toLowerCase();
    const foundKeywords = educationalKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    );
    
    score += foundKeywords.length * 0.1;
    
    // Length bonus (detailed explanations)
    if (content.length > 200) score += 0.2;
    if (content.length > 500) score += 0.2;
    
    // Mathematical expressions
    if (/[∫∑∏√±≤≥≠∞]/.test(content) || /\$.*\$/.test(content)) {
      score += 0.3;
    }
    
    // Code blocks
    if (/```[\s\S]*```/.test(content) || /`[^`]+`/.test(content)) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  // Filter inappropriate content
  filterContent(content, issues) {
    let filtered = content;
    
    issues.forEach(issue => {
      if (issue.type === 'banned_words') {
        issue.words.forEach(word => {
          const regex = new RegExp(word, 'gi');
          filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
      }
      
      if (issue.type === 'suspicious_pattern') {
        this.suspiciousPatterns.forEach(pattern => {
          filtered = filtered.replace(pattern, '[FILTERED]');
        });
      }
    });
    
    return filtered;
  }

  // Log moderation events
  logModerationEvent(userId, sessionId, contentType, content, issues) {
    try {
      statements.db.prepare(`
        INSERT INTO moderation_logs (id, user_id, session_id, content_type, content_preview, issues, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        require('uuid').v4(),
        userId,
        sessionId,
        contentType,
        content.substring(0, 100),
        JSON.stringify(issues)
      );
    } catch (error) {
      console.error('Error logging moderation event:', error);
    }
  }

  // Get moderation statistics
  getModerationStats(timeframe = '7 days') {
    try {
      const stats = statements.db.prepare(`
        SELECT 
          content_type,
          COUNT(*) as total_events,
          SUM(CASE WHEN JSON_EXTRACT(issues, '$[0].severity') = 'high' THEN 1 ELSE 0 END) as high_severity,
          SUM(CASE WHEN JSON_EXTRACT(issues, '$[0].severity') = 'medium' THEN 1 ELSE 0 END) as medium_severity,
          SUM(CASE WHEN JSON_EXTRACT(issues, '$[0].severity') = 'low' THEN 1 ELSE 0 END) as low_severity
        FROM moderation_logs 
        WHERE created_at >= datetime('now', '-${timeframe}')
        GROUP BY content_type
      `).all();

      return stats;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      return [];
    }
  }

  // Report content for manual review
  reportContent(contentId, contentType, reporterId, reason) {
    try {
      const reportId = require('uuid').v4();
      
      statements.db.prepare(`
        INSERT INTO content_reports (id, content_id, content_type, reporter_id, reason, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `).run(reportId, contentId, contentType, reporterId, reason);

      return { success: true, reportId };
    } catch (error) {
      console.error('Error reporting content:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ContentModerationService();