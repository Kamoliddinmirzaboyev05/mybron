export default function NotificationSkeleton() {
  return (
    <div className="px-4 py-4 hover:bg-slate-900/50 transition-colors animate-pulse">
      <div className="flex gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-slate-800/50 rounded-full flex-shrink-0"></div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="h-5 bg-slate-800/50 rounded w-32"></div>
            <div className="h-4 bg-slate-800/50 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-800/50 rounded w-full"></div>
            <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
