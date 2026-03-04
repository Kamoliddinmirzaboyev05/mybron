import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase, Pitch, Booking } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, MapPin, Droplets, Car, Wifi, Coffee, Moon, Users, Shield, Zap, Clock, Calendar as CalendarIcon, Share2 } from 'lucide-react';
import PitchImageSlider from '../components/PitchImageSlider';
import BookingModal from '../components/BookingModal';
import ReviewsSection from '../components/ReviewsSection';
import PitchDetailsSkeleton from '../components/PitchDetailsSkeleton';

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
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState<string>('today');

  useEffect(() => {
    if (id) {
      fetchPitch();
    }
  }, [id]);

  useEffect(() => {
    if (id && showBookingModal) {
      fetchBookedSlots();
    }
  }, [id, showBookingModal, selectedDateForBooking]);

  const fetchPitch = async () => {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching pitch:', error);
      } else {
        setPitch(data);
      }
    } catch (err) {
      console.error('Exception while fetching pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateForSelection = (selection: string): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selection === 'today') return today;
    if (selection === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (selection === 'dayAfter') {
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return dayAfter;
    }
    return today;
  };

  const fetchBookedSlots = async () => {
    if (!id) return;

    try {
      const targetDate = getDateForSelection(selectedDateForBooking);
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('pitch_id', id)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed', 'manual']);

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        const slots = new Set<string>();
        data?.forEach((item: any) => {
          // start_time and end_time are time format (HH:MM:SS)
          const startHour = parseInt(item.start_time.split(':')[0]);
          const endHour = parseInt(item.end_time.split(':')[0]);
          const timeSlot = `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
          slots.add(timeSlot);
        });
        setBookedSlots(slots);
      }
    } catch (err) {
      console.error('Exception while fetching bookings:', err);
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

  const handleShare = async () => {
    const shareData = {
      title: pitch?.name || 'Maydon',
      text: `${pitch?.name} - ${pitch?.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Havola nusxalandi!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDateForBooking(date);
    fetchBookedSlots();
  };

  const handleBookingConfirm = async (date: string, timeSlot: string) => {
    if (!user || !pitch) return;

    try {
      // Fetch user profile for full_name and phone (optional, may not exist)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      const targetDate = getDateForSelection(date);
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const [startTimeStr] = timeSlot.split(' - ');
      const [hour] = startTimeStr.split(':').map(Number);
      
      // Format time as HH:MM:SS for time type
      const startTimeFormatted = `${hour.toString().padStart(2, '0')}:00:00`;
      const endTimeFormatted = `${(hour + 1).toString().padStart(2, '0')}:00:00`;

      // Calculate total price (1 hour)
      const totalPrice = pitch.price_per_hour;

      const { error } = await supabase.from('bookings').insert({
        pitch_id: id,
        user_id: user.id,
        full_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'User',
        phone: profile?.phone || user.user_metadata?.phone || '',
        booking_date: dateStr,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        total_price: totalPrice,
        status: 'pending',
      });

      if (error) {
        console.error('Error creating booking:', error);
        
        // Check for overlap error from trigger
        if (error.message && (error.message.includes('overlap') || error.message.includes('bron'))) {
          alert('Bu vaqtda boshqa mijoz bron qilgan. Iltimos, boshqa vaqt tanlang.');
        } else {
          alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        }
        throw error;
      } else {
        setShowBookingModal(false);
        setShowSuccess(true);
        fetchBookedSlots();
      }
    } catch (err: any) {
      console.error('Exception while creating booking:', err);
      // Error already handled above
    }
  };

  if (loading) {
    return <PitchDetailsSkeleton />;
  }

  if (!pitch) {
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
          
          {pitch.images && pitch.images.length > 0 ? (
            <PitchImageSlider images={pitch.images} alt={pitch.name} />
          ) : (
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600">Rasm yo'q</span>
            </div>
          )}
        </div>

        {/* Pitch Info */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">{pitch.name}</h1>
          <div className="flex items-start text-slate-400 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{pitch.location}</span>
          </div>
          
          {pitch.landmark && (
            <div className="text-slate-500 text-sm mb-3">
              📍 {pitch.landmark}
            </div>
          )}

          {/* Price */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Narxi</div>
                <div className="text-3xl font-bold text-blue-500">
                  {pitch.price_per_hour.toLocaleString()} so'm
                </div>
                <div className="text-slate-500 text-sm">soatiga</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-sm mb-1">Ish vaqti</div>
                <div className="flex items-center gap-1 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{pitch.start_time?.slice(0, 5)} - {pitch.end_time?.slice(0, 5)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities/Amenities */}
          {pitch.amenities && pitch.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Qulayliklar
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {pitch.amenities.map((amenity, index) => (
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

          {/* Reviews Section */}
          <ReviewsSection pitchId={id || ''} />
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
          <div className="max-w-md mx-auto px-4 py-4">
            <button
              onClick={handleBookingClick}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              {submitting ? 'Yuklanmoqda...' : 'Band qilish'}
            </button>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          pitch={pitch}
          onConfirm={handleBookingConfirm}
          bookedSlots={bookedSlots}
          onDateChange={handleDateChange}
        />

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
