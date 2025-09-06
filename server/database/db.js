const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'iinstructor.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

const init = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT CHECK(role IN ('learner', 'instructor', 'admin')) DEFAULT 'learner',
      university TEXT,
      department TEXT,
      year INTEGER,
      skills TEXT, -- JSON array of skills
      bio TEXT,
      rating REAL DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      is_online BOOLEAN DEFAULT FALSE,
      response_time REAL DEFAULT 0,
      phone_number TEXT,
      preferences TEXT, -- JSON object
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      learner_id TEXT NOT NULL,
      instructor_id TEXT,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('pending', 'matched', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
      duration INTEGER DEFAULT 0, -- in minutes
      price REAL DEFAULT 0,
      rating INTEGER,
      review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      ended_at DATETIME,
      FOREIGN KEY (learner_id) REFERENCES users (id),
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT CHECK(message_type IN ('text', 'image', 'code', 'math', 'file')) DEFAULT 'text',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Knowledge base table
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      subject TEXT NOT NULL,
      tags TEXT, -- JSON array
      author_id TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `);

  // Homework requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS homework_requests (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      instructor_id TEXT,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      deadline DATETIME,
      urgency TEXT CHECK(urgency IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
      status TEXT CHECK(status IN ('pending', 'assigned', 'completed', 'cancelled')) DEFAULT 'pending',
      price REAL NOT NULL,
      solution TEXT,
      files TEXT, -- JSON array of file paths
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES users (id),
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    )
  `);

  // User availability table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_availability (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
      start_time TEXT NOT NULL, -- HH:MM format
      end_time TEXT NOT NULL, -- HH:MM format
      timezone TEXT DEFAULT 'UTC',
      is_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Session queue for matching
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_queue (
      id TEXT PRIMARY KEY,
      learner_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      urgency TEXT CHECK(urgency IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
      max_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (learner_id) REFERENCES users (id)
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      instructor_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'usd',
      stripe_payment_intent_id TEXT,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (learner_id) REFERENCES users (id),
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    )
  `);

  // Payouts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      instructor_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL, -- 'bank', 'bkash', 'nagad', 'rocket'
      account_details TEXT, -- JSON string
      status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('session', 'payment', 'system', 'reminder')) DEFAULT 'system',
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      reviewee_id TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (reviewer_id) REFERENCES users (id),
      FOREIGN KEY (reviewee_id) REFERENCES users (id)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_learner ON sessions(learner_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_instructor ON sessions(instructor_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_queue_subject ON session_queue(subject);
    CREATE INDEX IF NOT EXISTS idx_queue_created ON session_queue(created_at);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_learner ON payments(learner_id);
    CREATE INDEX IF NOT EXISTS idx_payments_instructor ON payments(instructor_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_session ON reviews(session_id);
  `);

  console.log('Database initialized successfully');
};

// Prepared statements for common operations
const statements = {
  // Users
  createUser: db.prepare(`
    INSERT INTO users (id, email, name, avatar, role, university, department, year, skills, bio, preferences)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  updateUser: db.prepare(`
    UPDATE users SET name = ?, avatar = ?, university = ?, department = ?, year = ?, 
                     skills = ?, bio = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  updateUserOnlineStatus: db.prepare('UPDATE users SET is_online = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?'),
  getOnlineInstructors: db.prepare(`
    SELECT * FROM users 
    WHERE role = 'instructor' AND is_online = TRUE 
    ORDER BY rating DESC, response_time ASC
  `),

  // Sessions
  createSession: db.prepare(`
    INSERT INTO sessions (id, learner_id, instructor_id, subject, topic, description, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getSessionById: db.prepare('SELECT * FROM sessions WHERE id = ?'),
  updateSessionStatus: db.prepare('UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  getUserSessions: db.prepare(`
    SELECT s.*, u1.name as learner_name, u2.name as instructor_name 
    FROM sessions s
    LEFT JOIN users u1 ON s.learner_id = u1.id
    LEFT JOIN users u2 ON s.instructor_id = u2.id
    WHERE s.learner_id = ? OR s.instructor_id = ?
    ORDER BY s.created_at DESC
  `),

  // Messages
  createMessage: db.prepare(`
    INSERT INTO messages (id, session_id, user_id, content, message_type)
    VALUES (?, ?, ?, ?, ?)
  `),
  getSessionMessages: db.prepare(`
    SELECT m.*, u.name as user_name, u.avatar as user_avatar
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.session_id = ?
    ORDER BY m.created_at ASC
  `),

  // Queue
  addToQueue: db.prepare(`
    INSERT INTO session_queue (id, learner_id, subject, topic, description, urgency, max_price, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getQueueItem: db.prepare('SELECT * FROM session_queue WHERE id = ?'),
  removeFromQueue: db.prepare('DELETE FROM session_queue WHERE id = ?'),
  getQueueBySubject: db.prepare('SELECT * FROM session_queue WHERE subject = ? ORDER BY created_at ASC'),

  // Knowledge base
  createKnowledgeItem: db.prepare(`
    INSERT INTO knowledge_items (id, title, content, subject, tags, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  searchKnowledge: db.prepare(`
    SELECT k.*, u.name as author_name
    FROM knowledge_items k
    JOIN users u ON k.author_id = u.id
    WHERE k.title LIKE ? OR k.content LIKE ? OR k.subject LIKE ?
    ORDER BY k.upvotes DESC, k.created_at DESC
  `)
};

module.exports = {
  db,
  init,
  statements
};