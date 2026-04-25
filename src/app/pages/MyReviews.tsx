import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Star, User, ArrowLeft, MessageSquare } from 'lucide-react';
import { api, Review } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function MyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const data = await api.getMyReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Exception while fetching my reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] pb-20 opacity-0 animate-fadeIn">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#020817]/95 backdrop-blur-md z-10 px-4 pt-12 pb-4 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white">Mening sharhlarim</h1>
        </div>

        <div className="px-4 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500">Yuklanmoqda...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-bold mb-1">Hali sharhlar yo'q</h3>
              <p className="text-slate-500 text-sm max-w-[240px]">
                Siz hali birorta ham maydon uchun sharh qoldirmagansiz.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#0d1526] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">{review.fieldId}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-white text-sm font-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{review.comment}</p>
                      <span className="text-slate-600 text-xs">
                        {new Date(review.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
