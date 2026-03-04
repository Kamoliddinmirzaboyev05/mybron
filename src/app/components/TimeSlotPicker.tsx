import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeSlotPickerProps {
  slots: string[];
  bookedSlots: Set<string>;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  pricePerHour: number;
}

export default function TimeSlotPicker({ 
  slots, 
  bookedSlots, 
  selectedSlots,
  onSlotsChange,
  pricePerHour 
}: TimeSlotPickerProps) {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Clear error when selection changes
    if (error) {
      setTimeout(() => setError(''), 3000);
    }
  }, [selectedSlots]);

  const getSlotHour = (slot: string): number => {
    const [startStr] = slot.split(' - ');
    return parseInt(startStr.split(':')[0]);
  };

  const isConsecutive = (newSlot: string, currentSlots: string[]): boolean => {
    if (currentSlots.length === 0) return true;

    const newHour = getSlotHour(newSlot);
    const selectedHours = currentSlots.map(getSlotHour).sort((a, b) => a - b);
    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);

    // Check if new slot is adjacent to the current range
    return newHour === minHour - 1 || newHour === maxHour + 1;
  };

  const areAllConsecutive = (slotsToCheck: string[]): boolean => {
    if (slotsToCheck.length <= 1) return true;

    const hours = slotsToCheck.map(getSlotHour).sort((a, b) => a - b);
    
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] !== hours[i - 1] + 1) {
        return false;
      }
    }
    
    return true;
  };

  const handleSlotClick = (slot: string) => {
    const isBooked = bookedSlots.has(slot);
    if (isBooked) return;

    const isSelected = selectedSlots.includes(slot);

    if (isSelected) {
      // Deselect - remove from selection
      const newSlots = selectedSlots.filter(s => s !== slot);
      
      // Check if remaining slots are still consecutive
      if (areAllConsecutive(newSlots)) {
        onSlotsChange(newSlots);
        setError('');
      } else {
        setError('Faqat ketma-ket soatlarni tanlash mumkin');
      }
    } else {
      // Select - add to selection
      const newSlots = [...selectedSlots, slot];
      
      if (isConsecutive(slot, selectedSlots)) {
        // Check if any slot in the range is booked
        const hours = newSlots.map(getSlotHour).sort((a, b) => a - b);
        const minHour = Math.min(...hours);
        const maxHour = Math.max(...hours);
        
        let hasBookedInRange = false;
        for (let h = minHour; h <= maxHour; h++) {
          const slotStr = `${h.toString().padStart(2, '0')}:00 - ${(h + 1).toString().padStart(2, '0')}:00`;
          if (bookedSlots.has(slotStr) && !newSlots.includes(slotStr)) {
            hasBookedInRange = true;
            break;
          }
        }
        
        if (hasBookedInRange) {
          setError('Tanlangan oraliqda band qilingan soatlar bor');
        } else {
          onSlotsChange(newSlots);
          setError('');
        }
      } else {
        setError('Faqat ketma-ket soatlarni tanlash mumkin');
      }
    }
  };

  const calculateTotalHours = (): number => {
    return selectedSlots.length;
  };

  const getTimeRange = (): string => {
    if (selectedSlots.length === 0) return '';
    
    const hours = selectedSlots.map(getSlotHour).sort((a, b) => a - b);
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    
    return `${minHour.toString().padStart(2, '0')}:00 - ${(maxHour + 1).toString().padStart(2, '0')}:00`;
  };

  const totalHours = calculateTotalHours();
  const timeRange = getTimeRange();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="text-sm font-semibold text-slate-300">Vaqtni tanlang</h3>
        {selectedSlots.length > 0 && (
          <button
            onClick={() => {
              onSlotsChange([]);
              setError('');
            }}
            className="text-xs text-blue-500 hover:text-blue-400"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="px-4 mb-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              Bir necha ketma-ket soatlarni tanlang. Har bir soat alohida tugma.
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 mb-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-300">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Time Slots Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {slots.map((slot) => {
          const isBooked = bookedSlots.has(slot);
          const isSelected = selectedSlots.includes(slot);
          
          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={isBooked}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                isBooked
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700 opacity-50'
                  : isSelected
                  ? 'bg-green-600 text-white border-2 border-green-500 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-blue-500'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {/* Selected Range Summary */}
      {selectedSlots.length > 0 && (
        <div className="mt-4 px-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Tanlangan vaqt:</span>
                <span className="text-white font-semibold">{timeRange}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Davomiyligi:</span>
                <span className="text-blue-400 font-semibold">{totalHours} soat</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Jami narx:</span>
                <span className="text-green-400 font-bold text-lg">
                  {(totalHours * pricePerHour).toLocaleString()} so'm
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex gap-4 mt-4 px-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-600" />
          <span className="text-slate-400">Tanlangan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-700 opacity-50" />
          <span className="text-slate-400">Band</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
          <span className="text-slate-400">Bo'sh</span>
        </div>
      </div>
    </div>
  );
}
