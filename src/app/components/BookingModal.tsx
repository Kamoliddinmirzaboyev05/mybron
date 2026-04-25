import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toDateString } from '../lib/dateUtils';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import { Pitch, api, FieldSlot } from '../lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: Pitch;
  onConfirm: (dateStr: string, slots: string[], totalHours: number, totalPrice: number, slotIds: string[]) => Promise<void>;
  onDateChange: (dateStr: string) => void;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  pitch, 
  onConfirm, 
  onDateChange 
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<FieldSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
      setSelectedSlots([]);
      setSelectedSlotIds([]);
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
        setAvailableSlots([]);
        return;
      }

      const dateStr = toDateString(selectedDate);
      const response = await api.getFieldSlots(pitch.id, dateStr);
      
      // Find slots for the selected date (the API returns an array of dates)
      const dateData = response.dates.find(d => d.date === dateStr);
      if (dateData) {
        setAvailableSlots(dateData.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Exception while fetching slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setSelectedSlotIds([]);
    onDateChange(toDateString(date));
  };

  const handleSlotsChange = (slots: string[]) => {
    setSelectedSlots(slots);
  };

  const handleSlotIdsChange = (slotIds: string[]) => {
    setSelectedSlotIds(slotIds);
  };

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (selectedSlots.length > 0 && !isSubmitting && selectedSlotIds.length > 0) {
      setIsSubmitting(true);
      try {
        const dateStr = toDateString(selectedDate);
        const totalHours = selectedSlots.length;
        const totalPrice = pitch.pricePerHour * totalHours;

        await onConfirm(dateStr, selectedSlots, totalHours, totalPrice, selectedSlotIds);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasValidSelection = selectedSlots.length > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#0d1526] w-full max-w-md rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-black text-white">Band qilish</h2>
            <p className="text-sm text-slate-500 mt-0.5">{pitch.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlots={selectedSlots}
              onSlotsChange={handleSlotsChange}
              onSlotIdsChange={handleSlotIdsChange}
              pricePerHour={pitch.pricePerHour}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5">
          {hasValidSelection && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-slate-500 text-sm">{selectedSlots.length} soat</span>
              <span className="text-blue-400 font-black text-lg">
                {(pitch.pricePerHour * selectedSlots.length).toLocaleString()} so'm
              </span>
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={!hasValidSelection || isSubmitting || loading || selectedSlotIds.length === 0}
            className={`w-full py-3.5 rounded-lg font-bold transition-all active:scale-[0.98] ${
              hasValidSelection && !isSubmitting && !loading && selectedSlotIds.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yuklanmoqda...
              </span>
            ) : hasValidSelection ? `${selectedSlots.length} soat band qilish` : 'Vaqt tanlang'}
          </button>
        </div>
      </div>
    </div>
  );
}