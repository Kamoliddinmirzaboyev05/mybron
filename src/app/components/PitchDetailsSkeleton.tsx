import { ArrowLeft } from 'lucide-react';

export default function PitchDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#020817] pb-24">
      <div className="max-w-md mx-auto">
        {/* Image Slider Skeleton */}
        <div className="relative">
          <button
            disabled
            className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="aspect-video bg-slate-800 animate-pulse" />
        </div>

        {/* Pitch Info Skeleton */}
        <div className="px-4 py-6">
          {/* Title Skeleton */}
          <div className="h-8 bg-slate-800 rounded-lg w-3/4 mb-3 animate-pulse" />
          
          {/* Location Skeleton */}
          <div className="flex items-start mb-2">
            <div className="w-4 h-4 bg-slate-800 rounded mr-2 mt-0.5 animate-pulse" />
            <div className="h-5 bg-slate-800 rounded w-2/3 animate-pulse" />
          </div>
          
          {/* Landmark Skeleton */}
          <div className="h-4 bg-slate-800 rounded w-1/2 mb-4 animate-pulse" />

          {/* Price Card Skeleton */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-800 rounded w-16 mb-2 animate-pulse" />
                <div className="h-10 bg-slate-800 rounded w-32 mb-1 animate-pulse" />
                <div className="h-4 bg-slate-800 rounded w-20 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-slate-800 rounded w-20 mb-2 animate-pulse" />
                <div className="h-6 bg-slate-800 rounded w-28 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Amenities Skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-slate-800 rounded w-24 mb-3 animate-pulse" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 animate-pulse"
                >
                  <div className="w-4 h-4 bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-800 rounded w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section Skeleton */}
          <div className="mb-6">
            <div className="h-5 bg-slate-800 rounded w-32 mb-4 animate-pulse" />
            
            {/* Review Cards */}
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-900 rounded-xl p-4 mb-3 border border-slate-800">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-800 rounded w-24 mb-2 animate-pulse" />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-4 h-4 bg-slate-800 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-full animate-pulse" />
                  <div className="h-3 bg-slate-800 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Bottom Bar Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="w-full h-14 bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
