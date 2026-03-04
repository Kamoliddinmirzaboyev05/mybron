import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import NotificationSkeleton from '../components/NotificationSkeleton';
import { Bell, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth loading tugaguncha kutish
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    // Simulate loading notifications
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [user, navigate, authLoading]);

  // Mock notifications - in production, these would come from a database
  const notifications = [
    {
      id: 1,
      type: 'confirmed',
      title: 'Booking Confirmed!',
      message: 'Your booking for City Sports Complex on Mar 5, 2026 at 18:00 has been confirmed.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'pending',
      title: 'Booking Pending',
      message: 'Your booking request for Elite Arena is waiting for admin approval.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'rejected',
      title: 'Booking Rejected',
      message: 'Unfortunately, your booking request for Mar 4, 2026 at 20:00 was rejected. The slot is no longer available.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'confirmed',
      title: 'Payment Reminder',
      message: 'Don\'t forget to bring payment for your upcoming booking at Stadium Pro.',
      time: '2 days ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-400">Yuklanmoqda...</div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800 animate-fadeInUp">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Stay updated on your bookings</p>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-800 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </>
          ) : (
            notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-4 hover:bg-slate-900/50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-slate-900/30' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <span className="text-slate-500 text-xs">{notification.time}</span>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Bell className="w-16 h-16 text-slate-700 mb-4" />
            <div className="text-slate-400 text-center">
              <p className="font-medium mb-1">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          </div>
        )}
      </div>
      )}

      <BottomNav />
    </div>
  );
}
