import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

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
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('pitch_id', pitchId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
      }
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
      const { error } = await supabase.from('reviews').insert({
        pitch_id: pitchId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (error) {
        console.error('Error submitting review:', error);
        alert('Sharh qo\'shishda xatolik yuz berdi');
      } else {
        setComment('');
        setRating(5);
        setShowAddReview(false);
        fetchReviews();
      }
    } catch (err) {
      console.error('Exception while submitting review:', err);
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
        <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <div className="mb-3">
            <label className="text-sm text-slate-300 mb-2 block">Baho</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <label className="text-sm text-slate-300 mb-2 block">Sharh</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tajribangiz haqida yozing..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !comment.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Yuklanmoqda...' : 'Yuborish'}
            </button>
            <button
              onClick={() => {
                setShowAddReview(false);
                setComment('');
                setRating(5);
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Yuklanmoqda...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          Hali sharhlar yo'q. Birinchi bo'lib sharh qoldiring!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">
                      {review.profiles?.full_name || review.profiles?.email?.split('@')[0] || 'Foydalanuvchi'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-slate-300 text-sm mb-2">{review.comment}</p>
                  )}
                  
                  <span className="text-slate-500 text-xs">
                    {new Date(review.created_at || '').toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
