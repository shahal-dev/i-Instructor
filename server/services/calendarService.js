const { statements } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class CalendarService {
  constructor() {
    this.timeZones = {
      'Asia/Dhaka': '+06:00',
      'UTC': '+00:00',
      'America/New_York': '-05:00',
      'Europe/London': '+00:00'
    };
  }

  // Set user availability
  async setUserAvailability(userId, availabilityData) {
    try {
      // Clear existing availability
      statements.db.prepare('DELETE FROM user_availability WHERE user_id = ?').run(userId);
      
      // Insert new availability
      const insertStmt = statements.db.prepare(`
        INSERT INTO user_availability (id, user_id, day_of_week, start_time, end_time, timezone, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      availabilityData.forEach(slot => {
        insertStmt.run(
          uuidv4(),
          userId,
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
          slot.timezone || 'Asia/Dhaka',
          true
        );
      });
      
      return { success: true };
    } catch (error) {
      console.error('Set availability error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user availability
  getUserAvailability(userId) {
    try {
      const availability = statements.db.prepare(`
        SELECT * FROM user_availability 
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY day_of_week, start_time
      `).all(userId);
      
      return { success: true, availability };
    } catch (error) {
      console.error('Get availability error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is available at specific time
  isUserAvailable(userId, dateTime) {
    try {
      const date = new Date(dateTime);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const timeString = date.toTimeString().slice(0, 5); // HH:MM format
      
      const availability = statements.db.prepare(`
        SELECT * FROM user_availability 
        WHERE user_id = ? AND day_of_week = ? AND start_time <= ? AND end_time >= ? AND is_active = TRUE
      `).get(userId, dayOfWeek, timeString, timeString);
      
      return !!availability;
    } catch (error) {
      console.error('Check availability error:', error);
      return false;
    }
  }

  // Get available time slots for a user
  getAvailableSlots(userId, date, duration = 30) {
    try {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      
      const availability = statements.db.prepare(`
        SELECT * FROM user_availability 
        WHERE user_id = ? AND day_of_week = ? AND is_active = TRUE
        ORDER BY start_time
      `).all(userId, dayOfWeek);
      
      const slots = [];
      
      availability.forEach(slot => {
        const startTime = this.parseTime(slot.start_time);
        const endTime = this.parseTime(slot.end_time);
        
        // Generate 30-minute slots within availability window
        let currentTime = startTime;
        while (currentTime + duration <= endTime) {
          const slotStart = this.formatTime(currentTime);
          const slotEnd = this.formatTime(currentTime + duration);
          
          // Check if slot conflicts with existing sessions
          const hasConflict = this.hasSessionConflict(userId, date, slotStart, slotEnd);
          
          if (!hasConflict) {
            slots.push({
              startTime: slotStart,
              endTime: slotEnd,
              available: true
            });
          }
          
          currentTime += 30; // Move to next 30-minute slot
        }
      });
      
      return { success: true, slots };
    } catch (error) {
      console.error('Get available slots error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for session conflicts
  hasSessionConflict(userId, date, startTime, endTime) {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      
      const conflict = statements.db.prepare(`
        SELECT COUNT(*) as count FROM sessions 
        WHERE (learner_id = ? OR instructor_id = ?) 
        AND DATE(started_at) = ? 
        AND status IN ('active', 'matched')
        AND (
          (TIME(started_at) <= ? AND TIME(started_at) + INTERVAL duration MINUTE > ?) OR
          (TIME(started_at) < ? AND TIME(started_at) + INTERVAL duration MINUTE >= ?)
        )
      `).get(userId, userId, dateStr, startTime, startTime, endTime, endTime);
      
      return conflict.count > 0;
    } catch (error) {
      console.error('Check conflict error:', error);
      return false;
    }
  }

  // Schedule a session
  async scheduleSession(sessionData) {
    try {
      const { learnerId, instructorId, subject, topic, scheduledTime, duration, description } = sessionData;
      
      // Check instructor availability
      if (!this.isUserAvailable(instructorId, scheduledTime)) {
        return { success: false, error: 'Instructor not available at requested time' };
      }
      
      // Check for conflicts
      const learnerConflict = this.hasSessionConflict(learnerId, scheduledTime, scheduledTime, scheduledTime);
      const instructorConflict = this.hasSessionConflict(instructorId, scheduledTime, scheduledTime, scheduledTime);
      
      if (learnerConflict || instructorConflict) {
        return { success: false, error: 'Time slot conflicts with existing session' };
      }
      
      // Create scheduled session
      const sessionId = uuidv4();
      const price = this.calculateSessionPrice(subject, duration);
      
      statements.createSession.run(
        sessionId,
        learnerId,
        instructorId,
        subject,
        topic,
        description,
        price
      );
      
      // Update session with scheduled time
      statements.db.prepare(`
        UPDATE sessions SET started_at = ?, status = 'scheduled' WHERE id = ?
      `).run(scheduledTime, sessionId);
      
      return { success: true, sessionId };
    } catch (error) {
      console.error('Schedule session error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's scheduled sessions
  getUserScheduledSessions(userId) {
    try {
      const sessions = statements.db.prepare(`
        SELECT s.*, u1.name as learner_name, u2.name as instructor_name
        FROM sessions s
        LEFT JOIN users u1 ON s.learner_id = u1.id
        LEFT JOIN users u2 ON s.instructor_id = u2.id
        WHERE (s.learner_id = ? OR s.instructor_id = ?) 
        AND s.status = 'scheduled'
        AND s.started_at > datetime('now')
        ORDER BY s.started_at ASC
      `).all(userId, userId);
      
      return { success: true, sessions };
    } catch (error) {
      console.error('Get scheduled sessions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  calculateSessionPrice(subject, duration) {
    const basePricePerMinute = 0.2; // $0.20 per minute
    const subjectMultipliers = {
      'Mathematics': 1.0,
      'Computer Science': 1.2,
      'Physics': 1.1,
      'Chemistry': 1.1,
      'Biology': 1.0,
      'English': 0.8
    };
    
    const multiplier = subjectMultipliers[subject] || 1.0;
    return Math.round(duration * basePricePerMinute * multiplier * 100) / 100;
  }

  // Convert time between timezones
  convertTimezone(dateTime, fromTz, toTz) {
    // Simplified timezone conversion
    const date = new Date(dateTime);
    const fromOffset = this.timeZones[fromTz] || '+00:00';
    const toOffset = this.timeZones[toTz] || '+00:00';
    
    // This is a simplified implementation
    // In production, use a proper timezone library like moment-timezone
    return date.toISOString();
  }
}

module.exports = new CalendarService();