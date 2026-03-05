import { useEffect, useState } from 'react';
import { supabase, Pitch, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import BottomNav from '../components/BottomNav';
import SetupBanner from '../components/SetupBanner';
import EnhancedPitchCard from '../components/EnhancedPitchCard';
import PitchCardSkeleton from '../components/PitchCardSkeleton';
import SearchBar from '../components/SearchBar';
import QuickFilters from '../components/QuickFilters';
import { useNavigate } from 'react-router';
import { getUserLocation, calculateDistance, formatDistance, Coordinates } from '../lib/geoUtils';
import { MapPin, Users, Star, TrendingUp } from 'lucide-react';

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
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching pitches:', error);
      } else {
        setPitches(data || []);
        // Fetch ratings for all pitches
        if (data && data.length > 0) {
          fetchPitchRatings(data.map(p => p.id));
        }
        // Calculate distances if user location is available
        if (userLocation && data) {
          calculatePitchDistances(data, userLocation);
        }
      }
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
    try {
      // Fetch total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (!usersError && usersCount !== null) {
        setTotalUsers(usersCount);
      }

      // Fetch average rating
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      if (!reviewsError && reviewsData && reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(avgRating);
      }
    } catch (err) {
      console.error('Exception fetching statistics:', err);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('pitch_id')
        .eq('user_id', user.id);

      if (error) {
        // Ignore PGRST116 (no rows) error - table exists but empty
        if (error.code !== 'PGRST116') {
          console.error('Error fetching favorites:', error);
        }
      } else {
        const favoriteIds = new Set(data?.map(f => f.pitch_id) || []);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error('Exception while fetching favorites:', err);
    }
  };

  const fetchPitchRatings = async (pitchIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('pitch_id, rating')
        .in('pitch_id', pitchIds);

      if (error) {
        // Ignore PGRST116 (no rows) error - table exists but empty
        if (error.code !== 'PGRST116') {
          console.error('Error fetching ratings:', error);
        }
        return;
      }

      // Calculate average ratings per pitch
      const ratingsMap = new Map<string, number>();
      const countsMap = new Map<string, number>();

      data?.forEach((review: any) => {
        const currentSum = ratingsMap.get(review.pitch_id) || 0;
        const currentCount = countsMap.get(review.pitch_id) || 0;
        ratingsMap.set(review.pitch_id, currentSum + review.rating);
        countsMap.set(review.pitch_id, currentCount + 1);
      });

      // Calculate averages
      const averages = new Map<string, number>();
      ratingsMap.forEach((sum, pitchId) => {
        const count = countsMap.get(pitchId) || 1;
        averages.set(pitchId, sum / count);
      });

      setPitchRatings(averages);
    } catch (err) {
      console.error('Exception while fetching ratings:', err);
    }
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

    try {
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pitch_id', pitchId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert({ 
            user_id: user.id, 
            pitch_id: pitchId 
          });

        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      // Revert on error
      setFavorites(favorites);
      
      // Show user-friendly error message
      if (err.code === 'PGRST204' || err.code === '23505') {
        // Duplicate or already exists - just refresh
        fetchFavorites();
      }
    }
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
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Foydalanuvchi';
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

        {/* Setup Banner */}
        {!isSupabaseConfigured && <SetupBanner />}

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