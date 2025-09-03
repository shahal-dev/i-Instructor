import React, { useState } from 'react';
import { Search, Filter, Star, ThumbsUp, Clock, Tag, BookOpen } from 'lucide-react';

const knowledgeItems = [
  {
    id: '1',
    title: 'Integration by Parts - Step by Step Guide',
    content: 'Learn how to solve integration by parts problems with the LIATE method. This comprehensive guide covers...',
    subject: 'Mathematics',
    tags: ['Calculus', 'Integration', 'LIATE'],
    author: 'Dr. Sarah Ahmed',
    upvotes: 45,
    createdAt: new Date('2024-01-15'),
    readTime: 5
  },
  {
    id: '2',
    title: 'Binary Search Trees: Implementation in Python',
    content: 'Complete implementation of Binary Search Trees with insertion, deletion, and traversal methods...',
    subject: 'Computer Science',
    tags: ['Data Structures', 'Python', 'Trees'],
    author: 'Mahmud Rahman',
    upvotes: 38,
    createdAt: new Date('2024-01-14'),
    readTime: 8
  },
  {
    id: '3',
    title: 'Understanding Quantum Tunneling',
    content: 'Explore the quantum mechanical phenomenon where particles pass through potential barriers...',
    subject: 'Physics',
    tags: ['Quantum Mechanics', 'Wave Functions'],
    author: 'Prof. Lisa Chen',
    upvotes: 32,
    createdAt: new Date('2024-01-13'),
    readTime: 6
  },
  {
    id: '4',
    title: 'Organic Chemistry Reaction Mechanisms',
    content: 'Master the fundamental reaction mechanisms in organic chemistry with detailed examples...',
    subject: 'Chemistry',
    tags: ['Organic Chemistry', 'Mechanisms', 'Reactions'],
    author: 'Dr. Ahmed Hassan',
    upvotes: 29,
    createdAt: new Date('2024-01-12'),
    readTime: 7
  },
  {
    id: '5',
    title: 'Essay Writing: Structure and Flow',
    content: 'Learn how to write compelling essays with proper structure, transitions, and argumentation...',
    subject: 'English',
    tags: ['Writing', 'Essays', 'Structure'],
    author: 'Prof. Jane Smith',
    upvotes: 41,
    createdAt: new Date('2024-01-11'),
    readTime: 4
  }
];

const subjects = ['All', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'English', 'Biology'];

const KnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const filteredItems = knowledgeItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Knowledge Base
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore solutions, guides, and explanations from our community of experts. 
          Learn from real student questions and instructor solutions.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for topics, subjects, or solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {item.subject}
                </span>
                {item.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>By {item.author}</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.readTime} min read
                  </div>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{item.upvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse by subject.
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Browse All Subjects
            </button>
          </div>
        )}
      </div>

      {/* Contribute CTA */}
      <div className="mt-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Help the Community Learn
        </h3>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Share your knowledge by contributing solutions, guides, and explanations. 
          Help fellow students overcome academic challenges.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Contribute Solution
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBase;