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
    <div className="min-h-screen bg-slate-950 pb-20 opacity-0 animate-fadeIn">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 px-4 py-4 border-b border-slate-800 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Mening sharhlarim</h1>
        </div>

        {/* Reviews List */}
        <div className="px-4 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400">Yuklanmoqda...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">Hali sharhlar yo'q</h3>
              <p className="text-slate-400 text-sm max-w-[240px]">
                Siz hali birorta ham maydon uchun sharh qoldirmagansiz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">
                          {review.fieldId} {/* Note: In a real app, we might want the field name here */}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-2">{review.comment}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">
                          {new Date(review.createdAt).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
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
