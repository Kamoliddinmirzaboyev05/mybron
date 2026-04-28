import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { toDateString } from '../lib/dateUtils';
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
import { api, Pitch } from '../lib/api';
import { toast } from 'sonner';
import { notifyBookingCreated } from '../lib/notifications';

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

export default function PitchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState<Pitch | null>(null);
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

  const handleBookingConfirm = async (dateStr: string, slots: string[], totalHours: number, totalPrice: number, slotIds: string[], note?: string) => {
    if (!user || !id || slotIds.length === 0) return;

    try {
      await api.bookSlot({
        slotId: slotIds[0],
        fieldId: id,
        date: dateStr,
        note: note || ''
      });
      
      setShowBookingModal(false);
      setShowSuccess(true);
      toast.success('Muvaffaqiyatli band qilindi!');
      await notifyBookingCreated(field?.name || 'Maydon');
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
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-slate-500">Maydon topilmadi</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] pb-24">
      <div className="max-w-md mx-auto">
        {/* Image Slider */}
        <div className="relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-12 left-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="absolute top-12 right-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors border border-white/10"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleFavoriteToggle}
            className="absolute top-12 right-14 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-lg hover:bg-black/70 transition-colors border border-white/10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}
            />
          </button>

          {field.images && field.images.length > 0 ? (
            <PitchImageSlider images={field.images} alt={field.name} />
          ) : (
            <div className="aspect-video bg-[#0d1526] flex items-center justify-center">
              <span className="text-slate-600">Rasm yo'q</span>
            </div>
          )}
        </div>

        {/* Field Info */}
        <div className="px-4 py-5">
          <h1 className="text-2xl font-black text-white mb-1">{field.name}</h1>
          <div className="flex items-center text-slate-500 text-sm mb-4 gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span>
              {field.address && field.address !== 'Manzil kiritilmagan' ? field.address : ''}
              {field.address && field.address !== 'Manzil kiritilmagan' && field.city && field.city !== 'Shahar kiritilmagan' ? ', ' : ''}
              {field.city && field.city !== 'Shahar kiritilmagan' ? field.city : ''}
              {(!field.address || field.address === 'Manzil kiritilmagan') && (!field.city || field.city === 'Shahar kiritilmagan') ? "Manzil ko'rsatilmagan" : ''}
            </span>
          </div>

          {field.description && (
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">{field.description}</p>
          )}

          {/* Price card */}
          <div className="bg-gradient-to-br from-blue-600/15 to-indigo-600/10 rounded-lg p-4 mb-5 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs mb-1">Narxi</div>
                {field.pricePerHour > 0 ? (
                  <div className="text-3xl font-black text-blue-400">
                    {field.pricePerHour.toLocaleString()}
                    <span className="text-base font-normal text-slate-500 ml-1">so'm/soat</span>
                  </div>
                ) : (
                  <div className="text-3xl font-black text-emerald-400">
                    Bepul
                    <span className="text-base font-normal text-slate-500 ml-1">/ kelishiladi</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-xs mb-1">Ish vaqti</div>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{field.openTime?.slice(0, 5)} – {field.closeTime?.slice(0, 5)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {field.amenities && field.amenities.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Qulayliklar</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {field.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1526] rounded-md border border-white/5 whitespace-nowrap">
                    {getAmenityIcon(amenity)}
                    <span className="text-sm text-slate-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Vaqt', value: `${field.openTime?.slice(0,5)}` },
              { label: 'Oldindan', value: `${field.advanceBookingDays} kun` },
              { label: 'Reyting', value: field.rating > 0 ? String(field.rating) : '—' },
              { label: 'Sharhlar', value: String(field.reviewCount || 0) },
            ].map(item => (
              <div key={item.label} className="bg-[#0d1526] rounded-lg p-3 text-center border border-white/5">
                <div className="text-base font-black text-blue-400 mb-0.5 truncate">{item.value}</div>
                <div className="text-[10px] text-slate-600">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mb-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bog'lanish</h3>
            <div className="bg-[#0d1526] rounded-lg p-4 border border-white/5">
              {field.phone ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-slate-600 text-xs">Telefon</div>
                        <div className="text-white font-semibold">{formatPhoneNumber(field.phone)}</div>
                      </div>
                    </div>
                    <a href={`tel:${field.phone}`} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://t.me/${field.phone.replace('+', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Telegram
                    </a>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${field.lat},${field.lng}`)}
                      disabled={!field.lat || !field.lng}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5 disabled:opacity-40"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xaritada
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-slate-600 text-xs">Telefon</div>
                    <div className="text-slate-500 text-sm">Ko'rsatilmagan</div>
                  </div>
                  {(field.lat && field.lng) && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${field.lat},${field.lng}`)}
                      className="ml-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xaritada
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <ReviewsSection pitchId={id || ''} />
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="absolute inset-0 bg-[#020817]/90 backdrop-blur-xl border-t border-white/5" />
          <div className="relative max-w-md mx-auto px-4 py-4">
            <button
              onClick={handleBookingClick}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              Band qilish
            </button>
          </div>
          <div className="h-safe-area-inset-bottom bg-[#020817]/90" />
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-[#0d1526] rounded-xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
              <div className="text-center">
                <div className="w-14 h-14 bg-green-500/15 rounded-xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-white mb-2">So'rov yuborildi!</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  Bron so'rovingiz admin tomonidan ko'rib chiqiladi. Tasdiqlangandan keyin bildirishnoma olasiz.
                </p>
                <button
                  onClick={() => { setShowSuccess(false); navigate('/bookings'); }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Bronlarimni ko'rish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
