export default function PitchCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-slate-800" />
      
      {/* Content skeleton */}
      <div className="p-3">
        <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
        <div className="h-3 bg-slate-800 rounded mb-3 w-full" />
        <div className="flex flex-col gap-2">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="h-8 bg-slate-800 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
