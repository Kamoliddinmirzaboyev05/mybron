import { useState, useEffect } from 'react';
import { X, Calendar, Clock, ChevronDown } from 'lucide-react';
import { Pitch } from '../lib/supabase';

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
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate('today');
      setSelectedTime(null);
      setIsDateOpen(false);
      setIsTimeOpen(false);
      onDateChange('today');
    }
  }, [isOpen]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsDateOpen(false);
    onDateChange(date);
  };

  if (!isOpen) return null;

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

  const getDateLabel = (selection: string): string => {
    const date = getDateForSelection(selection);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    
    if (selection === 'today') return `Bugun, ${date.getDate()} ${months[date.getMonth()]}`;
    if (selection === 'tomorrow') return `Ertaga, ${date.getDate()} ${months[date.getMonth()]}`;
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

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
        await onConfirm(selectedDate, selectedTime);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const dateOptions = [
    { value: 'today', label: 'Bugun' },
    { value: 'tomorrow', label: 'Ertaga' },
    { value: 'dayAfter', label: 'Indinga' },
  ];

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
          {/* Date Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Calendar className="w-4 h-4" />
              Sanani belgilash
            </label>
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              <span className="font-medium">{getDateLabel(selectedDate)}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDateOpen && (
              <div className="mt-2 space-y-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateChange(option.value)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      selectedDate === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {getDateLabel(option.value)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Clock className="w-4 h-4" />
              Vaqtni belgilash
            </label>
            <button
              onClick={() => setIsTimeOpen(!isTimeOpen)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              <span className="font-medium">
                {selectedTime || 'Vaqtni tanlang'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isTimeOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTimeOpen && (
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {timeSlots.map((slot) => {
                  const isBooked = bookedSlots.has(slot);
                  
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        if (!isBooked) {
                          setSelectedTime(slot);
                          setIsTimeOpen(false);
                        }
                      }}
                      disabled={isBooked}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        isBooked
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                          : selectedTime === slot
                          ? 'bg-blue-600 text-white border-2 border-blue-500'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
