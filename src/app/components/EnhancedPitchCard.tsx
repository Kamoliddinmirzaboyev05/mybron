import { useState } from 'react';
import { MapPin, Heart, Star, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import PitchCardSlider from './PitchCardSlider';
import type { Pitch } from '../lib/api';

interface Props {
  pitch: Pitch;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
  distance?: number;
  rating?: number;
}

export default function EnhancedPitchCard({ pitch, isFavorite, onFavoriteToggle, distance, rating }: Props) {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onFavoriteToggle(pitch.id);
    setTimeout(() => setAnimating(false), 300);
  };

  const isOpen = () => {
    const h = new Date().getHours();
    const open = parseInt(pitch.openTime?.split(':')[0] || '0');
    const close = parseInt(pitch.closeTime?.split(':')[0] || '24');
    return h >= open && h < close;
  };

  const formatPrice = () => {
    if (!pitch.pricePerHour || pitch.pricePerHour === 0) {
      return <span className="text-emerald-400 font-black text-sm">Bepul</span>;
    }
    if (pitch.pricePerHour >= 1000) {
      return (
        <>
          <span className="text-blue-400 font-black text-sm">
            {(pitch.pricePerHour / 1000).toFixed(0)}k
          </span>
          <span className="text-slate-700 text-[9px] ml-0.5">/soat</span>
        </>
      );
    }
    return (
      <>
        <span className="text-blue-400 font-black text-sm">
          {pitch.pricePerHour.toLocaleString()}
        </span>
        <span className="text-slate-700 text-[9px] ml-0.5">/soat</span>
      </>
    );
  };

  const displayCity = pitch.city && pitch.city !== 'Shahar kiritilmagan' ? pitch.city : null;
  const displayAddress = pitch.address && pitch.address !== 'Manzil kiritilmagan' ? pitch.address : null;
  const locationText = displayCity || displayAddress || 'Manzil ko\'rsatilmagan';

  return (
    <div
      onClick={() => navigate(`/pitch/${pitch.id}`)}
      className="group bg-[#0d1526] rounded-xl overflow-hidden border border-white/5 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-[#111827] relative overflow-hidden">
        <PitchCardSlider images={pitch.images} alt={pitch.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Favorite */}
        <button
          onClick={handleFav}
          className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-sm transition-all z-10 ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-black/50 text-white/70 hover:bg-black/70'
          } ${animating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
            <span className="text-white text-[10px] font-bold">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {distance !== undefined ? (
            <span className="text-white/70 text-[10px] bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {distance.toFixed(1)} km
            </span>
          ) : <span />}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded backdrop-blur-sm ${
            isOpen() ? 'bg-green-500/25' : 'bg-red-500/25'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen() ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-[9px] font-semibold ${isOpen() ? 'text-green-300' : 'text-red-300'}`}>
              {isOpen() ? 'Ochiq' : 'Yopiq'}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-xs font-bold text-white mb-1.5 line-clamp-1 leading-tight">{pitch.name}</h3>

        <div className="flex items-center text-slate-500 text-[10px] mb-1 gap-0.5">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-slate-600" />
          <span className="line-clamp-1">{locationText}</span>
        </div>

        <div className="flex items-center text-slate-600 text-[10px] mb-2.5 gap-0.5">
          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
          <span>{pitch.openTime?.slice(0, 5)} – {pitch.closeTime?.slice(0, 5)}</span>
          {pitch.phone && (
            <>
              <span className="mx-1 text-slate-700">·</span>
              <Phone className="w-2.5 h-2.5 flex-shrink-0" />
            </>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>{formatPrice()}</div>
          <div className="px-2 py-1 bg-blue-600/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded transition-colors group-hover:bg-blue-600/25">
            Ko'rish
          </div>
        </div>
      </div>
    </div>
  );
}
