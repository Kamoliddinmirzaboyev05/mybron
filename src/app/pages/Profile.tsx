import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useAuth } from '../lib/AuthContext';
import { supabase, Profile as ProfileType } from '../lib/supabase';
import { User, Phone, Mail, Moon, Sun, LogOut, ChevronRight } from 'lucide-react';
import { formatPhoneNumber } from '../lib/phoneFormatter';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth loading tugaguncha kutish
    if (authLoading) {
      return;
    }

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception while fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const displayPhone = profile?.phone 
    ? (profile.phone.startsWith('+998') ? formatPhoneNumber(profile.phone) : profile.phone)
    : 'Kiritilmagan';
  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-slate-950 pb-20 opacity-0 animate-fadeIn">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 p-4">
              <img src="/bronlogo.png" alt="Bron Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-slate-400 text-sm">Member since {memberSince}</p>
          </div>

          {/* Account Info */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Account Information
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="px-4 py-4 flex items-center">
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="text-white">{displayEmail}</div>
                </div>
              </div>
              <div className="px-4 py-4 flex items-center">
                <Phone className="w-5 h-5 text-slate-400 mr-3" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-1">Telefon</div>
                  <div className="text-white">{displayPhone}</div>
                </div>
              </div>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors border-t border-blue-500/30 bg-blue-500/10"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Admin Dashboard</div>
                      <div className="text-xs text-blue-400">Boshqaruv paneli</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </button>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Preferences
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-slate-400 mr-3" />
                  ) : (
                    <Sun className="w-5 h-5 text-slate-400 mr-3" />
                  )}
                  <div>
                    <div className="text-white">Dark Mode</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {darkMode ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="text-white">Language</div>
                <div className="flex items-center text-slate-400">
                  <span className="mr-2">English</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
              
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="text-white">Notifications</div>
                <div className="flex items-center text-slate-400">
                  <span className="mr-2">All</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Help & Support
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="text-white">Help Center</div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="text-white">Terms of Service</div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
              <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="text-white">Privacy Policy</div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl font-semibold transition-colors border border-red-500/30 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* Version */}
          <div className="text-center text-slate-600 text-xs mt-6">
            Version 1.0.0
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
