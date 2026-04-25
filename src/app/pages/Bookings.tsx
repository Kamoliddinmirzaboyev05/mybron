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
    if (!user) return;

    try {
      const data = await api.getBookings(user.id);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'confirmed':
      case 'manual':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Kutilmoqda',
      'confirmed': 'Tasdiqlangan',
      'rejected': 'Rad etilgan',
      'cancelled': 'Bekor qilingan',
      'manual': 'Tasdiqlangan'
    };
    return labels[status] || status;
  };

  const filteredBookings = filterBookings(activeTab);

  return (
    <div className="min-h-screen bg-[#020817] pb-20">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
        <div className="sticky top-0 bg-[#020817]/95 backdrop-blur-md z-10 px-4 pt-12 pb-4 border-b border-white/5 animate-fadeInUp">
          <h1 className="text-2xl font-black text-white">Mening bronlarim</h1>
          <p className="text-slate-500 text-sm mt-0.5">Maydon bandlovlaringizni kuzating</p>
        </div>

        <div className="sticky top-[88px] bg-[#020817]/95 backdrop-blur-md z-10 px-4 py-3 border-b border-white/5 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg">
            {[
              { value: 'pending', label: 'Kutilmoqda' },
              { value: 'confirmed', label: 'Tasdiqlangan' },
              { value: 'history', label: 'Tarix' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 space-y-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-4 border border-white/8">
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">
                {activeTab === 'pending' ? 'Kutilayotgan' : activeTab === 'confirmed' ? 'Tasdiqlangan' : 'Tarixiy'} bronlar yo'q
              </p>
              <p className="text-slate-500 text-xs text-center mb-4">
                {bookings.length === 0 ? 'Hali hech qanday bron qilmagansiz' : 'Bu bo\'limda bronlar yo\'q'}
              </p>
              {bookings.length === 0 && (
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Maydonlarni ko'rish
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-[#0d1526] rounded-lg overflow-hidden border border-white/5"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">
                      {booking.field?.name || 'Noma\'lum maydon'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center text-slate-500 text-xs gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{booking.field?.address}, {booking.field?.city}</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-xs gap-2">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDate(booking)}</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-xs gap-2">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatTime(booking)}</span>
                    </div>
                  </div>

                  <div className="bg-white/3 rounded-md p-3 mb-3 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-xs">
                        {booking.paymentMethod === 'cash' ? 'Naqd to\'lov' : (booking.paymentMethod || 'N/A')}
                      </span>
                      <span className="text-green-400 font-black text-sm">
                        {booking.totalPrice.toLocaleString()} so'm
                      </span>
                    </div>
                    {booking.note && (
                      <p className="mt-1.5 text-xs text-slate-600 italic">{booking.note}</p>
                    )}
                  </div>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15 text-red-400 py-2 rounded-md text-xs font-semibold transition-colors border border-red-500/15"
                    >
                      <X className="w-3.5 h-3.5" />
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      <BottomNav />
    </div>
  );
}
