'use client';
import { useState } from 'react';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function UserDashboard() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText: review }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse({ type: 'success', text: data.message });
        setReview('');
        setRating(0);
      } else {
        setResponse({ type: 'error', text: 'Failed to submit.' });
      }
    } catch (error) {
      setResponse({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 transform transition-all hover:scale-[1.01]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <MessageIcon />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Opinion Matters</h1>
          <p className="text-gray-500 mt-2 text-lg">Help us improve with your honest feedback.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Interactive Stars */}
          <div className="flex flex-col items-center space-y-3">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rate your experience</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform duration-200 hover:scale-125"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-md"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <span className="text-indigo-600 font-medium text-sm animate-fade-in">{getRatingLabel(rating)}</span>}
          </div>

          {/* Review Text Area */}
          <div className="relative group">
            <textarea
              required
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none text-gray-700 leading-relaxed group-hover:border-gray-300"
              rows="4"
              placeholder="Tell us what you liked or how we can improve..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">{review.length} chars</div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all duration-300
              ${loading || rating === 0 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/30 transform hover:-translate-y-1'
              }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> <span>Submit Review</span></>}
          </button>
        </form>

        {/* AI Response Card */}
        {response && (
          <div className={`mt-8 p-6 rounded-xl border flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
            response.type === 'success' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
          }`}>
            <div className={`p-2 rounded-full ${response.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 ${response.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {response.type === 'success' ? 'AI Response' : 'Error'}
              </h3>
              <p className={`text-sm leading-relaxed ${response.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {response.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function MessageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function getRatingLabel(r) {
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return labels[r];
}