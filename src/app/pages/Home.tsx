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

export default function Home() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pitchRatings, setPitchRatings] = useState<Map<string, number>>(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    fetchPitches();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [pitches, searchQuery, activeFilter]);

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
      }
    } catch (err) {
      console.error('Exception while fetching pitches:', err);
    } finally {
      setLoading(false);
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
                    distance={pitch.latitude && pitch.longitude ? Math.random() * 5 + 0.5 : undefined}
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