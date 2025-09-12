const { db } = require('../database/db');

console.log('🔍 i-Instructor Database Viewer\n');

// Function to display table data
function displayTable(tableName, query, limit = 10) {
  console.log(`\n📋 ${tableName.toUpperCase()} TABLE:`);
  console.log('=' .repeat(50));
  
  try {
    const rows = db.prepare(query + ` LIMIT ${limit}`).all();
    
    if (rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    // Display headers
    const headers = Object.keys(rows[0]);
    console.log(headers.join(' | '));
    console.log('-'.repeat(headers.join(' | ').length));
    
    // Display rows
    rows.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        if (typeof value === 'string' && value.length > 30) {
          value = value.substring(0, 30) + '...';
        }
        return value || 'NULL';
      });
      console.log(values.join(' | '));
    });
    
    console.log(`\nShowing ${rows.length} rows`);
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error.message);
  }
}

// Display all tables
displayTable('Users', 'SELECT id, name, email, role, university, rating, is_online FROM users');
displayTable('Sessions', 'SELECT id, subject, topic, status, duration, price, created_at FROM sessions');
displayTable('Messages', 'SELECT id, session_id, content, message_type, created_at FROM messages');
displayTable('Knowledge Items', 'SELECT id, title, subject, author_id, upvotes, created_at FROM knowledge_items');
displayTable('Session Queue', 'SELECT id, subject, topic, urgency, created_at FROM session_queue');
displayTable('Payments', 'SELECT id, amount, status, created_at FROM payments');

// Database statistics
console.log('\n📊 DATABASE STATISTICS:');
console.log('=' .repeat(30));

const stats = {
  users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
  instructors: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('instructor').count,
  learners: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('learner').count,
  sessions: db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
  messages: db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
  knowledge_items: db.prepare('SELECT COUNT(*) as count FROM knowledge_items').get().count,
  active_queue: db.prepare('SELECT COUNT(*) as count FROM session_queue').get().count
};

Object.entries(stats).forEach(([key, value]) => {
  console.log(`${key.replace('_', ' ').toUpperCase()}: ${value}`);
});

// Online users
const onlineUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_online = 1').get().count;
console.log(`ONLINE USERS: ${onlineUsers}`);

// Recent activity
console.log('\n🕒 RECENT ACTIVITY:');
console.log('=' .repeat(20));

const recentSessions = db.prepare(`
  SELECT s.subject, s.topic, s.status, u.name as learner_name, s.created_at
  FROM sessions s
  JOIN users u ON s.learner_id = u.id
  ORDER BY s.created_at DESC
  LIMIT 5
`).all();

if (recentSessions.length > 0) {
  recentSessions.forEach(session => {
    console.log(`${session.subject} - ${session.topic} (${session.status}) by ${session.learner_name}`);
  });
} else {
  console.log('No recent sessions found.');
}

console.log('\n✅ Database view completed!');
db.close();