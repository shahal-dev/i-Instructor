const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const aiMatchingService = require('../services/aiMatchingService');
const contentModerationService = require('../services/contentModerationService');

const router = express.Router();

// AI-powered instructor recommendations
router.post('/recommend-instructors', authenticateToken, async (req, res) => {
  try {
    const { subject, topic, description, urgency, maxPrice } = req.body;
    
    const learnerRequest = {
      learnerId: req.user.userId,
      subject,
      topic,
      description,
      urgency: urgency || 'normal',
      maxPrice
    };

    const recommendations = await aiMatchingService.recommendInstructors(learnerRequest);
    
    res.json({
      success: true,
      recommendations,
      totalFound: recommendations.length
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
});

// Content moderation for messages
router.post('/moderate-message', authenticateToken, (req, res) => {
  try {
    const { content, sessionId } = req.body;
    
    const moderation = contentModerationService.moderateMessage(
      content, 
      req.user.userId, 
      sessionId
    );
    
    res.json({
      success: true,
      moderation
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
});

// Moderate knowledge base submissions
router.post('/moderate-knowledge', authenticateToken, (req, res) => {
  try {
    const { title, content } = req.body;
    
    const moderation = contentModerationService.moderateKnowledgeSubmission(
      title,
      content,
      req.user.userId
    );
    
    res.json({
      success: true,
      moderation
    });
  } catch (error) {
    console.error('Knowledge moderation error:', error);
    res.status(500).json({ error: 'Failed to moderate knowledge submission' });
  }
});

// Report inappropriate content
router.post('/report-content', authenticateToken, (req, res) => {
  try {
    const { contentId, contentType, reason } = req.body;
    
    const result = contentModerationService.reportContent(
      contentId,
      contentType,
      req.user.userId,
      reason
    );
    
    res.json(result);
  } catch (error) {
    console.error('Content report error:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

// Get AI platform insights (admin only)
router.get('/insights', authenticateToken, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const insights = aiMatchingService.getPlatformInsights();
    const moderationStats = contentModerationService.getModerationStats();
    
    res.json({
      success: true,
      insights: {
        ...insights,
        moderation: moderationStats
      }
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to get AI insights' });
  }
});

// Update learning analytics after session
router.post('/update-analytics', authenticateToken, (req, res) => {
  try {
    const { sessionId, subject, success, duration, rating } = req.body;
    
    aiMatchingService.updateLearningAnalytics({
      sessionId,
      subject,
      success,
      duration,
      rating
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics update error:', error);
    res.status(500).json({ error: 'Failed to update analytics' });
  }
});

module.exports = router;