import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import EnhancedPitchCard from '../components/EnhancedPitchCard';
import PitchCardSkeleton from '../components/PitchCardSkeleton';
import SearchBar from '../components/SearchBar';
import QuickFilters from '../components/QuickFilters';
import { useNavigate } from 'react-router';
import { getUserLocation, calculateDistance, formatDistance, Coordinates } from '../lib/geoUtils';
import { MapPin, Users, Star } from 'lucide-react';

// Types
interface Pitch {
  id: string;
  name: string;
  price_per_hour: number;
  location: string;
  landmark?: string;
  start_time: string;
  end_time: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  amenities?: string[];
  is_active: boolean;
  owner_id?: string;
  created_at?: string;
}

export default function Home() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pitchRatings, setPitchRatings] = useState<Map<string, number>>(new Map());
  const [pitchDistances, setPitchDistances] = useState<Map<string, number>>(new Map());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPitches();
    fetchStatistics();
    getUserLocationData();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [pitches, searchQuery, activeFilter, pitchDistances, userLocation]);

  const getUserLocationData = async () => {
    const location = await getUserLocation();
    if (location) {
      setUserLocation(location);
      console.log('User location obtained:', location);
    }
  };

  const fetchPitches = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPitches: Pitch[] = [
        {
          id: '1',
          name: 'Sport Arena',
          price_per_hour: 150000,
          location: 'Toshkent, Chilonzor',
          landmark: 'Chilonzor metro',
          start_time: '08:00:00',
          end_time: '22:00:00',
          latitude: 41.2995,
          longitude: 69.2401,
          images: ['/pitch1.jpg'],
          amenities: ['Dush', 'Wi-Fi'],
          is_active: true,
          owner_id: 'owner1',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Football Field',
          price_per_hour: 120000,
          location: 'Toshkent, Yunusobod',
          landmark: 'Yunusobod metro',
          start_time: '06:00:00',
          end_time: '24:00:00',
          latitude: 41.3111,
          longitude: 69.2797,
          images: ['/pitch2.jpg'],
          amenities: ['Dush', 'Parkovka'],
          is_active: true,
          owner_id: 'owner2',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      setPitches(mockPitches);
      
      // Calculate distances if user location is available
      if (userLocation && mockPitches) {
        calculatePitchDistances(mockPitches, userLocation);
      }
      
      // Set mock ratings
      setPitchRatings(new Map([
        ['1', 4.5],
        ['2', 4.2]
      ]));
      
      // Set mock statistics
      setTotalUsers(1500);
      setAverageRating(4.3);
    } catch (err) {
      console.error('Exception while fetching pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePitchDistances = (pitchList: Pitch[], location: Coordinates) => {
    const distances = new Map<string, number>();
    pitchList.forEach(pitch => {
      if (pitch.latitude && pitch.longitude) {
        const distance = calculateDistance(location, {
          latitude: pitch.latitude,
          longitude: pitch.longitude
        });
        distances.set(pitch.id, distance);
      }
    });
    setPitchDistances(distances);
  };

  const fetchStatistics = async () => {
    // Mock statistics
    setTotalUsers(1500);
    setAverageRating(4.3);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    // Mock favorites
    setFavorites(new Set(['1']));
  };

  const handleFavoriteToggle = async (pitchId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorited = favorites.has(pitchId);

    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(pitchId);
    } else {
      newFavorites.add(pitchId);
    }
    setFavorites(newFavorites);

    // Mock API call
    console.log('Favorite toggle:', pitchId, isFavorited ? 'remove' : 'add');
  };

  const applyFilters = () => {
    let filtered = [...pitches];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        pitch =>
          pitch.name.toLowerCase().includes(query) ||
          pitch.location.toLowerCase().includes(query)
      );
    }

    // Quick filters
    if (activeFilter === 'cheap') {
      filtered.sort((a, b) => a.price_per_hour - b.price_per_hour);
    } else if (activeFilter === 'shower') {
      filtered = filtered.filter(pitch =>
        pitch.amenities?.some(a => a.toLowerCase().includes('dush'))
      );
    } else if (activeFilter === '24/7') {
      filtered = filtered.filter(pitch => {
        const start = parseInt(pitch.start_time?.split(':')[0] || '0');
        const end = parseInt(pitch.end_time?.split(':')[0] || '0');
        return start === 0 && end === 24;
      });
    } else if (activeFilter === 'nearby') {
      // Sort by distance (closest first)
      if (userLocation && pitchDistances.size > 0) {
        filtered.sort((a, b) => {
          const distA = pitchDistances.get(a.id) || Infinity;
          const distB = pitchDistances.get(b.id) || Infinity;
          return distA - distB;
        });
      }
    }

    setFilteredPitches(filtered);
  };

  const getUserName = () => {
    if (!user) return 'Mehmon';
    return user.fullName || user.login || 'Foydalanuvchi';
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header with Dynamic Greeting */}
        <div className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 p-1.5">
                  <img src="/bronlogo.png" alt="Bron Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Salom, {getUserName()}!</h1>
                  <p className="text-slate-400 text-sm">Bugun qayerda o'ynaymiz?</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Quick Filters */}
          <QuickFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Statistics Bar - Social Proof */}
        <div className="px-4 py-6 border-b border-slate-800">
          <div className="grid grid-cols-3 gap-4">
            {/* Total Pitches */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {pitches.length}+
              </div>
              <div className="text-xs text-slate-400">Maydonlar</div>
            </div>

            {/* Total Users */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {totalUsers}+
              </div>
              <div className="text-xs text-slate-400">Foydalanuvchilar</div>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
              </div>
              <div className="text-xs text-slate-400">O'rtacha reyting</div>
            </div>
          </div>
        </div>

        {/* Pitches List */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <PitchCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPitches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-slate-400 mb-2">Maydonlar topilmadi</div>
              {(searchQuery || activeFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter(null);
                  }}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredPitches.map((pitch) => (
                <EnhancedPitchCard
                  key={pitch.id}
                  pitch={pitch}
                  isFavorite={favorites.has(pitch.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  distance={pitchDistances.get(pitch.id)}
                  rating={pitchRatings.get(pitch.id)}
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