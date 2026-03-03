import { Home, Calendar, Bell, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Bookings', icon: Calendar, path: '/bookings' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
