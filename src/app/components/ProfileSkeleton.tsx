export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="max-w-md mx-auto animate-pulse">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 px-4 py-6 border-b border-slate-800">
          <div className="h-8 bg-slate-800/50 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-800/50 rounded w-48"></div>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full mb-4"></div>
            <div className="h-6 bg-slate-800/50 rounded w-32 mb-2"></div>
            <div className="h-4 bg-slate-800/50 rounded w-40"></div>
          </div>

          {/* Account Info */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="h-4 bg-slate-800/50 rounded w-40"></div>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="px-4 py-4 flex items-center">
                <div className="w-5 h-5 bg-slate-800/50 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-800/50 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-slate-800/50 rounded w-48"></div>
                </div>
              </div>
              <div className="px-4 py-4 flex items-center">
                <div className="w-5 h-5 bg-slate-800/50 rounded mr-3"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-800/50 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-slate-800/50 rounded w-40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="h-4 bg-slate-800/50 rounded w-32"></div>
            </div>
            <div className="divide-y divide-slate-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-5 h-5 bg-slate-800/50 rounded mr-3"></div>
                    <div className="h-4 bg-slate-800/50 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-slate-800/50 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="h-4 bg-slate-800/50 rounded w-32"></div>
            </div>
            <div className="divide-y divide-slate-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-4 flex items-center justify-between">
                  <div className="h-4 bg-slate-800/50 rounded w-32"></div>
                  <div className="w-5 h-5 bg-slate-800/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="h-12 bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
