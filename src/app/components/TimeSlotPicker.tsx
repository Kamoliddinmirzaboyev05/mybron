interface TimeSlotPickerProps {
  slots: string[];
  bookedSlots: Set<string>;
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
}

export default function TimeSlotPicker({ slots, bookedSlots, selectedSlot, onSlotSelect }: TimeSlotPickerProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 px-4">Vaqtni tanlang</h3>
      <div className="grid grid-cols-3 gap-2 px-4">
        {slots.map((slot) => {
          const isBooked = bookedSlots.has(slot);
          const isSelected = selectedSlot === slot;
          
          return (
            <button
              key={slot}
              onClick={() => !isBooked && onSlotSelect(slot)}
              disabled={isBooked}
              className={`px-3 py-3 rounded-lg font-medium text-sm transition-all ${
                isBooked
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  : isSelected
                  ? 'bg-green-600 text-white border-2 border-green-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-blue-500'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-4 px-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-600" />
          <span className="text-slate-400">Tanlangan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-700" />
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
