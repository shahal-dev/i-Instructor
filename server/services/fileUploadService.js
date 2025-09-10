const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.avatarDir = path.join(this.uploadDir, 'avatars');
    this.sessionFilesDir = path.join(this.uploadDir, 'session-files');
    this.homeworkDir = path.join(this.uploadDir, 'homework');
    
    // Create directories if they don't exist
    this.ensureDirectories();
    
    // Configure multer for different file types
    this.avatarUpload = this.createMulterConfig('avatars', 5 * 1024 * 1024); // 5MB
    this.sessionFileUpload = this.createMulterConfig('session-files', 10 * 1024 * 1024); // 10MB
    this.homeworkUpload = this.createMulterConfig('homework', 25 * 1024 * 1024); // 25MB
  }

  ensureDirectories() {
    [this.uploadDir, this.avatarDir, this.sessionFilesDir, this.homeworkDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  createMulterConfig(folder, maxSize) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadDir, folder));
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: maxSize,
        files: 5 // Maximum 5 files per request
      },
      fileFilter: (req, file, cb) => {
        this.validateFile(file, folder, cb);
      }
    });
  }

  validateFile(file, folder, cb) {
    const allowedTypes = {
      'avatars': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'session-files': [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      'homework': [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
    };

    const allowed = allowedTypes[folder] || [];
    
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed for ${folder}`), false);
    }
  }

  // Process avatar upload
  async processAvatar(file) {
    try {
      const outputPath = path.join(this.avatarDir, `processed_${file.filename}`);
      
      // Resize and optimize image
      await sharp(file.path)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
      
      // Delete original file
      fs.unlinkSync(file.path);
      
      return {
        success: true,
        filename: `processed_${file.filename}`,
        url: `/uploads/avatars/processed_${file.filename}`,
        size: fs.statSync(outputPath).size
      };
    } catch (error) {
      console.error('Avatar processing error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process session file upload
  async processSessionFile(file, sessionId) {
    try {
      const fileInfo = {
        id: uuidv4(),
        sessionId,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/session-files/${file.filename}`,
        uploadedAt: new Date().toISOString()
      };

      // Store file info in database
      const { statements } = require('../database/db');
      statements.db.prepare(`
        INSERT INTO session_files (id, session_id, original_name, filename, mimetype, size, url, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        fileInfo.id,
        fileInfo.sessionId,
        fileInfo.originalName,
        fileInfo.filename,
        fileInfo.mimetype,
        fileInfo.size,
        fileInfo.url,
        fileInfo.uploadedAt
      );

      return { success: true, fileInfo };
    } catch (error) {
      console.error('Session file processing error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process homework file upload
  async processHomeworkFiles(files, homeworkId) {
    try {
      const processedFiles = [];
      
      for (const file of files) {
        const fileInfo = {
          id: uuidv4(),
          homeworkId,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/homework/${file.filename}`,
          uploadedAt: new Date().toISOString()
        };

        // Store file info in database
        const { statements } = require('../database/db');
        statements.db.prepare(`
          INSERT INTO homework_files (id, homework_id, original_name, filename, mimetype, size, url, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fileInfo.id,
          fileInfo.homeworkId,
          fileInfo.originalName,
          fileInfo.filename,
          fileInfo.mimetype,
          fileInfo.size,
          fileInfo.url,
          fileInfo.uploadedAt
        );

        processedFiles.push(fileInfo);
      }

      return { success: true, files: processedFiles };
    } catch (error) {
      console.error('Homework file processing error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get file by ID
  getFile(fileId, type = 'session') {
    try {
      const { statements } = require('../database/db');
      const table = type === 'homework' ? 'homework_files' : 'session_files';
      
      const file = statements.db.prepare(`
        SELECT * FROM ${table} WHERE id = ?
      `).get(fileId);

      return file ? { success: true, file } : { success: false, error: 'File not found' };
    } catch (error) {
      console.error('Get file error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete file
  async deleteFile(fileId, type = 'session') {
    try {
      const fileResult = this.getFile(fileId, type);
      if (!fileResult.success) {
        return fileResult;
      }

      const file = fileResult.file;
      const filePath = path.join(this.uploadDir, file.filename);

      // Delete physical file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      const { statements } = require('../database/db');
      const table = type === 'homework' ? 'homework_files' : 'session_files';
      
      statements.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(fileId);

      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get session files
  getSessionFiles(sessionId) {
    try {
      const { statements } = require('../database/db');
      const files = statements.db.prepare(`
        SELECT * FROM session_files WHERE session_id = ? ORDER BY uploaded_at DESC
      `).all(sessionId);

      return { success: true, files };
    } catch (error) {
      console.error('Get session files error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get homework files
  getHomeworkFiles(homeworkId) {
    try {
      const { statements } = require('../database/db');
      const files = statements.db.prepare(`
        SELECT * FROM homework_files WHERE homework_id = ? ORDER BY uploaded_at DESC
      `).all(homeworkId);

      return { success: true, files };
    } catch (error) {
      console.error('Get homework files error:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up old files (run periodically)
  async cleanupOldFiles(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const { statements } = require('../database/db');
      
      // Get old files
      const oldFiles = statements.db.prepare(`
        SELECT filename FROM session_files WHERE uploaded_at < ?
        UNION
        SELECT filename FROM homework_files WHERE uploaded_at < ?
      `).all(cutoffDate.toISOString(), cutoffDate.toISOString());

      let deletedCount = 0;
      
      // Delete physical files
      oldFiles.forEach(file => {
        const filePath = path.join(this.uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      // Delete from database
      statements.db.prepare(`DELETE FROM session_files WHERE uploaded_at < ?`).run(cutoffDate.toISOString());
      statements.db.prepare(`DELETE FROM homework_files WHERE uploaded_at < ?`).run(cutoffDate.toISOString());

      console.log(`Cleaned up ${deletedCount} old files`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FileUploadService();