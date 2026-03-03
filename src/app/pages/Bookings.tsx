import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import { Calendar, Clock, X } from 'lucide-react';

export default function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();

    // Real-time subscription
    const channel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Booking change detected:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

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

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error canceling booking:', error);
        alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      } else {
        fetchBookings();
      }
    } catch (err) {
      console.error('Exception while canceling booking:', err);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'history') {
      return bookings.filter(b => b.status === 'rejected');
    }
    return bookings.filter(b => b.status === status);
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
    return `${start} - ${end}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'confirmed':
      case 'manual':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected':
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
      'manual': 'Tasdiqlangan'
    };
    return labels[status] || status;
  };

  const filteredBookings = filterBookings(activeTab);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white">Mening bronlarim</h1>
          <p className="text-slate-400 text-sm mt-1">Maydon bandlovlaringizni kuzating</p>
        </div>

        {/* Tabs */}
        <div className="sticky top-[88px] bg-slate-950 z-10 px-4 py-4 border-b border-slate-800">
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
        <div className="px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-slate-400">Yuklanmoqda...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="w-16 h-16 text-slate-700 mb-4" />
              <div className="text-slate-400 text-center">
                <p className="font-medium mb-1">{activeTab === 'pending' ? 'Kutilayotgan' : activeTab === 'confirmed' ? 'Tasdiqlangan' : 'Tarixiy'} bronlar yo'q</p>
                <p className="text-sm">Sizning bronlaringiz bu yerda ko'rinadi</p>
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
                      <div><span className="text-slate-500">Telefon:</span> {booking.phone || booking.customer_phone || 'N/A'}</div>
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

      <BottomNav />
    </div>
  );
}
