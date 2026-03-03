import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const generateNext7Days = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const days = generateNext7Days();
  const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="text-sm font-semibold text-slate-300">Sanani tanlang</h3>
        <div className="flex gap-2">
          <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
        {days.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(date)}
              className={`flex flex-col items-center justify-center min-w-[60px] py-3 px-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-xs font-medium mb-1">
                {dayNames[date.getDay()]}
              </span>
              <span className="text-lg font-bold">
                {date.getDate()}
              </span>
              <span className="text-xs opacity-75">
                {monthNames[date.getMonth()]}
              </span>
              {isTodayDate && (
                <span className="text-[10px] mt-1 opacity-75">Bugun</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
