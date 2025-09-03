import React, { useState } from 'react';
import { Calendar, Clock, User, DollarSign, X } from 'lucide-react';
import { Subject } from '../../types';

interface SessionSchedulerProps {
  onClose: () => void;
  onSchedule: (sessionData: any) => void;
}

const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: '📐', description: 'Calculus, Algebra, Statistics', averagePrice: 3, availableInstructors: 15 },
  { id: 'cs', name: 'Computer Science', icon: '💻', description: 'Programming, Data Structures', averagePrice: 4, availableInstructors: 23 },
  { id: 'physics', name: 'Physics', icon: '⚡', description: 'Mechanics, Quantum Physics', averagePrice: 3, availableInstructors: 8 },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Organic, Inorganic Chemistry', averagePrice: 3, availableInstructors: 12 }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onClose, onSchedule }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(15);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [preferredInstructor, setPreferredInstructor] = useState('');

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const calculateCost = () => {
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) return 0;
    return (duration / 15) * subject.averagePrice;
  };

  const handleSchedule = () => {
    if (!selectedSubject || !selectedDate || !selectedTime || !topic) return;

    const sessionData = {
      subject: selectedSubject,
      date: selectedDate,
      time: selectedTime,
      duration,
      topic,
      description,
      preferredInstructor,
      cost: calculateCost()
    };

    onSchedule(sessionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Schedule a Session
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subject
              </label>
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
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{subject.name}</div>
                        <div className="text-sm text-gray-500">${subject.averagePrice}/15min</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select date</option>
                  {generateDateOptions().map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex space-x-3">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      duration === mins
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Integration by parts, Binary trees"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Provide more details about what you need help with..."
              />
            </div>

            {/* Cost Summary */}
            {selectedSubject && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">Session Cost</div>
                    <div className="text-sm text-blue-700">
                      {duration} minutes • {subjects.find(s => s.id === selectedSubject)?.name}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${calculateCost().toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedSubject || !selectedDate || !selectedTime || !topic}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionScheduler;