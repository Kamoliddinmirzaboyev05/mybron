import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import NotificationSkeleton from '../components/NotificationSkeleton';
import {
  Bell, CheckCircle, Clock, XCircle, Trash2, BellOff, BellRing,
} from 'lucide-react';
import {
  getLocalNotifications,
  markAllRead,
  clearNotifications,
  requestNotificationPermission,
  getNotificationPermission,
  LocalNotification,
  notifyBookingConfirmed,
} from '../lib/notifications';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [permission, setPermission] = useState(getNotificationPermission());

  const refresh = () => setNotifications(getLocalNotifications());

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setTimeout(() => { refresh(); setLoading(false); }, 300);
  }, [user, navigate, authLoading]);

  useEffect(() => {
    window.addEventListener('mybron_notif_update', refresh);
    return () => window.removeEventListener('mybron_notif_update', refresh);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      // Demo notification
      await notifyBookingConfirmed('City Sports Complex', '28 Aprel', '18:00 - 20:00');
    }
  };

  const handleMarkAllRead = () => { markAllRead(); refresh(); };
  const handleClear = () => { clearNotifications(); refresh(); };

  const getIcon = (type: LocalNotification['type']) => {
    switch (type) {
      case 'booking_confirmed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'booking_pending':   return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'booking_rejected':  return <XCircle className="w-5 h-5 text-red-400" />;
      default:                  return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBg = (type: LocalNotification['type']) => {
    switch (type) {
      case 'booking_confirmed': return 'bg-green-500/10 border-green-500/20';
      case 'booking_pending':   return 'bg-yellow-500/10 border-yellow-500/20';
      case 'booking_rejected':  return 'bg-red-500/10 border-red-500/20';
      default:                  return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Hozirgina';
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
    return `${Math.floor(diff / 86400)} kun oldin`;
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#020817] pb-20">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#020817]/95 backdrop-blur-md z-10 px-4 pt-12 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-white">Bildirishnomalar</h1>
                {unread > 0 && (
                  <p className="text-sm text-blue-400 mt-0.5">{unread} ta o'qilmagan</p>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Barchasini o'qildi
                    </button>
                  )}
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Permission Banner */}
          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="mx-4 mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <BellRing className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Bildirishnomalarni yoqing</p>
                  <p className="text-slate-400 text-xs mb-3">
                    Bron holati o'zgarganda darhol xabar oling
                  </p>
                  {permission === 'denied' ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BellOff className="w-4 h-4" />
                      <span>Brauzer sozlamalaridan ruxsat bering</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Yoqish
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="px-4 py-4 space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => <NotificationSkeleton key={i} />)
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <Bell className="w-9 h-9 text-slate-600" />
                </div>
                <p className="text-white font-semibold mb-1">Bildirishnomalar yo'q</p>
                <p className="text-slate-500 text-sm">
                  Bron qilganingizda bu yerda ko'rinadi
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.url && navigate(notif.url)}
                  className={`relative flex gap-3 p-4 rounded-lg border cursor-pointer transition-all active:scale-[0.98] ${getBg(notif.type)} ${!notif.read ? 'ring-1 ring-white/8' : 'opacity-70'}`}
                >
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-white/5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm mb-0.5">{notif.title}</p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2">{notif.body}</p>
                    <span className="text-slate-600 text-xs">{formatTime(notif.createdAt)}</span>
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
