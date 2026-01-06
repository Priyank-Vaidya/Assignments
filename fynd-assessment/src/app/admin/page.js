'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Star, MessageSquare, AlertTriangle, TrendingUp, Users, Activity, Filter, X } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then(res => res.json());

// Premium Sentiment Colors
const SENTIMENT_COLORS = {
  5: { hex: '#059669', twBg: 'bg-emerald-100', twText: 'text-emerald-800', label: 'Excellent' },
  4: { hex: '#0891b2', twBg: 'bg-cyan-100', twText: 'text-cyan-800', label: 'Good' },
  3: { hex: '#d97706', twBg: 'bg-amber-100', twText: 'text-amber-800', label: 'Average' },
  2: { hex: '#ea580c', twBg: 'bg-orange-100', twText: 'text-orange-800', label: 'Poor' },
  1: { hex: '#dc2626', twBg: 'bg-red-100', twText: 'text-red-800', label: 'Terrible' }
};

export default function AdminDashboard() {
  const { data: reviews, error } = useSWR('/api/reviews', fetcher, { 
    refreshInterval: 5000,
    revalidateOnFocus: true 
  });

  const [selectedRating, setSelectedRating] = useState(null);

  if (error) return <div className="flex h-screen items-center justify-center text-red-600 font-medium">Failed to load data.</div>;
  if (!reviews) return <div className="flex h-screen items-center justify-center text-indigo-600 animate-pulse font-medium">Loading Dashboard...</div>;


  const filteredReviews = selectedRating 
    ? reviews.filter(r => r.rating === selectedRating) 
    : reviews;

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
  

  const pieChartData = [5, 4, 3, 2, 1]
    .map(star => ({
      name: `${star} Star`,
      ratingKey: star,
      count: reviews.filter(r => r.rating === star).length
    }))
    .filter(item => item.count > 0);

  // --- 3. "AI" COMMON AREAS LOGIC (Client-Side) ---

  const commonThemes = useMemo(() => {
    if (!selectedRating) return [];
    
    const allText = filteredReviews.map(r => r.aiSummary).join(" ").toLowerCase();
    // Remove common stop words
    const stopWords = ['the', 'and', 'a', 'to', 'of', 'in', 'is', 'was', 'for', 'with', 'very', 'but', 'not'];
    const words = allText.split(/\W+/).filter(w => w.length > 3 && !stopWords.includes(w));
    
    // Count frequency
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    // Return top 5 frequent words
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  }, [selectedRating, filteredReviews]);


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-lg">
            <p className="font-bold" style={{color: SENTIMENT_COLORS[data.ratingKey].hex}}>{data.name}</p>
            <p className="text-gray-600">Count: <span className="font-bold">{data.count}</span></p>
            <p className="text-xs text-indigo-500 mt-2 font-bold">Click to filter</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Feedback Overview</h1>
            <p className="text-gray-500 mt-2 text-lg">Real-time AI analysis of customer sentiment.</p>
          </div>
          <div className="flex items-center gap-3 bg-indigo-50 px-5 py-2.5 rounded-full">
            <Activity size={20} className="text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">Live Updates Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={<Users size={28} className="text-blue-600"/>} label="Total Reviews" value={totalReviews} subtext="All time" bgColor="bg-blue-50/50" />
            <StatCard icon={<Star size={28} className="text-amber-500 fill-amber-500"/>} label="Average Rating" value={avgRating} subtext="out of 5.0" bgColor="bg-amber-50/50" />
            <StatCard icon={<TrendingUp size={28} className="text-emerald-600"/>} label="Response Rate" value="100%" subtext="AI Processed" bgColor="bg-emerald-50/50" />
        </div>

        {/* --- MAIN INTERACTIVE SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. Interactive Pie Chart */}
            <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rating Distribution</h3>
                <p className="text-sm text-gray-400 mb-6">Click a slice to filter reviews</p>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            cursor="pointer"
                            onClick={(data) => setSelectedRating(data.ratingKey === selectedRating ? null : data.ratingKey)}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={SENTIMENT_COLORS[entry.ratingKey].hex} 
                                    opacity={selectedRating && selectedRating !== entry.ratingKey ? 0.3 : 1}
                                    strokeWidth={selectedRating === entry.ratingKey ? 4 : 0}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Dynamic Insights Panel */}
            <div className="lg:col-span-2 bg-gray-50 rounded-3xl p-8 border border-gray-100 relative overflow-hidden">
                {selectedRating ? (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Insights: <span className={`${SENTIMENT_COLORS[selectedRating].twText}`}>{selectedRating} Star Reviews</span>
                                </h3>
                                <p className="text-gray-500 mt-1">Analyzing {filteredReviews.length} reviews...</p>
                            </div>
                            <button onClick={() => setSelectedRating(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={24} className="text-gray-500"/>
                            </button>
                        </div>

                        {/* Common Themes Bubble Cloud */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Common Themes Found by AI</h4>
                            <div className="flex flex-wrap gap-3">
                                {commonThemes.length > 0 ? commonThemes.map((theme, i) => (
                                    <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-bold text-indigo-600 shadow-sm border border-indigo-50 capitalize">
                                        {theme.word} <span className="text-indigo-300 ml-1">({theme.count})</span>
                                    </span>
                                )) : <p className="text-gray-400 italic">Not enough data to find themes yet.</p>}
                            </div>
                        </div>

                        {/* Recommendation Box */}
                        <div className={`p-5 rounded-2xl border ${selectedRating >= 4 ? 'bg-emerald-100/50 border-emerald-200' : 'bg-red-100/50 border-red-200'}`}>
                             <h4 className={`text-sm font-bold uppercase mb-2 ${selectedRating >= 4 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {selectedRating >= 4 ? "What we're doing right" : "Areas for Attention"}
                             </h4>
                             <p className="text-gray-800 font-medium">
                                {selectedRating >= 4 
                                    ? "Customers are highlighting positive experiences. Continue reinforcing these service standards." 
                                    : "Several reviews indicate friction points. Review the 'Action' items below to address these concerns."}
                             </p>
                        </div>
                    </div>
                ) : (

                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Filter size={32} className="text-gray-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Select a Rating</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Click on the Pie Chart to filter reviews and see detailed AI insights for that specific segment.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Review List Header */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900">
                {selectedRating ? `Showing ${selectedRating} Star Reviews` : "All Recent Feedback"}
            </h3>
            {selectedRating && (
                <button 
                    onClick={() => setSelectedRating(null)}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                >
                    Reset Filter <X size={16}/>
                </button>
            )}
        </div>

        {/* Filtered Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.length > 0 ? filteredReviews.map((review) => {
                const colors = SENTIMENT_COLORS[review.rating];
                return (
                    <div key={review._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`flex items-center justify-center px-4 py-2 rounded-lg font-bold ${colors.twBg} ${colors.twText}`}>
                                {review.rating} <Star size={16} className="ml-1 fill-current" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3 italic">"{review.reviewText}"</p>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                            <p className="text-sm text-indigo-900 font-medium">
                                <span className="font-bold uppercase text-xs text-indigo-500 mr-2">AI Summary:</span>
                                {review.aiSummary}
                            </p>
                        </div>
                    </div>
                );
            }) : (
                <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    No reviews found for this filter.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, bgColor }) {
  return (
    <div className={`p-6 rounded-3xl border border-gray-100/50 flex items-center gap-5 shadow-sm ${bgColor}`}>
      <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-400">{subtext}</p>
      </div>
    </div>
  );
}