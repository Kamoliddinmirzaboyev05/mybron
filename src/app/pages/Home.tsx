import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import EnhancedPitchCard from '../components/EnhancedPitchCard';
import PitchCardSkeleton from '../components/PitchCardSkeleton';
import SearchBar from '../components/SearchBar';
import QuickFilters from '../components/QuickFilters';
import { useNavigate } from 'react-router';
import { getUserLocation, calculateDistance, Coordinates } from '../lib/geoUtils';
import { MapPin, Users, Star, Zap, Download, X } from 'lucide-react';
import { api, Pitch } from '../lib/api';
import { toast } from 'sonner';

export default function Home() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Pitch[]>([]);
  const [filteredFields, setFilteredFields] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fieldDistances, setFieldDistances] = useState<Map<string, number>>(new Map());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const navigate = useNavigate();

  // PWA install prompt
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (isStandalone || dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show banner even without prompt (iOS Safari)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS && !dismissed) setShowInstallBanner(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    fetchFields();
    getUserLocation().then(loc => { if (loc) setUserLocation(loc); });
    
    // SEO Initial
    document.title = 'MYBRON - Futbol Maydonlarini Band Qilish Tizimi';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "O'zbekistondagi futbol maydonlarini onlayn band qilishning eng oson va tezkor yo'li. Maydonlar ro'yxati, narxlari va mavjud vaqtlari.");
    }
  }, []);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  useEffect(() => { applyFilters(); }, [fields, searchQuery, activeFilter, fieldDistances]);

  useEffect(() => {
    if (userLocation && fields.length) {
      const distances = new Map<string, number>();
      fields.forEach(f => {
        if (f.lat && f.lng)
          distances.set(f.id, calculateDistance(userLocation, { latitude: f.lat, longitude: f.lng }));
      });
      setFieldDistances(distances);
    }
  }, [userLocation, fields]);

  const fetchFields = async () => {
    try {
      const response = await api.getFields();
      setFields(response);
    } catch (err) {
      console.error(err);
      toast.error('Maydonlarni yuklashda xatolik', {
        description: 'Server bilan bog\'lanib bo\'lmadi'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.getFavorites();
      setFavorites(new Set(res.map(f => f.fieldId)));
    } catch {}
  };

  const handleFavoriteToggle = async (fieldId: string) => {
    if (!user) { navigate('/login'); return; }
    const isFav = favorites.has(fieldId);
    const next = new Set(favorites);
    isFav ? next.delete(fieldId) : next.add(fieldId);
    setFavorites(next);
    try {
      isFav ? await api.removeFavorite(fieldId) : await api.addFavorite(fieldId);
    } catch {
      setFavorites(favorites);
      toast.error('Xatolik yuz berdi');
    }
  };

  const applyFilters = () => {
    let filtered = [...fields];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'cheap') filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    else if (activeFilter === 'shower') filtered = filtered.filter(f => f.amenities?.some(a => a.toLowerCase().includes('dush')));
    else if (activeFilter === '24/7') filtered = filtered.filter(f => parseInt(f.openTime) === 0 && parseInt(f.closeTime) >= 23);
    else if (activeFilter === 'nearby' && fieldDistances.size > 0)
      filtered.sort((a, b) => (fieldDistances.get(a.id) || Infinity) - (fieldDistances.get(b.id) || Infinity));
    setFilteredFields(filtered);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  const getUserName = () => user?.fullName?.split(' ')[0] || 'Mehmon';
  const avgRating = fields.length
    ? (fields.reduce((s, f) => s + (f.rating || 0), 0) / fields.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen bg-[#020817] pb-24">
      <div className="max-w-md mx-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-[#020817]/95 backdrop-blur-md z-10 border-b border-white/5">
          <div className="px-4 pt-12 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 p-1.5 border border-white/10 flex-shrink-0">
                  <img src="/bronlogo.png" alt="MYBRON" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white leading-tight">
                    Salom, {getUserName()} 👋
                  </h1>
                  <p className="text-slate-500 text-xs">Bugun qayerda o'ynaymiz?</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-semibold">Ochiq</span>
              </div>
            </div>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <QuickFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* ── PWA Install Banner ── */}
        {showInstallBanner && (
          <div className="mx-4 mt-4">
            <div className="flex items-center gap-3 p-3.5 bg-[#0d1526] border border-blue-500/20 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold">Ilovani yuklab olish</p>
                <p className="text-slate-500 text-xs">Telefonga o'rnatib tezroq ishlating</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstallPWA}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  O'rnatish
                </button>
                <button onClick={dismissBanner} className="p-1 text-slate-600 hover:text-slate-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={<MapPin className="w-4 h-4 text-blue-400" />}
              value={String(fields.length)}
              label="Maydonlar"
              from="from-blue-600/15" border="border-blue-500/15"
            />
            <StatCard
              icon={<Users className="w-4 h-4 text-emerald-400" />}
              value="1.5k"
              label="Foydalanuvchi"
              from="from-emerald-600/15" border="border-emerald-500/15"
            />
            <StatCard
              icon={<Star className="w-4 h-4 text-amber-400" />}
              value={avgRating}
              label="O'rtacha"
              from="from-amber-600/15" border="border-amber-500/15"
            />
          </div>
        </div>

        {/* ── Section title ── */}
        <div className="px-4 mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              {activeFilter || searchQuery ? 'Natijalar' : 'Barcha maydonlar'}
            </h2>
            {!loading && (
              <p className="text-xs text-slate-600 mt-0.5">{filteredFields.length} ta topildi</p>
            )}
          </div>
          {(searchQuery || activeFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter(null); }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* ── Fields Grid ── */}
        <div className="px-4 pb-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <PitchCardSkeleton key={i} />)}
            </div>
          ) : filteredFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/8">
                <Zap className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Maydon topilmadi</p>
              <p className="text-slate-500 text-xs">Boshqa kalit so'z yoki filtr sinab ko'ring</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredFields.map((field) => (
                <EnhancedPitchCard
                  key={field.id}
                  pitch={field}
                  isFavorite={favorites.has(field.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  distance={fieldDistances.get(field.id)}
                  rating={field.rating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, value, label, from, border }: {
  icon: React.ReactNode; value: string; label: string; from: string; border: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${from} to-transparent border ${border} p-3`}>
      <div className="mb-2">{icon}</div>
      <div className="text-xl font-black text-white leading-none">{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{label}</div>
    </div>
  );
}
