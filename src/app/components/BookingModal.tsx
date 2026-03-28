import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toDateString, filterPastSlots } from '../lib/dateUtils';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import { Pitch } from '../lib/api';

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
      if (!pitch) {
        console.error('Pitch is undefined in BookingModal');
        setAvailableSlots([]);
        return;
      }

      const dateStr = toDateString(selectedDate);

      // Mock available slots for now
      const mockSlots = generateFallbackSlots();
      setAvailableSlots(mockSlots);
      return;
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
    if (!pitch || !pitch.openTime || !pitch.closeTime) return [];

    const startHour = parseInt(pitch.openTime.split(':')[0]);
    const endHour = parseInt(pitch.closeTime.split(':')[0]);
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const nextHour = hour + 1;
      slots.push(`${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`);
    }

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
        const totalPrice = pitch.pricePerHour * totalHours;

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
              pricePerHour={pitch.pricePerHour}
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