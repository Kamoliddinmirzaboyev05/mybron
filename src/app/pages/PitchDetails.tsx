import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { toDateString, filterPastSlots } from '../lib/dateUtils';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { 
  ArrowLeft, MapPin, Droplets, Car, Wifi, Coffee, Moon, 
  Users, Shield, Zap, Clock, Calendar as CalendarIcon, 
  Share2, Phone, MessageCircle, ExternalLink, Heart
} from 'lucide-react';
import PitchImageSlider from '../components/PitchImageSlider';
import BookingModal from '../components/BookingModal';
import ReviewsSection from '../components/ReviewsSection';
import PitchDetailsSkeleton from '../components/PitchDetailsSkeleton';
import { api } from '../lib/api';
import { toast } from 'sonner';

// Amenity icon mapping
const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();

  if (lowerAmenity.includes('dush') || lowerAmenity.includes('душ')) {
    return <Droplets className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('parkovka') || lowerAmenity.includes('парковка') || lowerAmenity.includes('parking')) {
    return <Car className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) {
    return <Wifi className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('kafe') || lowerAmenity.includes('кафе') || lowerAmenity.includes('cafe')) {
    return <Coffee className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('yoritish') || lowerAmenity.includes('освещение') || lowerAmenity.includes('light')) {
    return <Moon className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('kiyim') || lowerAmenity.includes('одежда') || lowerAmenity.includes('locker') || lowerAmenity.includes('xona')) {
    return <Users className="w-4 h-4 text-blue-500" />;
  }
  if (lowerAmenity.includes('xavfsiz') || lowerAmenity.includes('безопасность') || lowerAmenity.includes('security')) {
    return <Shield className="w-4 h-4 text-blue-500" />;
  }
  return <Zap className="w-4 h-4 text-blue-500" />;
};

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

export default function PitchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchField();
      if (user) {
        checkIfFavorite();
      }
    }
  }, [id, user]);

  const fetchField = async () => {
    if (!id) return;
    try {
      const response = await api.getFieldById(id);
      setField(response);
    } catch (err) {
      console.error('Exception while fetching field:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!id || !user) return;
    try {
      const favorites = await api.getFavorites();
      setIsFavorite(favorites.some(f => f.fieldId === id));
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      sessionStorage.setItem('returnToPitch', id || '');
      navigate('/login');
      return;
    }

    if (!id) return;

    const previousState = isFavorite;
    setIsFavorite(!previousState);

    try {
      if (previousState) {
        await api.removeFavorite(id);
        toast.success('Sevimlilardan olib tashlandi');
      } else {
        await api.addFavorite(id);
        toast.success('Sevimlilarga qo\'shildi');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setIsFavorite(previousState);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleBookingClick = () => {
    if (!user) {
      sessionStorage.setItem('returnToPitch', id || '');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingConfirm = async (dateStr: string, slots: string[], totalHours: number, totalPrice: number, slotIds: string[]) => {
    if (!user || !id || slotIds.length === 0) return;

    // slots are like ["18:00 - 19:00", "19:00 - 20:00"]
    const startTime = slots[0].split(' - ')[0];
    const endTime = slots[slots.length - 1].split(' - ')[1];

    try {
      // Use the first slot ID for booking (API books one slot at a time)
      await api.bookSlot({
        slotId: slotIds[0],
        fieldId: id,
        date: dateStr,
        startTime,
        endTime
      });
      
      setShowBookingModal(false);
      setShowSuccess(true);
      toast.success('Muvaffaqiyatli band qilindi!');
    } catch (err: any) {
      toast.error('Band qilishda xatolik', {
        description: err.message || 'Iltimos qaytadan urunib ko\'ring'
      });
    }
  };

  const handleShare = async () => {
    // ... same code ...
    const shareData = {
      title: field?.name || 'Maydon',
      text: `${field?.name} - ${field?.address}, ${field?.city}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Havola nusxalandi!', {
          description: 'Havola clipboardga nusxalandi.'
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Xatolik yuz berdi', {
          description: 'Havolani ulashib bo\'lmadi.'
        });
      }
    }
  };

  if (loading) {
    return <PitchDetailsSkeleton />;
  }

  if (!field) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Maydon topilmadi</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="max-w-md mx-auto">
        {/* Image Slider */}
        <div className="relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleShare}
            className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>

          <button
            onClick={handleFavoriteToggle}
            className="absolute top-4 right-16 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors group"
          >
            <Heart 
              className={`w-6 h-6 transition-colors ${
                isFavorite ? 'text-red-500 fill-current' : 'text-white group-hover:text-red-400'
              }`} 
            />
          </button>

          {field.images && field.images.length > 0 ? (
            <PitchImageSlider images={field.images} alt={field.name} />
          ) : (
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600">Rasm yo'q</span>
            </div>
          )}
        </div>

        {/* Field Info */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">{field.name}</h1>
          <div className="flex items-start text-slate-400 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{field.address}, {field.city}</span>
          </div>

          {/* Description */}
          {field.description && (
            <div className="text-slate-500 text-sm mb-4">
              {field.description}
            </div>
          )}

          {/* Price */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Narxi</div>
                <div className="text-3xl font-bold text-blue-500">
                  {field.pricePerHour.toLocaleString()} so'm
                </div>
                <div className="text-slate-500 text-sm">soatiga</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-sm mb-1">Ish vaqti</div>
                <div className="flex items-center gap-1 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{field.openTime?.slice(0, 5)} - {field.closeTime?.slice(0, 5)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities/Amenities */}
          {field.amenities && field.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Qulayliklar
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {field.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 whitespace-nowrap hover:border-blue-500/50 transition-colors"
                  >
                    {getAmenityIcon(amenity)}
                    <span className="text-sm text-slate-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Maydon haqida
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {field.size}
                </div>
                <div className="text-slate-400 text-xs">Hajmi</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {field.surface}
                </div>
                <div className="text-slate-400 text-xs">Yuzi</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {field.rating || 0}
                </div>
                <div className="text-slate-400 text-xs">Rating</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {field.reviewCount || 0}
                </div>
                <div className="text-slate-400 text-xs">Sharh</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Bog'lanish
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Telefon raqam</div>
                    <div className="text-white font-medium">{formatPhoneNumber(field.phone)}</div>
                  </div>
                </div>
                <a
                  href={`tel:${field.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://t.me/${field.phone.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Telegram
                </a>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${field.lat},${field.lng}`)}
                  disabled={!field.lat || !field.lng}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xaritada
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewsSection pitchId={id || ''} />
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
          <div className="max-w-md mx-auto px-4 py-4">
            <button
              onClick={handleBookingClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Band qilish
            </button>
          </div>
        </div>

        {/* Booking Modal */}
        {field && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            pitch={field}
            onConfirm={handleBookingConfirm}
            onDateChange={() => {}}
          />
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-900 rounded-xl p-6 max-w-sm w-full border border-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">So'rov yuborildi!</h3>
                <p className="text-slate-400 mb-6">
                  Sizning band qilish so'rovingiz admin tomonidan ko'rib chiqiladi. Tasdiqlangandan keyin xabar beramiz.
                </p>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/bookings');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Mening bandlovlarim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
