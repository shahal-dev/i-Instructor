import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, X } from 'lucide-react';

interface SessionRatingProps {
  instructorName: string;
  sessionDuration: number;
  sessionCost: number;
  onSubmit: (rating: number, review: string, saveToKnowledge: boolean) => void;
  onClose: () => void;
}

const SessionRating: React.FC<SessionRatingProps> = ({
  instructorName,
  sessionDuration,
  sessionCost,
  onSubmit,
  onClose
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [saveToKnowledge, setSaveToKnowledge] = useState(true);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, review, saveToKnowledge);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Rate Your Session
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Session with {instructorName}
              </div>
              <div className="flex justify-center space-x-6 text-sm text-gray-600">
                <span>Duration: {sessionDuration} minutes</span>
                <span>Cost: ${sessionCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center mt-2 text-sm text-gray-600">
                {rating === 5 && "Excellent! 🎉"}
                {rating === 4 && "Great! 👍"}
                {rating === 3 && "Good 👌"}
                {rating === 2 && "Okay 😐"}
                {rating === 1 && "Needs improvement 😔"}
              </div>
            )}
          </div>

          {/* Review */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave a review (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Share your experience to help other students..."
            />
          </div>

          {/* Save to Knowledge Base */}
          <div className="mb-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={saveToKnowledge}
                onChange={(e) => setSaveToKnowledge(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Save solution to Knowledge Base
                </div>
                <div className="text-xs text-gray-500">
                  Help other students by sharing this solution (anonymized)
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRating;