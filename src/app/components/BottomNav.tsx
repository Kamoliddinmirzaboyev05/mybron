import { useEffect, useState } from 'react';
import { Home, Calendar, Bell, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getUnreadCount } from '../lib/notifications';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(getUnreadCount());

  useEffect(() => {
    const update = () => setUnread(getUnreadCount());
    window.addEventListener('mybron_notif_update', update);
    return () => window.removeEventListener('mybron_notif_update', update);
  }, []);

  const tabs = [
    { name: 'Asosiy', icon: Home, path: '/' },
    { name: 'Bronlar', icon: Calendar, path: '/bookings' },
    { name: 'Xabarlar', icon: Bell, path: '/notifications', badge: unread },
    { name: 'Profil', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#020817]/80 backdrop-blur-xl border-t border-white/5" />
      <div className="relative max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative"
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute top-2 w-6 h-0.5 rounded-sm bg-blue-500" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all ${
                    active ? 'text-blue-400 scale-110' : 'text-slate-500'
                  }`}
                />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded flex items-center justify-center leading-none">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-blue-400' : 'text-slate-600'
                }`}
              >
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area for iPhone */}
      <div className="h-safe-area-inset-bottom bg-[#020817]/80" />
    </div>
  );
}
