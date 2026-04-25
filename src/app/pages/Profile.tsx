import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { api, User } from '../lib/api';
import {
  Phone, Mail, LogOut, ChevronRight,
  User as UserIcon, MessageSquare, Shield,
  Bell, Globe, HelpCircle, FileText, Lock,
  Download
} from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { requestNotificationPermission, getNotificationPermission } from '../lib/notifications';

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, signOut, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) { navigate('/login'); return; }
    setUser(authUser);
  }, [authUser, authLoading, navigate]);

  const handleSignOut = async () => {
    if (confirm('Chiqishga ishonchingiz komilmi?')) {
      await signOut();
      navigate('/login');
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setPwaInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user.fullName || 'Foydalanuvchi';
  const displayLogin = user.login || '';
  const displayPhone = user.phone
    ? (user.phone.startsWith('+998') ? formatPhoneNumber(user.phone) : user.phone)
    : 'Kiritilmagan';

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#020817] pb-24">
      <div className="max-w-md mx-auto">

        {/* ── Header ── */}
        <div className="px-4 pt-14 pb-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border border-white/10">
                <span className="text-white text-xl font-black">{initials}</span>
              </div>
              {user.role === 'admin' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-md flex items-center justify-center border-2 border-[#020817]">
                  <Shield className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white truncate">{displayName}</h1>
              <p className="text-slate-500 text-sm">@{displayLogin}</p>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded text-amber-400 text-[10px] font-bold uppercase tracking-wide">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-colors border border-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Info cards row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0d1526] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Login</span>
              </div>
              <p className="text-white text-sm font-semibold truncate">{displayLogin}</p>
            </div>
            <div className="bg-[#0d1526] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Telefon</span>
              </div>
              <p className="text-white text-sm font-semibold truncate">{displayPhone}</p>
            </div>
          </div>
        </div>

        {/* ── PWA Install Banner ── */}
        {!pwaInstalled && (deferredPrompt || true) && (
          <div className="mx-4 mb-4">
            <button
              onClick={handleInstallPWA}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/15 border border-blue-500/25 rounded-xl hover:border-blue-500/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/30 transition-colors">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-bold">Ilovani yuklab olish</p>
                <p className="text-slate-500 text-xs mt-0.5">Telefonga o'rnatib, tezroq ishlating</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        )}

        {/* ── Menu sections ── */}
        <div className="px-4 space-y-3">

          {/* Account */}
          <Section title="Hisob">
            <MenuItem
              icon={<MessageSquare className="w-4 h-4 text-blue-400" />}
              iconBg="bg-blue-500/15"
              label="Mening sharhlarim"
              onClick={() => navigate('/my-reviews')}
            />
            {user.role === 'admin' && (
              <MenuItem
                icon={<Shield className="w-4 h-4 text-amber-400" />}
                iconBg="bg-amber-500/15"
                label="Admin Dashboard"
                sub="Boshqaruv paneli"
                onClick={() => navigate('/admin')}
                accent
              />
            )}
          </Section>

          {/* Notifications */}
          <Section title="Bildirishnomalar">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Push bildirishnomalar</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {notifPermission === 'granted' ? 'Yoqilgan' : notifPermission === 'denied' ? 'Bloklangan' : 'O\'chirilgan'}
                  </p>
                </div>
              </div>
              {notifPermission === 'granted' ? (
                <span className="px-2 py-0.5 bg-green-500/15 border border-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase">Faol</span>
              ) : notifPermission === 'denied' ? (
                <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">Bloklangan</span>
              ) : (
                <button
                  onClick={handleEnableNotifications}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Yoqish
                </button>
              )}
            </div>
          </Section>

          {/* App */}
          <Section title="Ilova">
            <MenuItem
              icon={<Globe className="w-4 h-4 text-emerald-400" />}
              iconBg="bg-emerald-500/15"
              label="Til"
              right={<span className="text-slate-500 text-xs">O'zbekcha</span>}
            />
          </Section>

          {/* Help */}
          <Section title="Yordam">
            <MenuItem icon={<HelpCircle className="w-4 h-4 text-slate-400" />} iconBg="bg-white/5" label="Yordam markazi" />
            <MenuItem icon={<FileText className="w-4 h-4 text-slate-400" />} iconBg="bg-white/5" label="Foydalanish shartlari" />
            <MenuItem icon={<Lock className="w-4 h-4 text-slate-400" />} iconBg="bg-white/5" label="Maxfiylik siyosati" />
          </Section>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500/15 text-red-400 font-bold text-sm rounded-lg border border-red-500/15 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Tizimdan chiqish
          </button>

          <p className="text-center text-slate-700 text-xs pb-2">MYBRON v1.0.0</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1526] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{title}</span>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function MenuItem({
  icon, iconBg, label, sub, right, onClick, accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  accent?: boolean;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
        onClick ? 'hover:bg-white/3 cursor-pointer' : ''
      } ${accent ? 'bg-amber-500/5' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="text-left">
          <p className={`text-sm font-medium ${accent ? 'text-amber-300' : 'text-white'}`}>{label}</p>
          {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
        </div>
      </div>
      {right ?? (onClick && <ChevronRight className="w-4 h-4 text-slate-700" />)}
    </Tag>
  );
}
