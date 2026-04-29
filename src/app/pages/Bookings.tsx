import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { calculateHours } from '../lib/dateUtils';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';
import BookingCardSkeleton from '../components/BookingCardSkeleton';
import { Calendar, Clock, X, MapPin } from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { api, Booking } from '../lib/api';

export default function Bookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');

  useEffect(() => {
    // Auth loading tugaguncha kutish
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [user, navigate, authLoading]);

  const fetchBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Exception while fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm('Bronni bekor qilmoqchimisiz?');
    if (!confirmCancel) {
      return;
    }

    const loadingToast = toast.loading('Bekor qilinmoqda...');

    try {
      await api.cancelBooking(bookingId);
      toast.success('Bron bekor qilindi!', { 
        id: loadingToast,
        description: 'Vaqt endi boshqalar uchun ochiq.'
      });
      fetchBookings();
    } catch (err: any) {
      console.error('Exception while canceling booking:', err);
      toast.error('Xatolik yuz berdi', { 
        id: loadingToast,
        description: err.message || 'Qaytadan urinib ko\'ring.'
      });
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'history') {
      return bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled');
    }
    if (status === 'confirmed') {
      return bookings.filter(b => b.status === 'confirmed' || b.status === 'manual');
    }
    return bookings.filter(b => b.status === status);
  };

  const formatDate = (booking: Booking) => {
    const dateStr = booking.bookingDate;
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (booking: Booking) => {
    if (booking.startTime && booking.endTime) {
      const start = booking.startTime.slice(0, 5);
      const end = booking.endTime.slice(0, 5);
      const hours = calculateHours(booking.startTime, booking.endTime);
      return `${start} - ${end} (${hours} soat)`;
    }
    return 'N/A';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-500',
          border: 'border-amber-500/20',
          label: 'Kutilmoqda'
        };
      case 'confirmed':
      case 'manual':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          border: 'border-emerald-500/20',
          label: 'Tasdiqlangan'
        };
      case 'rejected':
      case 'cancelled':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-500',
          border: 'border-rose-500/20',
          label: status === 'cancelled' ? 'Bekor qilingan' : 'Rad etilgan'
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-500',
          border: 'border-slate-500/20',
          label: status
        };
    }
  };

  const filteredBookings = filterBookings(activeTab);

  return (
    <div className="min-h-screen bg-[#020817] pb-32">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#020817]/80 backdrop-blur-xl z-30 px-6 pt-12 pb-6 border-b border-white/5">
            <h1 className="text-2xl font-black text-white tracking-tight">Mening bronlarim</h1>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider">Bandlovlaringiz boshqaruvi</p>
          </div>

          {/* Tabs */}
          <div className="sticky top-[105px] bg-[#020817]/80 backdrop-blur-xl z-20 px-4 py-4 border-b border-white/5">
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
              {[
                { value: 'pending', label: 'Kutilmoqda' },
                { value: 'confirmed', label: 'Tasdiqlangan' },
                { value: 'history', label: 'Tarix' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.value
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-6 border border-blue-600/20 shadow-xl shadow-blue-600/5">
                  <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-white font-black text-lg mb-2">Hozircha bo'sh</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  {activeTab === 'pending' 
                    ? 'Sizda kutilayotgan bronlar mavjud emas. Yangi o\'yin tashkil qiling!' 
                    : activeTab === 'confirmed' 
                    ? 'Tasdiqlangan bronlar topilmadi.' 
                    : 'Sizning bron tarixingiz hozircha bo\'sh.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                  Maydonlarni ko'rish
                </button>
              </div>
            ) : (
              filteredBookings.map((booking, index) => {
                const styles = getStatusStyles(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="group bg-[#0d1526]/50 rounded-[32px] overflow-hidden border border-white/5 shadow-sm hover:border-white/10 transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-5">
                      {/* Top Info */}
                      <div className="flex gap-4 mb-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 bg-white/5">
                          {booking.field?.images?.[0] ? (
                            <img 
                              src={booking.field.images[0]} 
                              alt={booking.field.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600/10">
                              <MapPin className="w-6 h-6 text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="text-base font-black text-white truncate tracking-tight">
                              {booking.field?.name || 'Noma\'lum maydon'}
                            </h3>
                          </div>
                          <div className={`inline-flex w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles.bg} ${styles.text} ${styles.border}`}>
                            {styles.label}
                          </div>
                          <div className="flex items-center text-slate-500 text-[11px] font-bold mt-2 gap-1 uppercase tracking-tight">
                            <MapPin className="w-3 h-3 text-blue-500/50" />
                            <span className="truncate">{booking.field?.address || 'Manzil kiritilmagan'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</span>
                          </div>
                          <div className="text-white text-xs font-black">{formatDate(booking)}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vaqt</span>
                          </div>
                          <div className="text-white text-xs font-black">{formatTime(booking)}</div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-600/10 flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Jami to'lov</div>
                          <div className="text-emerald-400 font-black text-lg tracking-tight">
                            {booking.totalPrice.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">so'm</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">To'lov turi</div>
                          <div className="text-white text-[11px] font-black uppercase tracking-wider">
                            {booking.paymentMethod === 'cash' ? 'Naqd to\'lov' : (booking.paymentMethod || 'N/A')}
                          </div>
                        </div>
                      </div>

                      {booking.note && (
                        <div className="mb-4 p-3 bg-white/5 rounded-xl border-l-2 border-blue-600/30">
                          <p className="text-[11px] text-slate-400 font-medium italic">"{booking.note}"</p>
                        </div>
                      )}

                      {/* Action */}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-rose-500/20 active:scale-[0.98]"
                        >
                          <X className="w-4 h-4" />
                          Bronni bekor qilish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
