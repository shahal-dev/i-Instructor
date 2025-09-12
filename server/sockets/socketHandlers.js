const { v4: uuidv4 } = require('uuid');
const { statements } = require('../database/db');
const matchingEngine = require('../services/matchingEngine');
const NotificationService = require('../services/notificationService');

// Store active connections
const activeConnections = new Map();
const activeSessions = new Map();

let notificationService;

module.exports = (io, socket) => {
  // Initialize notification service if not already done
  if (!notificationService) {
    notificationService = new NotificationService(io);
  }

  console.log('New socket connection:', socket.id);

  // User authentication and connection setup
  socket.on('authenticate', (data) => {
    try {
      const { userId, sessionId } = data;
      
      // Store user connection
      activeConnections.set(socket.id, { userId, sessionId });
      
      // Join user to their personal room
      socket.join(`user_${userId}`);
      
      // Join session room if provided
      if (sessionId) {
        socket.join(`session_${sessionId}`);
        
        // Add to active sessions
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, new Set());
        }
        activeSessions.get(sessionId).add(socket.id);
      }

      // Update user online status
      statements.updateUserOnlineStatus.run(1, userId);
      
      socket.emit('authenticated', { success: true });
      
      // Notify others that user is online
      socket.broadcast.emit('user_online', { userId });
      
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  // Join a session room
  socket.on('join_session', (data) => {
    try {
      const { sessionId, userId } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.userId !== userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Verify user is part of this session
      const session = statements.getSessionById.get(sessionId);
      if (!session || (session.learner_id !== userId && session.instructor_id !== userId)) {
        socket.emit('error', { message: 'Access denied to session' });
        return;
      }

      socket.join(`session_${sessionId}`);
      
      // Add to active sessions
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, new Set());
      }
      activeSessions.get(sessionId).add(socket.id);

      // Update connection info
      activeConnections.set(socket.id, { ...connection, sessionId });

      // Notify others in session
      socket.to(`session_${sessionId}`).emit('user_joined_session', {
        userId,
        sessionId
      });

      socket.emit('joined_session', { sessionId });
      
    } catch (error) {
      console.error('Join session error:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    try {
      const { sessionId, content, messageType = 'text' } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const messageId = uuidv4();
      
      // Save message to database
      statements.createMessage.run(
        messageId,
        sessionId,
        connection.userId,
        content,
        messageType
      );

      // Get message with user info
      const message = statements.db.prepare(`
        SELECT m.*, u.name as user_name, u.avatar as user_avatar
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `).get(messageId);

      // Broadcast to session room
      io.to(`session_${sessionId}`).emit('new_message', message);
      
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc_offer', (data) => {
    const { sessionId, offer, targetUserId } = data;
    socket.to(`user_${targetUserId}`).emit('webrtc_offer', {
      sessionId,
      offer,
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  socket.on('webrtc_answer', (data) => {
    const { sessionId, answer, targetUserId } = data;
    socket.to(`user_${targetUserId}`).emit('webrtc_answer', {
      sessionId,
      answer,
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  socket.on('webrtc_ice_candidate', (data) => {
    const { sessionId, candidate, targetUserId } = data;
    socket.to(`user_${targetUserId}`).emit('webrtc_ice_candidate', {
      sessionId,
      candidate,
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  // Handle whiteboard events
  socket.on('whiteboard_draw', (data) => {
    const { sessionId, drawData } = data;
    socket.to(`session_${sessionId}`).emit('whiteboard_draw', {
      drawData,
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  socket.on('whiteboard_clear', (data) => {
    const { sessionId } = data;
    socket.to(`session_${sessionId}`).emit('whiteboard_clear', {
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  // Handle screen sharing
  socket.on('start_screen_share', (data) => {
    const { sessionId } = data;
    socket.to(`session_${sessionId}`).emit('screen_share_started', {
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  socket.on('stop_screen_share', (data) => {
    const { sessionId } = data;
    socket.to(`session_${sessionId}`).emit('screen_share_stopped', {
      fromUserId: activeConnections.get(socket.id)?.userId
    });
  });

  // Handle session status updates
  socket.on('update_session_status', (data) => {
    try {
      const { sessionId, status } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Update session status in database
      statements.updateSessionStatus.run(status, sessionId);
      
      // Notify all users in session
      io.to(`session_${sessionId}`).emit('session_status_updated', {
        sessionId,
        status,
        updatedBy: connection.userId
      });

      // If session ended, clean up
      if (status === 'completed' || status === 'cancelled') {
        // Remove from active sessions
        if (activeSessions.has(sessionId)) {
          activeSessions.delete(sessionId);
        }
      }
      
    } catch (error) {
      console.error('Update session status error:', error);
      socket.emit('error', { message: 'Failed to update session status' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { sessionId } = data;
    const connection = activeConnections.get(socket.id);
    if (connection) {
      socket.to(`session_${sessionId}`).emit('user_typing', {
        userId: connection.userId,
        isTyping: true
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { sessionId } = data;
    const connection = activeConnections.get(socket.id);
    if (connection) {
      socket.to(`session_${sessionId}`).emit('user_typing', {
        userId: connection.userId,
        isTyping: false
      });
    }
  });

  // Handle queue notifications
  socket.on('instructor_available', (data) => {
    const { subjects } = data;
    const connection = activeConnections.get(socket.id);
    
    if (!connection) return;

    // Update matching engine
    matchingEngine.updateInstructorAvailability(connection.userId, subjects, true);

    // Check for waiting learners in queue
    subjects.forEach(subject => {
      const queueItems = statements.getQueueBySubject.all(subject);
      queueItems.forEach(item => {
        // Notify learner about available instructor
        io.to(`user_${item.learner_id}`).emit('instructor_available', {
          instructorId: connection.userId,
          subject,
          queueId: item.id
        });
      });
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const connection = activeConnections.get(socket.id);
      
      if (connection) {
        const { userId, sessionId } = connection;
        
        // Update matching engine
        matchingEngine.updateInstructorAvailability(userId, [], false);
        
        // Update user offline status
        statements.updateUserOnlineStatus.run(0, userId);
        
        // Remove from active sessions
        if (sessionId && activeSessions.has(sessionId)) {
          activeSessions.get(sessionId).delete(socket.id);
          if (activeSessions.get(sessionId).size === 0) {
            activeSessions.delete(sessionId);
          }
        }
        
        // Notify others
        socket.broadcast.emit('user_offline', { userId });
        
        if (sessionId) {
          socket.to(`session_${sessionId}`).emit('user_left_session', {
            userId,
            sessionId
          });
        }
      }
      
      // Clean up connection
      activeConnections.delete(socket.id);
      
      console.log('User disconnected:', socket.id);
      
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

// Initialize periodic tasks
setInterval(() => {
  // Clean old notifications every hour
  if (notificationService) {
    notificationService.cleanOldNotifications();
  }
}, 60 * 60 * 1000);

// Export active connections for external use
module.exports.getActiveConnections = () => activeConnections;
module.exports.getActiveSessions = () => activeSessions;