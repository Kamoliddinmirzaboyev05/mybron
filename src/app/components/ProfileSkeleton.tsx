export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#020817] pb-20">
      <div className="max-w-md mx-auto animate-pulse">
        <div className="sticky top-0 bg-[#020817] z-10 px-4 pt-12 pb-4 border-b border-white/5">
          <div className="h-8 bg-white/5 rounded-xl w-32 mb-2" />
          <div className="h-4 bg-white/5 rounded-xl w-48" />
        </div>
        <div className="px-4 py-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-white/5 rounded-3xl mb-4" />
            <div className="h-6 bg-white/5 rounded-xl w-32 mb-2" />
            <div className="h-4 bg-white/5 rounded-xl w-40" />
          </div>
          <div className="bg-[#0d1526] rounded-2xl border border-white/5 mb-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-4 py-4 flex items-center gap-3 border-b border-white/5 last:border-0">
                <div className="w-9 h-9 bg-white/5 rounded-xl" />
                <div className="flex-1">
                  <div className="h-3 bg-white/5 rounded w-16 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-12 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
