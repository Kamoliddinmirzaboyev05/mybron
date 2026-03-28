import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { toDateString, filterPastSlots } from '../lib/dateUtils';
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
  const [selectedDateForBooking, setSelectedDateForBooking] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchPitch();
    }
  }, [id]);

  useEffect(() => {
    if (id && showBookingModal && selectedDateForBooking) {
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

  const fetchBookedSlots = async () => {
    if (!id || !selectedDateForBooking) return;

    try {
      // NEW APPROACH: Fetch from pitch_slots table
      // Get all slots for this pitch and date where is_available = false
      const { data, error } = await supabase
        .from('pitch_slots')
        .select('slot_time, is_available')
        .eq('pitch_id', id)
        .eq('slot_date', selectedDateForBooking)
        .eq('is_available', false)
        .order('slot_time', { ascending: true });

      if (error) {
        console.error('❌ XATOLIK:', error);
        toast.error('Xatolik yuz berdi', {
          description: 'Bandlik ma\'lumotlarini yuklab bo\'lmadi.'
        });
      } else {
        console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║  🔍 PITCHDETAILS - BAND VAQTLARNI OLISH (pitch_slots)           ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝');
        
        console.log('\n📥 DATABASE QUERY PARAMETRLARI:');
        console.log('   ├─ Jadval: pitch_slots');
        console.log('   ├─ pitch_id:', id);
        console.log('   ├─ slot_date:', selectedDateForBooking);
        console.log('   └─ is_available: false (faqat band slotlar)');
        
        console.log('\n📊 DATABASE DAN KELGAN MA\'LUMOT:');
        console.log('   └─ Topilgan band slotlar soni:', data?.length || 0);
        
        if (data && data.length > 0) {
          console.log('\n📋 PITCH_SLOTS JADVALIDAGI BAND SLOTLAR:');
          console.log('   ┌─────────────────────────────────────────────────────────┐');
          data.forEach((slot, index) => {
            console.log(`   │ Slot #${index + 1}:`);
            console.log('   │  ├─ slot_time:', slot.slot_time);
            console.log('   │  └─ is_available:', slot.is_available);
            if (index < data.length - 1) {
              console.log('   │');
            }
          });
          console.log('   └─────────────────────────────────────────────────────────┘');
        } else {
          console.log('\n   ℹ️  Hech qanday band slot topilmadi (barcha vaqtlar bo\'sh)');
        }
        
        const slots = new Set<string>();
        
        console.log('\n🔄 SLOTLARNI QAYTA ISHLASH:');
        
        data?.forEach((item: any, index: number) => {
          console.log(`\n   ┌─ Slot #${index + 1} ni qayta ishlash:`);
          
          // Normalize time by stripping seconds (HH:mm format)
          const slotTime = item.slot_time.substring(0, 5); // "HH:mm"
          
          console.log('   │  ├─ Original (database):', item.slot_time);
          console.log('   │  └─ Normalized (HH:mm):', slotTime);
          
          // Convert to hour slot format (e.g., "14:00 - 15:00")
          const [hour] = slotTime.split(':').map(Number);
          const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
          
          console.log('   │  └─ Slot format:', timeSlot);
          
          slots.add(timeSlot);
        });
        
        setBookedSlots(slots);
        
        console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║  📊 YAKUNIY NATIJA (bookedSlots Set ga saqlandi)                ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝');
        console.log('\n🔒 Band slotlar (Set):');
        if (slots.size > 0) {
          Array.from(slots).forEach((slot, index) => {
            console.log(`   ${index + 1}. ${slot}`);
          });
        } else {
          console.log('   (bo\'sh - hech qanday slot band emas)');
        }
        console.log('\n📈 Statistika:');
        console.log('   ├─ Jami band slotlar:', slots.size, 'ta');
        console.log('   ├─ Qayta ishlangan slotlar:', data?.length || 0, 'ta');
        console.log('   └─ Sana:', selectedDateForBooking);
        
        console.log('\n💾 KEYINGI QADAM:');
        console.log('   └─ Bu Set BookingModal → TimeSlotPicker ga props orqali uzatiladi');
        
        console.log('\n═══════════════════════════════════════════════════════════════════\n');
      }
    } catch (err) {
      console.error('Exception while fetching slots:', err);
      toast.error('Xatolik yuz berdi', {
        description: 'Qaytadan urinib ko\'ring.'
      });
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

  const handleDateChange = (dateStr: string) => {
    setSelectedDateForBooking(dateStr);
  };

  const handleBookingConfirm = async (
    dateStr: string, 
    slots: string[], 
    totalHours: number, 
    totalPrice: number
  ) => {
    if (!user || !pitch) return;

    const loadingToast = toast.loading('Bron qilinmoqda...');

    try {
      // Fetch user profile for full_name and phone
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Get start and end times from selected slots
      const slotHours = slots.map(slot => {
        const [startStr] = slot.split(' - ');
        return parseInt(startStr.split(':')[0]);
      }).sort((a, b) => a - b);

      const startHour = Math.min(...slotHours);
      const endHour = Math.max(...slotHours) + 1;

      // CRITICAL FIX: Double-check availability right before insert
      // Check pitch_slots table to ensure all requested slots are available
      const { data: existingSlots, error: checkError } = await supabase
        .from('pitch_slots')
        .select('slot_time, is_available')
        .eq('pitch_id', id)
        .eq('slot_date', dateStr)
        .eq('is_available', false);

      if (checkError) {
        console.error('Error checking availability:', checkError);
        toast.error('Xatolik yuz berdi', { 
          id: loadingToast,
          description: 'Bandlik tekshirilmadi. Qaytadan urinib ko\'ring.'
        });
        return;
      }

      // Check if any of our requested slots are unavailable
      let hasConflict = false;
      let conflictDetails = '';
      
      existingSlots?.forEach((slot: any) => {
        const slotHour = parseInt(slot.slot_time.substring(0, 2));
        
        // Check if this unavailable slot is in our requested range
        if (slotHour >= startHour && slotHour < endHour) {
          hasConflict = true;
          conflictDetails = slot.slot_time.substring(0, 5);
        }
      });

      if (hasConflict) {
        console.warn('Booking conflict detected (pitch_slots):', conflictDetails);
        toast.error('Bu vaqt band!', { 
          id: loadingToast,
          description: 'Tanlangan vaqtda boshqa bron mavjud. Iltimos, boshqa vaqt tanlang.'
        });
        // Refresh booked slots to show updated availability
        await fetchBookedSlots();
        return;
      }

      // Format times as HH:MM:SS for time type
      const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:00:00`;
      const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:00:00`;

      console.log('Creating booking:', {
        pitch_id: id,
        booking_date: dateStr,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        total_hours: totalHours,
        total_price: totalPrice
      });

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
        
        // Check for overlap error from trigger or constraint
        if (error.message && (error.message.includes('overlap') || error.message.includes('bron') || error.message.includes('conflict'))) {
          toast.error('Bu vaqt band!', { 
            id: loadingToast,
            description: 'Tanlangan vaqtda boshqa bron mavjud.'
          });
          // Refresh booked slots
          await fetchBookedSlots();
        } else {
          toast.error('Xatolik yuz berdi', { 
            id: loadingToast,
            description: 'Qaytadan urinib ko\'ring.'
          });
        }
        throw error;
      } else {
        console.log('Booking created successfully');
        toast.success('Muvaffaqiyatli band qilindi!', { 
          id: loadingToast,
          description: 'Admin tasdiqlashini kuting.'
        });
        setShowBookingModal(false);
        setShowSuccess(true);
        // Refresh booked slots to reflect the new booking
        await fetchBookedSlots();
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
