import { ChevronDown } from 'lucide-react';
import { toDateString } from '../lib/dateUtils';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const generateNext3Days = (): { date: Date; label: string; shortLabel: string }[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    
    return [
      { date: today, label: 'Bugun', shortLabel: 'Bugun' },
      { date: tomorrow, label: 'Ertaga', shortLabel: 'Ertaga' },
      { 
        date: dayAfter, 
        label: `${dayAfter.getDate()} ${monthNames[dayAfter.getMonth()]}`,
        shortLabel: `${dayAfter.getDate()} ${monthNames[dayAfter.getMonth()].slice(0, 3)}`
      },
    ];
  };

  const days = generateNext3Days();
  const selectedDateStr = toDateString(selectedDate);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 px-4">Sanani tanlang</h3>
      
      <div className="grid grid-cols-3 gap-2 px-4">
        {days.map((day, index) => {
          const isSelected = toDateString(day.date) === selectedDateStr;
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(day.date)}
              className={`py-3 px-3 rounded-lg font-medium text-sm transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-2 border-blue-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {day.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
