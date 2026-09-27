import React, { useState } from 'react';
import { Star, X, Check, MessageSquare } from 'lucide-react';
import { ratingsAPI } from '../utils/api';
import confetti from 'canvas-confetti';

export default function RatingModal({ order, fromUserId, toUserId, targetName, onClose, onRatingSubmitted }) {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ratingsAPI.submit({
        order_id: order.id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        score,
        comment
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-earth-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3 text-xl font-bold">
            ★
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900">
            Rate Your Direct Trade Experience
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Sharing your honest feedback for <span className="font-bold text-brand-900">{targetName}</span> helps build high-trust hyperlocal trade.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Picker */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => {
                const isFilled = (hoverScore || score) >= num;
                return (
                  <button
                    key={num}
                    type="button"
                    onMouseEnter={() => setHoverScore(num)}
                    onMouseLeave={() => setHoverScore(0)}
                    onClick={() => setScore(num)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                          : 'text-gray-300 stroke-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {score === 5 && '🌟 Exceptional Direct Quality & Prompt Supply!'}
              {score === 4 && '👍 Great Quality & Smooth Logistics'}
              {score === 3 && '👌 Satisfactory Delivery'}
              {score === 2 && '⚠️ Minor Issues / Delays'}
              {score === 1 && '❌ Unsatisfactory'}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
              Comments / Review Note (Optional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Fresh tomatoes delivered on time at agreed ₹21/kg rate. High sweetness and zero damage."
              className="w-full px-3 py-2 text-xs rounded-xl border border-earth-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-earth-300 text-gray-700 font-bold text-xs hover:bg-earth-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
