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
import { api } from '../lib/api';

// Types
interface Field {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  pricePerHour: number;
  size: string;
  surface: string;
  description: string;
  amenities: string[];
  images: string[];
  openTime: string;
  closeTime: string;
  phone: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fieldRatings, setFieldRatings] = useState<Map<string, number>>(new Map());
  const [fieldDistances, setFieldDistances] = useState<Map<string, number>>(new Map());
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFields();
    fetchStatistics();
    getUserLocationData();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [fields, searchQuery, activeFilter, fieldDistances, userLocation]);

  const getUserLocationData = async () => {
    const location = await getUserLocation();
    if (location) {
      setUserLocation(location);
      console.log('User location obtained:', location);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await api.getFields();
      setFields(response);

      // Calculate distances if user location is available
      if (userLocation && response) {
        calculateFieldDistances(response, userLocation);
      }

      // Set mock ratings
      setFieldRatings(new Map(response.map(field => [field.id, field.rating || 0])));

      // Set mock statistics
      setTotalUsers(1500);
      setAverageRating(4.3);
    } catch (err) {
      console.error('Exception while fetching fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFieldDistances = (fieldList: Field[], location: Coordinates) => {
    const distances = new Map<string, number>();
    fieldList.forEach(field => {
      if (field.lat && field.lng) {
        const distance = calculateDistance(location, {
          latitude: field.lat,
          longitude: field.lng
        });
        distances.set(field.id, distance);
      }
    });
    setFieldDistances(distances);
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

  const handleFavoriteToggle = async (fieldId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorited = favorites.has(fieldId);

    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(fieldId);
    } else {
      newFavorites.add(fieldId);
    }
    setFavorites(newFavorites);

    // Mock API call
    console.log('Favorite toggle:', fieldId, isFavorited ? 'remove' : 'add');
  };

  const applyFilters = () => {
    let filtered = [...fields];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        field =>
          field.name.toLowerCase().includes(query) ||
          field.address.toLowerCase().includes(query) ||
          field.city.toLowerCase().includes(query)
      );
    }

    // Quick filters
    if (activeFilter === 'cheap') {
      filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (activeFilter === 'shower') {
      filtered = filtered.filter(field =>
        field.amenities?.some(a => a.toLowerCase().includes('dush'))
      );
    } else if (activeFilter === '24/7') {
      filtered = filtered.filter(field => {
        const start = parseInt(field.openTime?.split(':')[0] || '0');
        const end = parseInt(field.closeTime?.split(':')[0] || '0');
        return start === 0 && end === 24;
      });
    } else if (activeFilter === 'nearby') {
      // Sort by distance (closest first)
      if (userLocation && fieldDistances.size > 0) {
        filtered.sort((a, b) => {
          const distA = fieldDistances.get(a.id) || Infinity;
          const distB = fieldDistances.get(b.id) || Infinity;
          return distA - distB;
        });
      }
    }

    setFilteredFields(filtered);
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
            {/* Total Fields */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {fields.length}+
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

        {/* Fields List */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <PitchCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredFields.length === 0 ? (
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
              {filteredFields.map((field) => (
                <EnhancedPitchCard
                  key={field.id}
                  pitch={field}
                  isFavorite={favorites.has(field.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  distance={fieldDistances.get(field.id)}
                  rating={fieldRatings.get(field.id)}
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