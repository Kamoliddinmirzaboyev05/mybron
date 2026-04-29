import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { toDateString } from '../lib/dateUtils';
import { formatPhoneNumber } from '../lib/phoneFormatter';
import { 
  ArrowLeft, MapPin, Droplets, Car, Wifi, Coffee, Moon, 
  Users, Shield, Zap, Clock, Calendar as CalendarIcon, 
  Share2, Phone, MessageCircle, ExternalLink, Heart,
  Star, Info, CheckCircle2
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

  // SEO Update
  useEffect(() => {
    if (field) {
      document.title = `${field.name} - MYBRON`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `${field.name} futbol maydoni - ${field.address}, ${field.city}. Narxi: ${field.pricePerHour} so'm/soat. MYBRON orqali onlayn band qiling.`);
      }

      // OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${field.name} - MYBRON`);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', `${field.name} futbol maydoni band qilish.`);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && field.images && field.images.length > 0) {
        ogImage.setAttribute('content', field.images[0]);
      }
    }

    return () => {
      document.title = 'MYBRON - Futbol Maydonlarini Band Qilish Tizimi';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', "O'zbekistondagi futbol maydonlarini onlayn band qilishning eng oson va tezkor yo'li. Maydonlar ro'yxati, narxlari va mavjud vaqtlari.");
      }
    };
  }, [field]);

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
    <div className="min-h-screen bg-[#020817] pb-32">
      <div className="max-w-md mx-auto relative">
        {/* Header Overlay Buttons */}
        <div className="absolute top-6 left-0 right-0 z-30 px-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="bg-black/40 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-black/60 transition-all border border-white/10 shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleFavoriteToggle}
              className="bg-black/40 backdrop-blur-md p-2.5 rounded-xl hover:bg-black/60 transition-all border border-white/10 shadow-lg active:scale-95"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="bg-black/40 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-black/60 transition-all border border-white/10 shadow-lg active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Slider Section */}
        <div className="relative">
          {field.images && field.images.length > 0 ? (
            <PitchImageSlider images={field.images} alt={field.name} />
          ) : (
            <div className="aspect-[4/3] bg-[#0d1526] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-12 h-12 text-slate-800" />
                <span className="text-slate-600 font-medium text-sm">Rasm yuklanmagan</span>
              </div>
            </div>
          )}
          {/* Bottom curve decoration */}
          <div className="absolute -bottom-1 left-0 right-0 h-6 bg-[#020817] rounded-t-[24px] z-10" />
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-2 relative z-20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{field.name}</h1>
              <div className="flex items-center text-slate-400 text-sm mt-1 gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="line-clamp-1">
                  {field.address && field.address !== 'Manzil kiritilmagan' ? field.address : ''}
                  {field.address && field.address !== 'Manzil kiritilmagan' && field.city && field.city !== 'Shahar kiritilmagan' ? ', ' : ''}
                  {field.city && field.city !== 'Shahar kiritilmagan' ? field.city : ''}
                  {(!field.address || field.address === 'Manzil kiritilmagan') && (!field.city || field.city === 'Shahar kiritilmagan') ? "Manzil ko'rsatilmagan" : ''}
                </span>
              </div>
            </div>
          </div>

          {field.description && (
            <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <p className="text-slate-400 text-[13px] leading-relaxed italic">
                "{field.description}"
              </p>
            </div>
          )}

          {/* Pricing Card - Redesigned */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-[#0d1526] p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors" />
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Narxi
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">
                  {field.pricePerHour > 0 ? field.pricePerHour.toLocaleString() : 'Bepul'}
                </span>
                <span className="text-slate-500 text-[11px] font-medium uppercase tracking-tight">
                  so'm / soat
                </span>
              </div>
            </div>

            <div className="bg-[#0d1526] p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:bg-emerald-500/10 transition-colors" />
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Ish vaqti
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">
                  {field.openTime?.slice(0, 5)} – {field.closeTime?.slice(0, 5)}
                </span>
                <span className="text-slate-500 text-[11px] font-medium uppercase tracking-tight">
                  Har kuni ochiq
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid - Enhanced with Icons */}
          <div className="grid grid-cols-4 gap-2.5 mt-6">
            {[
              { label: 'Rating', value: field.rating > 0 ? field.rating : '—', icon: <Star className="w-3.5 h-3.5" />, color: 'text-yellow-500' },
              { label: 'Sharhlar', value: field.reviewCount || 0, icon: <MessageCircle className="w-3.5 h-3.5" />, color: 'text-blue-400' },
              { label: 'Oldindan', value: `${field.advanceBookingDays} kun`, icon: <CalendarIcon className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
              { label: 'Status', value: 'Ochiq', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            ].map(item => (
              <div key={item.label} className="bg-[#0d1526]/50 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5 text-center">
                <div className={`${item.color} mb-1.5`}>{item.icon}</div>
                <div className="text-sm font-black text-white leading-none mb-1">{item.value}</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Amenities Section */}
          {field.amenities && field.amenities.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Qulayliklar
                </h3>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {field.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2 bg-[#0d1526] rounded-xl border border-white/5 whitespace-nowrap shadow-sm">
                    {getAmenityIcon(amenity)}
                    <span className="text-[13px] text-slate-300 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section - Redesigned */}
          <div className="mt-8">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              Bog'lanish
            </h3>
            <div className="bg-gradient-to-br from-[#0d1526] to-[#161e2e] rounded-2xl p-5 border border-white/5 shadow-xl">
              {field.phone ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Phone className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Bog'lanish uchun</div>
                        <div className="text-white text-lg font-black tracking-tight">{formatPhoneNumber(field.phone)}</div>
                      </div>
                    </div>
                    <a href={`tel:${field.phone}`} className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                      <Phone className="w-5 h-5 fill-current" />
                    </a>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={`https://t.me/${field.phone.replace('+', '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl text-sm font-bold transition-all border border-white/5 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 text-sky-400" />
                      Telegram
                    </a>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${field.lat},${field.lng}`)}
                      disabled={!field.lat || !field.lng}
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl text-sm font-bold transition-all border border-white/5 disabled:opacity-40 active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      Xaritada
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-slate-500 font-medium">Telefon ko'rsatilmagan</div>
                  {field.lat && field.lng && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${field.lat},${field.lng}`)}
                      className="mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      Xaritada ko'rish
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <ReviewsSection pitchId={id || ''} />
          </div>
        </div>

        {/* Sticky CTA - Redesigned */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/95 to-transparent h-40 -top-20 pointer-events-none" />
          <div className="relative max-w-md mx-auto px-5 pb-8 pt-4">
            <button
              onClick={handleBookingClick}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4.5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 border border-blue-400/20"
            >
              <CalendarIcon className="w-6 h-6" />
              BAND QILISH
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
            <div className="bg-[#0d1526] rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-500/15 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Muvaffaqiyatli!</h3>
              <p className="text-slate-400 text-[15px] mb-8 leading-relaxed">
                Bron so'rovingiz yuborildi. Admin tasdiqlashi bilan sizga xabar beramiz.
              </p>
              <button
                onClick={() => { setShowSuccess(false); navigate('/bookings'); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                BRONLARIMGA O'TISH
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
