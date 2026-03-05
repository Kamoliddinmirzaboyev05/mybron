import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase, Booking, Profile } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { toDateString } from '../lib/dateUtils';

interface BookingWithPitch extends Omit<Booking, 'pitches'> {
  pitches?: {
    name: string;
    location: string;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayBookings, setTodayBookings] = useState<BookingWithPitch[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingWithPitch[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    checkAdminAccess();
  }, [user, authLoading, navigate]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Xatolik yuz berdi', {
          description: 'Profil ma\'lumotlarini yuklab bo\'lmadi.'
        });
        navigate('/');
        return;
      }

      if (profileData.role !== 'admin') {
        toast.error('Ruxsat yo\'q', {
          description: 'Bu sahifa faqat adminlar uchun.'
        });
        navigate('/');
        return;
      }

      setProfile(profileData);
      fetchDashboardData();
    } catch (err) {
      console.error('Exception checking admin access:', err);
      navigate('/');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayBookings(),
        fetchPendingBookings(),
        fetchTodayRevenue()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayBookings = async () => {
    const today = toDateString(new Date());

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pitches (
            name,
            location
          )
        `)
        .eq('booking_date', today)
        .in('status', ['confirmed', 'manual'])
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching today bookings:', error);
      } else {
        setTodayBookings(data || []);
      }
    } catch (err) {
      console.error('Exception fetching today bookings:', err);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pitches (
            name,
            location
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending bookings:', error);
      } else {
        setPendingBookings(data || []);
      }
    } catch (err) {
      console.error('Exception fetching pending bookings:', err);
    }
  };

  const fetchTodayRevenue = async () => {
    const today = toDateString(new Date());

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('booking_date', today)
        .in('status', ['confirmed', 'manual']);

      if (error) {
        console.error('Error fetching today revenue:', error);
      } else {
        const revenue = data?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
        setTodayRevenue(revenue);
      }
    } catch (err) {
      console.error('Exception fetching today revenue:', err);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    const loadingToast = toast.loading('Tasdiqlanmoqda...');

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error approving booking:', error);
        toast.error('Xatolik yuz berdi', {
          id: loadingToast,
          description: 'Qaytadan urinib ko\'ring.'
        });
      } else {
        toast.success('Bron tasdiqlandi!', {
          id: loadingToast,
          description: 'Foydalanuvchiga xabar yuborildi.'
        });
        // Refresh data
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Exception approving booking:', err);
      toast.error('Xatolik yuz berdi', {
        id: loadingToast,
        description: 'Qaytadan urinib ko\'ring.'
      });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const loadingToast = toast.loading('Rad etilmoqda...');

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error rejecting booking:', error);
        toast.error('Xatolik yuz berdi', {
          id: loadingToast,
          description: 'Qaytadan urinib ko\'ring.'
        });
      } else {
        toast.success('Bron rad etildi', {
          id: loadingToast,
          description: 'Vaqt endi boshqalar uchun ochiq.'
        });
        // Refresh data
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Exception rejecting booking:', err);
      toast.error('Xatolik yuz berdi', {
        id: loadingToast,
        description: 'Qaytadan urinib ko\'ring.'
      });
    }
  };

  const handleWithdraw = () => {
    toast.info('Yaqinda', {
      description: 'Pul yechish funksiyasi tez orada qo\'shiladi.'
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:MM
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const isBookingPast = (booking: BookingWithPitch) => {
    const now = new Date();
    const bookingDate = new Date(booking.booking_date);
    const [hours] = booking.end_time.split(':').map(Number);
    bookingDate.setHours(hours, 0, 0, 0);
    return bookingDate < now;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Bugungi sana: {formatDate(toDateString(new Date()))}</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Finance */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Moliya</h2>

            {/* Today's Revenue */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-sm text-green-300">Bugungi daromad</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {todayRevenue.toLocaleString()} so'm
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm text-blue-300">Jami daromad</div>
              </div>
              <div className="text-3xl font-bold text-white">
                {(profile?.total_revenue || 0).toLocaleString()} so'm
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-sm text-purple-300">Joriy balans</div>
              </div>
              <div className="text-3xl font-bold text-white mb-4">
                {(profile?.balance || 0).toLocaleString()} so'm
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Pul yechish
              </button>
            </div>
          </div>

          {/* Column 2: Today's Schedule */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Bugungi jadval</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-h-[800px] overflow-y-auto">
              {todayBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400">Bugun bronlar yo'q</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayBookings.map((booking) => {
                    const isPast = isBookingPast(booking);
                    return (
                      <div
                        key={booking.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isPast
                            ? 'border-slate-800 bg-slate-800/50 opacity-60'
                            : 'border-blue-500/30 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white mb-1">
                              {booking.pitches?.name || 'Unknown Pitch'}
                            </div>
                            <div className="text-sm text-slate-400">
                              {booking.pitches?.location}
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${isPast ? 'text-slate-500' : 'text-blue-400'}`}>
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-4 h-4" />
                            <span>{booking.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Phone className="w-4 h-4" />
                            <span>{booking.phone ? formatPhoneNumber(booking.phone) : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-400 font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>{(booking.total_price || 0).toLocaleString()} so'm</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Action Center (Pending Bookings) */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Kutilayotgan so'rovlar
              {pendingBookings.length > 0 && (
                <span className="ml-2 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                  {pendingBookings.length}
                </span>
              )}
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-h-[800px] overflow-y-auto">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400">Kutilayotgan so'rovlar yo'q</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4"
                    >
                      <div className="mb-3">
                        <div className="font-semibold text-white mb-1">
                          {booking.pitches?.name || 'Unknown Pitch'}
                        </div>
                        <div className="text-sm text-slate-400 mb-2">
                          {booking.pitches?.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.booking_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-yellow-400 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm mb-4 pb-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-4 h-4" />
                          <span>{booking.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-4 h-4" />
                          <span>{booking.phone ? formatPhoneNumber(booking.phone) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span>{(booking.total_price || 0).toLocaleString()} so'm</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApproveBooking(booking.id)}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                          Rad etish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
