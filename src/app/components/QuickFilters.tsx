import { MapPin, DollarSign, Clock, Droplets } from 'lucide-react';

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export default function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  const filters = [
    { id: 'nearby', label: 'Yaqin masofada', icon: MapPin },
    { id: 'cheap', label: 'Eng arzon', icon: DollarSign },
    { id: '24/7', label: '24/7 ochiq', icon: Clock },
    { id: 'shower', label: 'Dushi bor', icon: Droplets },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(isActive ? null : filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
