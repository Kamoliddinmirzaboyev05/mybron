import { AlertCircle, ExternalLink } from 'lucide-react';

export default function SetupBanner() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mx-4 mt-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-amber-500 font-semibold mb-1">Supabase Configuration Required</h3>
          <p className="text-sm text-slate-300 mb-3">
            To use this app, you need to connect it to your Supabase project. 
            Create a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">.env</code> file with your credentials.
          </p>
          <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-300 mb-3">
            <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=your_anon_key_here</div>
          </div>
          <a
            href="https://app.supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            Get credentials from Supabase Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
