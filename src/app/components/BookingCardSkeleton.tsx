export default function BookingCardSkeleton() {
  return (
    <div className="bg-[#0d1526]/50 rounded-[32px] overflow-hidden border border-white/5 shadow-sm">
      <div className="p-5 animate-pulse">
        {/* Top Info */}
        <div className="flex gap-4 mb-5">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex-shrink-0" />
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="h-5 bg-white/5 rounded-lg w-3/4" />
            <div className="h-4 bg-white/5 rounded-lg w-1/4" />
            <div className="h-3 bg-white/5 rounded-lg w-1/2 mt-1" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="h-14 bg-white/5 rounded-2xl" />
          <div className="h-14 bg-white/5 rounded-2xl" />
        </div>

        {/* Payment Info */}
        <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
      </div>
    </div>
  );
}
