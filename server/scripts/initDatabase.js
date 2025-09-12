const { init, db } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

console.log('🚀 Initializing i-Instructor Database...');

// Initialize database
init();

console.log('✅ Database schema created successfully!');

// Create sample data for testing
console.log('📝 Creating sample data...');

// Sample users
const sampleUsers = [
  {
    id: uuidv4(),
    email: 'sarah.ahmed@example.com',
    name: 'Dr. Sarah Ahmed',
    role: 'instructor',
    university: 'University of Dhaka',
    department: 'Mathematics',
    skills: JSON.stringify(['Mathematics', 'Calculus', 'Statistics']),
    bio: 'Experienced mathematics instructor with 5+ years of teaching.',
    rating: 4.9,
    is_verified: true,
    is_online: true,
    response_time: 1.2
  },
  {
    id: uuidv4(),
    email: 'ahmad.rahman@example.com',
    name: 'Ahmad Rahman',
    role: 'learner',
    university: 'BUET',
    department: 'Computer Science',
    year: 3,
    skills: JSON.stringify([]),
    bio: null,
    rating: 0,
    is_verified: false,
    is_online: false,
    response_time: 0
  },
  {
    id: uuidv4(),
    email: 'mahmud.cs@example.com',
    name: 'Mahmud Rahman',
    role: 'instructor',
    university: 'NSU',
    department: 'Computer Science',
    skills: JSON.stringify(['Programming', 'JavaScript', 'Python', 'Data Structures']),
    bio: 'Full-stack developer and CS tutor.',
    rating: 4.8,
    is_verified: true,
    is_online: true,
    response_time: 1.5
  }
];

// Insert sample users
sampleUsers.forEach(user => {
  try {
    db.prepare(`
      INSERT INTO users (id, email, name, avatar, role, university, department, year, skills, bio, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id, user.email, user.name, null, user.role,
      user.university, user.department, user.year,
      user.skills, user.bio, JSON.stringify({})
    );
    console.log(`✅ Created user: ${user.name} (${user.role})`);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`⚠️  User ${user.email} already exists`);
    } else {
      console.error(`❌ Error creating user ${user.name}:`, error.message);
    }
  }
});

// Create sample knowledge items
const knowledgeItems = [
  {
    id: uuidv4(),
    title: 'Integration by Parts - Step by Step',
    content: 'Learn how to solve integration by parts problems using the LIATE method...',
    subject: 'Mathematics',
    tags: JSON.stringify(['Calculus', 'Integration', 'LIATE']),
    author_id: sampleUsers[0].id
  },
  {
    id: uuidv4(),
    title: 'Binary Search Algorithm Implementation',
    content: 'Complete guide to implementing binary search in JavaScript...',
    subject: 'Computer Science',
    tags: JSON.stringify(['Algorithms', 'JavaScript', 'Search']),
    author_id: sampleUsers[2].id
  }
];

knowledgeItems.forEach(item => {
  try {
    db.prepare(`
      INSERT INTO knowledge_items (id, title, content, subject, tags, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.title, item.content, item.subject,
      item.tags, item.author_id
    );
    console.log(`✅ Created knowledge item: ${item.title}`);
  } catch (error) {
    console.error(`❌ Error creating knowledge item:`, error.message);
  }
});

// Database statistics
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const instructorCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('instructor');
const knowledgeCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_items').get();

console.log('\n📊 Database Statistics:');
console.log(`👥 Total Users: ${userCount.count}`);
console.log(`👨‍🏫 Instructors: ${instructorCount.count}`);
console.log(`📚 Knowledge Items: ${knowledgeCount.count}`);

console.log('\n🎉 Database initialization completed successfully!');
console.log('📁 Database file location: server/data/iinstructor.db');

// Close database connection
db.close();