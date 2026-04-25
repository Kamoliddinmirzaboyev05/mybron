import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
  User as UserIcon,
  Phone
} from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { toDateString } from '../lib/dateUtils';
import { api, Booking, User } from '../lib/api';

interface AdminStats {
  todayRevenue: number;
  totalRevenue: number;
  balance: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<AdminStats>({ todayRevenue: 0, totalRevenue: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      navigate('/login');
      return;
    }

    checkAdminAccess();
  }, [authUser, authLoading, navigate]);

  const checkAdminAccess = async () => {
    try {
      const profileData = await api.getProfile();
      
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
      // Fallback: use authUser
      if (authUser?.role !== 'admin') {
        navigate('/');
        return;
      }
      setProfile(authUser);
      fetchDashboardData();
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [allBookings, adminStats] = await Promise.all([
        api.getAllBookings(),
        api.getAdminStats().catch(() => ({ todayRevenue: 0, totalRevenue: 0, balance: 0 }))
      ]);

      const today = toDateString(new Date());
      
      // Filter today's confirmed/manual bookings
      const todayList = allBookings.filter(b => 
        (b.bookingDate?.split('T')[0] === today) && 
        (b.status === 'confirmed' || b.status === 'manual')
      );
      
      // Filter pending bookings
      const pendingList = allBookings.filter(b => b.status === 'pending');

      setTodayBookings(todayList);
      setPendingBookings(pendingList);
      setStats(adminStats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    const loadingToast = toast.loading('Tasdiqlanmoqda...');

    try {
      await api.updateBookingStatus(bookingId, 'confirmed');
      toast.success('Bron tasdiqlandi!', {
        id: loadingToast,
        description: 'Foydalanuvchiga xabar yuborildi.'
      });
      fetchDashboardData();
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
      await api.updateBookingStatus(bookingId, 'rejected');
      toast.success('Bron rad etildi', {
        id: loadingToast,
        description: 'Vaqt endi boshqalar uchun ochiq.'
      });
      fetchDashboardData();
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

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time.slice(0, 5); // HH:MM
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const isBookingPast = (booking: Booking) => {
    const now = new Date();
    const bDate = booking.bookingDate;
    if (!bDate || !booking.endTime) return false;
    
    const bookingDate = new Date(bDate);
    const [hours] = booking.endTime.split(':').map(Number);
    bookingDate.setHours(hours, 0, 0, 0);
    return bookingDate < now;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Admin Dashboard</h1>
            <p className="text-slate-500">Bugungi sana: {formatDate(new Date().toISOString())}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-blue-600/10 border border-blue-500/20">
            <span className="text-blue-400 font-semibold text-sm">{profile?.fullName}</span>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Finance */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Moliya</h2>

            <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-emerald-300 font-medium">Bugungi daromad</span>
              </div>
              <div className="text-3xl font-black text-white">{stats.todayRevenue.toLocaleString()} <span className="text-base font-normal text-slate-500">so'm</span></div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-blue-300 font-medium">Jami daromad</span>
              </div>
              <div className="text-3xl font-black text-white">{stats.totalRevenue.toLocaleString()} <span className="text-base font-normal text-slate-500">so'm</span></div>
            </div>

            <div className="bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-violet-500/20 rounded-xl">
                  <Wallet className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-sm text-violet-300 font-medium">Joriy balans</span>
              </div>
              <div className="text-3xl font-black text-white mb-4">{stats.balance.toLocaleString()} <span className="text-base font-normal text-slate-500">so'm</span></div>
              <button onClick={handleWithdraw} className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-bold transition-colors">
                Pul yechish
              </button>
            </div>
          </div>

          {/* Column 2: Today's Schedule */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Bugungi jadval</h2>
            <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5 max-h-[800px] overflow-y-auto">
              {todayBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">Bugun bronlar yo'q</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map((booking) => {
                    const isPast = isBookingPast(booking);
                    return (
                      <div key={booking.id} className={`border rounded-xl p-4 transition-all ${isPast ? 'border-white/5 bg-white/2 opacity-50' : 'border-blue-500/20 bg-blue-500/5'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-bold text-white text-sm mb-0.5">{booking.field?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{booking.field?.city}</div>
                          </div>
                          <div className={`text-sm font-bold ${isPast ? 'text-slate-600' : 'text-blue-400'}`}>
                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-500"><UserIcon className="w-3.5 h-3.5" />{booking.clientName || 'N/A'}</div>
                          <div className="flex items-center gap-2 text-slate-500"><Phone className="w-3.5 h-3.5" />{booking.clientPhone ? formatPhoneNumber(booking.clientPhone) : 'N/A'}</div>
                          <div className="flex items-center gap-2 text-emerald-400 font-bold"><DollarSign className="w-3.5 h-3.5" />{(booking.totalPrice || 0).toLocaleString()} so'm</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Pending */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              Kutilayotgan so'rovlar
              {pendingBookings.length > 0 && (
                <span className="text-sm bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {pendingBookings.length}
                </span>
              )}
            </h2>
            <div className="bg-[#0d1526] border border-white/5 rounded-2xl p-5 max-h-[800px] overflow-y-auto">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">Kutilayotgan so'rovlar yo'q</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4">
                      <div className="mb-3">
                        <div className="font-bold text-white text-sm mb-0.5">{booking.field?.name || 'N/A'}</div>
                        <div className="text-xs text-slate-500 mb-2">{booking.field?.city}</div>
                        <div className="flex items-center gap-2 text-xs text-amber-400"><Calendar className="w-3.5 h-3.5" />{formatDate(booking.bookingDate)}</div>
                        <div className="flex items-center gap-2 text-xs text-amber-400 mt-1"><Clock className="w-3.5 h-3.5" />{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</div>
                      </div>
                      <div className="space-y-1 text-xs mb-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-slate-500"><UserIcon className="w-3.5 h-3.5" />{booking.clientName || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-slate-500"><Phone className="w-3.5 h-3.5" />{booking.clientPhone ? formatPhoneNumber(booking.clientPhone) : 'N/A'}</div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold"><DollarSign className="w-3.5 h-3.5" />{(booking.totalPrice || 0).toLocaleString()} so'm</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleApproveBooking(booking.id)} className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                          <CheckCircle className="w-4 h-4" /> Tasdiqlash
                        </button>
                        <button onClick={() => handleRejectBooking(booking.id)} className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                          <XCircle className="w-4 h-4" /> Rad etish
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
