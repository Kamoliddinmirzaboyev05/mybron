import { useEffect, useState } from 'react';
import { supabase, Pitch, isSupabaseConfigured } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import SetupBanner from '../components/SetupBanner';
import PitchCardSlider from '../components/PitchCardSlider';
import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';

export default function Home() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      console.log('Fetching all active pitches...');
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching pitches:', error);
      } else {
        console.log('Pitches data received:', data);
        console.log('Number of pitches:', data?.length);
        if (data && data.length > 0) {
          console.log('First pitch sample:', data[0]);
        }
        setPitches(data || []);
      }
    } catch (err) {
      console.error('Exception while fetching pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 p-1.5">
              <img src="/bronlogo.png" alt="Bron Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Book a Pitch</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Find and book your perfect sports venue</p>
        </div>

        {/* Setup Banner - Show if Supabase is not configured */}
        {!isSupabaseConfigured && <SetupBanner />}

        {/* Pitches List */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-slate-400">Yuklanmoqda...</div>
            </div>
          ) : pitches.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-slate-400">Maydonlar topilmadi</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pitches.map((pitch) => (
                <div
                  key={pitch.id}
                  onClick={() => navigate(`/pitch/${pitch.id}`)}
                  className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-blue-500 transition-all hover:scale-[1.02]"
                >
                  {/* Pitch Image Slider */}
                  <div className="aspect-square bg-slate-800 relative overflow-hidden">
                    <PitchCardSlider images={pitch.images} alt={pitch.name} />
                  </div>

                  {/* Pitch Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{pitch.name}</h3>
                    <div className="flex items-start text-slate-400 text-xs mb-2">
                      <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{pitch.location}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-blue-500">
                        {(pitch.price_per_hour / 1000).toFixed(0)}k
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Batafsil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}