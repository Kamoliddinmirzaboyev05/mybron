import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toDateString, filterPastSlots } from '../lib/dateUtils';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: Pitch;
  onConfirm: (dateStr: string, slots: string[], totalHours: number, totalPrice: number) => Promise<void>;
  bookedSlots: Set<string>;
  onDateChange: (dateStr: string) => void;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  pitch, 
  onConfirm, 
  bookedSlots,
  onDateChange 
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
      setSelectedSlots([]);
      onDateChange(toDateString(today));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAvailableSlots();
    }
  }, [isOpen, selectedDate, pitch.id]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = toDateString(selectedDate);
      
      console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
      console.log('║  📥 BOOKINGMODAL - VAQT SLOTLARINI OLISH (pitch_slots)          ║');
      console.log('╚═══════════════════════════════════════════════════════════════════╝');
      
      console.log('\n📥 DATABASE QUERY PARAMETRLARI:');
      console.log('   ├─ Jadval: pitch_slots');
      console.log('   ├─ pitch_id:', pitch.id);
      console.log('   ├─ slot_date:', dateStr);
      console.log('   └─ is_available: true (faqat bo\'sh slotlar)');
      
      // Fetch available slots from pitch_slots table
      const { data, error } = await supabase
        .from('pitch_slots')
        .select('slot_time, is_available')
        .eq('pitch_id', pitch.id)
        .eq('slot_date', dateStr)
        .eq('is_available', true)
        .order('slot_time', { ascending: true });

      if (error) {
        console.error('❌ XATOLIK:', error);
        // Fallback to generating slots from pitch working hours
        console.log('\n⚠️  FALLBACK: Maydon ish vaqtidan slotlar generatsiya qilinmoqda');
        const fallbackSlots = generateFallbackSlots();
        setAvailableSlots(fallbackSlots);
      } else {
        console.log('\n📊 DATABASE DAN KELGAN MA\'LUMOT:');
        console.log('   └─ Topilgan bo\'sh slotlar soni:', data?.length || 0);
        
        if (data && data.length > 0) {
          console.log('\n📋 PITCH_SLOTS JADVALIDAGI BO\'SH SLOTLAR:');
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
          console.log('\n   ℹ️  Hech qanday bo\'sh slot topilmadi');
        }
        
        // Convert slot_time to slot format (e.g., "14:00 - 15:00")
        const slots = data?.map((item: any) => {
          const slotTime = item.slot_time.substring(0, 5); // "HH:mm"
          const [hour] = slotTime.split(':').map(Number);
          return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
        }) || [];
        
        console.log('\n🔄 SLOTLARNI FORMATLASH:');
        console.log('   └─ Format: "HH:00 - HH:00"');
        
        // Filter out past slots if today
        const filteredSlots = filterPastSlots(slots, selectedDate);
        
        console.log('\n📊 YAKUNIY NATIJA:');
        console.log('   ├─ Database dan:', slots.length, 'ta slot');
        console.log('   ├─ O\'tgan vaqtlar filtrlangandan keyin:', filteredSlots.length, 'ta slot');
        console.log('   └─ Bo\'sh slotlar:', filteredSlots);
        
        console.log('\n💾 KEYINGI QADAM:');
        console.log('   └─ Bu slotlar TimeSlotPicker ga props orqali uzatiladi');
        
        console.log('\n═══════════════════════════════════════════════════════════════════\n');
        
        setAvailableSlots(filteredSlots);
      }
    } catch (err) {
      console.error('Exception while fetching slots:', err);
      // Fallback to generating slots from pitch working hours
      const fallbackSlots = generateFallbackSlots();
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackSlots = (): string[] => {
    if (!pitch || !pitch.start_time || !pitch.end_time) return [];
    
    const startHour = parseInt(pitch.start_time.split(':')[0]);
    const endHour = parseInt(pitch.end_time.split(':')[0]);
    const slots: string[] = [];
    
    console.log('\n⚠️  FALLBACK MODE:');
    console.log('   ├─ Maydon:', pitch.name);
    console.log('   ├─ Ish vaqti:', `${pitch.start_time} - ${pitch.end_time}`);
    console.log('   └─ Tanlangan sana:', toDateString(selectedDate));
    
    for (let hour = startHour; hour < endHour; hour++) {
      const nextHour = hour + 1;
      slots.push(`${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`);
    }
    
    console.log('   └─ Generatsiya qilingan slotlar:', slots.length, 'ta');
    
    // Filter out past slots if today
    const filteredSlots = filterPastSlots(slots, selectedDate);
    
    return filteredSlots;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    onDateChange(toDateString(date));
  };

  const handleSlotsChange = (slots: string[]) => {
    setSelectedSlots(slots);
  };

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (selectedSlots.length > 0 && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const dateStr = toDateString(selectedDate);
        const totalHours = selectedSlots.length;
        const totalPrice = pitch.price_per_hour * totalHours;
        
        await onConfirm(dateStr, selectedSlots, totalHours, totalPrice);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasValidSelection = selectedSlots.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Band qilish</h2>
            <p className="text-sm text-slate-400 mt-1">{pitch.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date Picker */}
          <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />

          {/* Time Slot Picker */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-slate-400">Yuklanmoqda...</div>
            </div>
          ) : (
            <TimeSlotPicker
              slots={availableSlots}
              bookedSlots={bookedSlots}
              selectedSlots={selectedSlots}
              onSlotsChange={handleSlotsChange}
              pricePerHour={pitch.price_per_hour}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleConfirm}
            disabled={!hasValidSelection || isSubmitting || loading}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              hasValidSelection && !isSubmitting && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Yuklanmoqda...' : hasValidSelection ? `${selectedSlots.length} soat band qilish` : 'Vaqt tanlang'}
          </button>
        </div>
      </div>
    </div>
  );
}
