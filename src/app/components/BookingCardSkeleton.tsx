export default function BookingCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <div className="p-4 animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-6 bg-slate-800/50 rounded w-2/3"></div>
          <div className="h-6 bg-slate-800/50 rounded-full w-20"></div>
        </div>

        {/* Date and Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-800/50 rounded mr-2"></div>
            <div className="h-4 bg-slate-800/50 rounded w-40"></div>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-800/50 rounded mr-2"></div>
            <div className="h-4 bg-slate-800/50 rounded w-32"></div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-950 rounded-lg p-3 mb-3">
          <div className="h-3 bg-slate-800/50 rounded w-24 mb-2"></div>
          <div className="space-y-1">
            <div className="h-4 bg-slate-800/50 rounded w-full"></div>
            <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
