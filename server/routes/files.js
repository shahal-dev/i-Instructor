const express = require('express');
const { authenticateToken } = require('./auth');
const fileUploadService = require('../services/fileUploadService');

const router = express.Router();

// Upload avatar
router.post('/avatar', authenticateToken, fileUploadService.avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await fileUploadService.processAvatar(req.file);
    
    if (result.success) {
      // Update user avatar in database
      const { statements } = require('../database/db');
      statements.db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(result.url, req.user.userId);
      
      res.json({ success: true, avatar: result });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload session files
router.post('/session/:sessionId', authenticateToken, fileUploadService.sessionFileUpload.array('files', 5), async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Verify user has access to this session
    const { statements } = require('../database/db');
    const session = statements.getSessionById.get(sessionId);
    
    if (!session || (session.learner_id !== req.user.userId && session.instructor_id !== req.user.userId)) {
      return res.status(403).json({ error: 'Access denied to session' });
    }

    const results = [];
    
    for (const file of req.files) {
      const result = await fileUploadService.processSessionFile(file, sessionId);
      results.push(result);
    }

    res.json({ success: true, files: results });
  } catch (error) {
    console.error('Session file upload error:', error);
    res.status(500).json({ error: 'Failed to upload session files' });
  }
});

// Upload homework files
router.post('/homework/:homeworkId', authenticateToken, fileUploadService.homeworkUpload.array('files', 10), async (req, res) => {
  try {
    const { homeworkId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const result = await fileUploadService.processHomeworkFiles(req.files, homeworkId);
    
    if (result.success) {
      res.json({ success: true, files: result.files });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Homework file upload error:', error);
    res.status(500).json({ error: 'Failed to upload homework files' });
  }
});

// Get session files
router.get('/session/:sessionId', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify user has access to this session
    const { statements } = require('../database/db');
    const session = statements.getSessionById.get(sessionId);
    
    if (!session || (session.learner_id !== req.user.userId && session.instructor_id !== req.user.userId)) {
      return res.status(403).json({ error: 'Access denied to session' });
    }

    const result = fileUploadService.getSessionFiles(sessionId);
    
    if (result.success) {
      res.json({ success: true, files: result.files });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get session files error:', error);
    res.status(500).json({ error: 'Failed to get session files' });
  }
});

// Get homework files
router.get('/homework/:homeworkId', authenticateToken, (req, res) => {
  try {
    const { homeworkId } = req.params;
    
    const result = fileUploadService.getHomeworkFiles(homeworkId);
    
    if (result.success) {
      res.json({ success: true, files: result.files });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get homework files error:', error);
    res.status(500).json({ error: 'Failed to get homework files' });
  }
});

// Delete file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { type = 'session' } = req.query;
    
    const result = await fileUploadService.deleteFile(fileId, type);
    
    if (result.success) {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Serve uploaded files
router.get('/serve/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', folder, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

module.exports = router;