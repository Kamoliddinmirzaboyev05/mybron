import { useState } from 'react';
import { MapPin, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Pitch } from '../lib/supabase';
import PitchCardSlider from './PitchCardSlider';

interface EnhancedPitchCardProps {
  pitch: Pitch;
  isFavorite: boolean;
  onFavoriteToggle: (pitchId: string) => void;
  distance?: number;
  rating?: number;
}

export default function EnhancedPitchCard({ 
  pitch, 
  isFavorite, 
  onFavoriteToggle,
  distance,
  rating
}: EnhancedPitchCardProps) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onFavoriteToggle(pitch.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      onClick={() => navigate(`/pitch/${pitch.id}`)}
      className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-blue-500 transition-all hover:scale-[1.02]"
    >
      {/* Pitch Image Slider with Favorite Button */}
      <div className="aspect-square bg-slate-800 relative overflow-hidden">
        <PitchCardSlider images={pitch.images} alt={pitch.name} />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
            isFavorite 
              ? 'bg-red-500/90 text-white' 
              : 'bg-black/40 text-white hover:bg-black/60'
          } ${isAnimating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
          />
        </button>

        {/* Rating Badge - only show if rating exists */}
        {rating !== undefined && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Distance Badge */}
        {distance && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-white text-xs font-semibold">{distance.toFixed(1)} km</span>
          </div>
        )}
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
  );
}
