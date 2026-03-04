import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateHours } from '../lib/dateUtils';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';
import BookingCardSkeleton from '../components/BookingCardSkeleton';
import { Calendar, Clock, X } from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';

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

    // Real-time subscription - faqat shu foydalanuvchining bronlari uchun
    const channel = supabase
      .channel('user_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Booking change detected for user:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, authLoading]);

  const fetchBookings = async () => {
    if (!user) return;

    console.log('Fetching bookings for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pitches (
            name,
            location,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        console.log('Fetched bookings:', data);
        console.log('Total bookings count:', data?.length || 0);
        setBookings(data || []);
      }
    } catch (err) {
      console.error('Exception while fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bronni bekor qilmoqchimisiz?')) {
      return;
    }

    const loadingToast = toast.loading('Bekor qilinmoqda...');

    try {
      // Update status to 'cancelled'
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id); // Only cancel own bookings

      if (error) {
        console.error('Error canceling booking:', error);
        toast.error('Xatolik yuz berdi', { 
          id: loadingToast,
          description: 'Qaytadan urinib ko\'ring.'
        });
      } else {
        toast.success('Bron bekor qilindi!', { 
          id: loadingToast,
          description: 'Vaqt endi boshqalar uchun ochiq.'
        });
        // Real-time subscription will auto-update
        console.log('Booking cancelled successfully');
      }
    } catch (err) {
      console.error('Exception while canceling booking:', err);
      toast.error('Xatolik yuz berdi', { 
        id: loadingToast,
        description: 'Qaytadan urinib ko\'ring.'
      });
    }
  };

  const filterBookings = (status: string) => {
    console.log('Filtering bookings by status:', status);
    console.log('All bookings:', bookings);
    
    if (status === 'history') {
      // Tarix: rad etilgan va bekor qilingan bronlar
      const filtered = bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled');
      console.log('History bookings:', filtered);
      return filtered;
    }
    if (status === 'confirmed') {
      // Tasdiqlangan: confirmed va manual statusdagi bronlar
      const filtered = bookings.filter(b => b.status === 'confirmed' || b.status === 'manual');
      console.log('Confirmed bookings:', filtered);
      return filtered;
    }
    // Pending: kutilayotgan bronlar
    const filtered = bookings.filter(b => b.status === status);
    console.log('Pending bookings:', filtered);
    return filtered;
  };

  const formatDate = (booking: Booking) => {
    if (!booking.booking_date) return 'N/A';
    const date = new Date(booking.booking_date);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (startTime: string, endTime: string) => {
    // start_time and end_time are in HH:MM:SS format
    if (!startTime || !endTime) return 'N/A';
    const start = startTime.slice(0, 5); // HH:MM
    const end = endTime.slice(0, 5); // HH:MM
    const hours = calculateHours(startTime, endTime);
    return `${start} - ${end} (${hours} soat)`;
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
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Auth loading holatini ko'rsatish */}
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-400">Yuklanmoqda...</div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800 animate-fadeInUp">
          <h1 className="text-2xl font-bold text-white">Mening bronlarim</h1>
          <p className="text-slate-400 text-sm mt-1">Maydon bandlovlaringizni kuzating</p>
        </div>

        {/* Tabs */}
        <div className="sticky top-[88px] bg-slate-950 z-10 px-4 py-4 border-b border-slate-800 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-2">
            {[
              { value: 'pending', label: 'Kutilmoqda' },
              { value: 'confirmed', label: 'Tasdiqlangan' },
              { value: 'history', label: 'Tarix' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="px-4 py-4 space-y-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="w-16 h-16 text-slate-700 mb-4" />
              <div className="text-slate-400 text-center">
                <p className="font-medium mb-1">
                  {activeTab === 'pending' ? 'Kutilayotgan' : activeTab === 'confirmed' ? 'Tasdiqlangan' : 'Tarixiy'} bronlar yo'q
                </p>
                <p className="text-sm mb-4">
                  {bookings.length === 0 
                    ? 'Hali hech qanday bron qilmagansiz' 
                    : 'Sizning bronlaringiz bu yerda ko\'rinadi'}
                </p>
                {bookings.length === 0 && (
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Maydonlarni ko'rish
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800"
              >
                <div className="p-4">
                  {/* Pitch Name */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {booking.pitches?.name || 'Unknown Pitch'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(booking)}</span>
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(booking.start_time, booking.end_time)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-slate-950 rounded-lg p-3 mb-3">
                    <div className="text-xs text-slate-500 mb-1">Bron ma'lumotlari</div>
                    <div className="text-sm text-slate-300">
                      <div><span className="text-slate-500">Ism:</span> {booking.full_name || booking.customer_name || 'N/A'}</div>
                      <div><span className="text-slate-500">Telefon:</span> {
                        booking.phone || booking.customer_phone 
                          ? formatPhoneNumber(booking.phone || booking.customer_phone || '')
                          : 'N/A'
                      }</div>
                      {booking.total_price && (
                        <div><span className="text-slate-500">Narx:</span> {booking.total_price.toLocaleString()} so'm</div>
                      )}
                    </div>
                  </div>

                  {/* Cancel Button (only for pending) */}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                    >
                      <X className="w-4 h-4" />
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
