import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { api, Review } from '../lib/api';
import { toast } from 'sonner';

interface ReviewsSectionProps {
  pitchId: string;
}

export default function ReviewsSection({ pitchId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [pitchId]);

  const fetchReviews = async () => {
    try {
      const data = await api.getReviews(pitchId);
      setReviews(data || []);
    } catch (err) {
      console.error('Exception while fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) return;

    setSubmitting(true);
    try {
      await api.submitReview({
        fieldId: pitchId,
        rating,
        comment: comment.trim(),
      });

      toast.success('Sharh muvaffaqiyatli qo\'shildi!');
      setComment('');
      setRating(5);
      setShowAddReview(false);
      fetchReviews();
    } catch (err: any) {
      console.error('Exception while submitting review:', err);
      toast.error('Sharh qo\'shishda xatolik yuz berdi', {
        description: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Sharhlar</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">{averageRating}</span>
            </div>
            <span className="text-slate-400 text-sm">({reviews.length} sharh)</span>
          </div>
        </div>
        
        {user && !showAddReview && (
          <button
            onClick={() => setShowAddReview(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Sharh qo'shish
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-[#0d1526] rounded-2xl p-4 mb-4 border border-white/10">
          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Baho</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                  <Star className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Sharh</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tajribangiz haqida yozing..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 resize-none transition-all"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !comment.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              {submitting ? 'Yuklanmoqda...' : 'Yuborish'}
            </button>
            <button
              onClick={() => { setShowAddReview(false); setComment(''); setRating(5); }}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Bekor
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">Yuklanmoqda...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          Hali sharhlar yo'q. Birinchi bo'lib sharh qoldiring!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#0d1526] rounded-2xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold text-sm">{review.user?.fullName || 'Foydalanuvchi'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span className="text-white text-sm font-bold">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && <p className="text-slate-400 text-sm mb-1.5">{review.comment}</p>}
                  <span className="text-slate-600 text-xs">
                    {new Date(review.createdAt || '').toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
