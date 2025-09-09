import React, { useState } from 'react';
import { X, Search, Clock, DollarSign, Star, Users, Loader } from 'lucide-react';
import { Subject } from '../../types';
import aiService from '../../services/aiService';

interface GetHelpModalProps {
  onClose: () => void;
}

const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: '📐', description: 'Calculus, Algebra, Statistics', averagePrice: 3, availableInstructors: 15 },
  { id: 'cs', name: 'Computer Science', icon: '💻', description: 'Programming, Data Structures, Algorithms', averagePrice: 4, availableInstructors: 23 },
  { id: 'physics', name: 'Physics', icon: '⚡', description: 'Mechanics, Thermodynamics, Electromagnetism', averagePrice: 3, availableInstructors: 8 },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Organic, Inorganic, Physical Chemistry', averagePrice: 3, availableInstructors: 12 },
  { id: 'biology', name: 'Biology', icon: '🧬', description: 'Molecular, Genetics, Biochemistry', averagePrice: 3, availableInstructors: 10 },
  { id: 'english', name: 'English', icon: '📚', description: 'Writing, Literature, Grammar', averagePrice: 2, availableInstructors: 18 }
];

const GetHelpModal: React.FC<GetHelpModalProps> = ({ onClose }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [searchingInstructor, setSearchingInstructor] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const handleGetHelp = async () => {
    if (!selectedSubject || !topic) return;

    setSearchingInstructor(true);
    
    try {
      // Get AI-powered recommendations
      const response = await aiService.getInstructorRecommendations({
        subject: subjects.find(s => s.id === selectedSubject)?.name || '',
        topic,
        description,
        urgency,
        maxPrice
      });
      
      setAiRecommendations(response.recommendations || []);
      
      // Simulate connection to best match
      setTimeout(() => {
        setSearchingInstructor(false);
        onClose();
        alert(`Connected with ${response.recommendations?.[0]?.name || 'an instructor'}!`);
      }, 1500);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setSearchingInstructor(false);
      onClose();
      alert('Instructor found! Connecting you now...');
    }
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
    if (value.length > 2 && selectedSubject) {
      const suggestions = aiService.generateSearchSuggestions(
        value, 
        subjects.find(s => s.id === selectedSubject)?.name
      );
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Get Help Now
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {searchingInstructor ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Finding the perfect instructor...
              </h3>
              <p className="text-gray-600">
                We're matching you with an expert in {subjects.find(s => s.id === selectedSubject)?.name}
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>✓ Checking instructor availability</p>
                <p>✓ Matching expertise with your topic</p>
                <p>✓ Preparing session room</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What subject do you need help with?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedSubject === subject.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{subject.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{subject.name}</div>
                          <div className="text-sm text-gray-500">{subject.description}</div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${subject.averagePrice}/15min
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {subject.availableInstructors} online
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubject && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What specific topic?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Integration by parts, Binary trees, Essay structure"
                      />
                      {searchSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setTopic(suggestion);
                                setSearchSuggestions([]);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your problem (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Briefly describe what you're struggling with..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How urgent is this?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'normal', label: 'Normal', color: 'border-gray-300' },
                        { value: 'urgent', label: 'Urgent', color: 'border-orange-300' },
                        { value: 'emergency', label: 'Emergency', color: 'border-red-300' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setUrgency(option.value as any)}
                          className={`p-2 rounded-lg border-2 transition-all text-sm ${
                            urgency === option.value
                              ? `${option.color} bg-opacity-20`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum budget (optional)
                    </label>
                    <input
                      type="number"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10"
                      min="1"
                      step="0.5"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">
                          Expected wait time: {urgency === 'emergency' ? '<1' : urgency === 'urgent' ? '1-2' : '2-5'} minutes
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          Estimated cost: ${(subjects.find(s => s.id === selectedSubject)?.averagePrice || 3) * (urgency === 'emergency' ? 2 : urgency === 'urgent' ? 1.5 : 1)}/15min
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGetHelp}
                    disabled={!topic.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Find Me an Instructor
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetHelpModal;