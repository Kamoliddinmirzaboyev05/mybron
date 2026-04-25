import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn(login, password);
      if (result.error) throw result.error;
      const returnTo = sessionStorage.getItem('returnToPitch');
      if (returnTo) { sessionStorage.removeItem('returnToPitch'); navigate(`/pitch/${returnTo}`); }
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">
      {/* Top gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -top-20 right-0 w-60 h-60 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
        <div className="max-w-sm mx-auto w-full">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 p-2 border border-white/10 mb-5 shadow-xl shadow-blue-500/10">
              <img src="/bronlogo.png" alt="MYBRON" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Xush kelibsiz</h1>
            <p className="text-slate-500 text-sm text-center">
              Maydonlarni band qilish uchun tizimga kiring
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Login
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="login yoki +998..."
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white py-3.5 rounded-lg font-bold transition-all active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Kirish <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-4 p-3 rounded-lg bg-white/3 border border-white/5 text-center">
            <p className="text-slate-600 text-xs">
              Test: <span className="text-slate-400">admin</span> yoki <span className="text-slate-400">ali_valiyev</span> / istalgan parol
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Hisobingiz yo'qmi?{' '}
              <button onClick={() => navigate('/register')} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Ro'yxatdan o'tish
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
