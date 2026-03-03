import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Pitch } from '../lib/supabase';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: Pitch;
  onConfirm: (date: string, timeSlot: string) => Promise<void>;
  bookedSlots: Set<string>;
  onDateChange: (date: string) => void;
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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
      setSelectedTime(null);
      onDateChange('today');
    }
  }, [isOpen]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    
    // Convert date to selection string
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    let selection = 'today';
    if (date.toDateString() === tomorrow.toDateString()) {
      selection = 'tomorrow';
    } else if (date.toDateString() === dayAfter.toDateString()) {
      selection = 'dayAfter';
    }
    
    onDateChange(selection);
  };

  if (!isOpen) return null;

  const generateTimeSlots = (): string[] => {
    if (!pitch || !pitch.start_time || !pitch.end_time) return [];
    
    const startHour = parseInt(pitch.start_time.split(':')[0]);
    const endHour = parseInt(pitch.end_time.split(':')[0]);
    const slots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      const nextHour = hour + 1;
      slots.push(`${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleConfirm = async () => {
    if (selectedTime && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Convert date back to selection string for compatibility
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        
        let dateSelection = 'today';
        if (selectedDate.toDateString() === tomorrow.toDateString()) {
          dateSelection = 'tomorrow';
        } else if (selectedDate.toDateString() === dayAfter.toDateString()) {
          dateSelection = 'dayAfter';
        }
        
        await onConfirm(dateSelection, selectedTime);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate price summary
  const pricePerHour = pitch.price_per_hour;
  const hours = 1; // Currently only 1 hour slots
  const totalPrice = pricePerHour * hours;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Vaqtni tanlang</h2>
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
          <TimeSlotPicker
            slots={timeSlots}
            bookedSlots={bookedSlots}
            selectedSlot={selectedTime}
            onSlotSelect={setSelectedTime}
          />

          {/* Price Summary */}
          {selectedTime && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Narx hisob-kitobi</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{hours} soat × {(pricePerHour / 1000).toFixed(0)}k</span>
                  <span className="text-white font-medium">{(pricePerHour / 1000).toFixed(0)}k so'm</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Jami:</span>
                  <span className="text-blue-500 font-bold text-lg">{totalPrice.toLocaleString()} so'm</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleConfirm}
            disabled={!selectedTime || isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold transition-colors ${
              selectedTime && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Yuklanmoqda...' : 'Band qilish'}
          </button>
        </div>
      </div>
    </div>
  );
}
