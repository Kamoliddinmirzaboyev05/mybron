import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { formatPhoneNumber, cleanPhoneNumber, isValidUzbekPhone } from '../lib/phoneFormatter';

const inputCls = "w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-all";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [login, setLogin] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.startsWith('+998')) { setPhone('+998 '); return; }
    setPhone(formatPhoneNumber(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanedPhone = cleanPhoneNumber(phone);
    if (!isValidUzbekPhone(cleanedPhone)) { setError('Telefon raqami noto\'g\'ri (+998 XX XXX XX XX)'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak'); return; }
    setLoading(true);
    try {
      const result = await signUp(fullName, login, cleanedPhone, password);
      if (result.error) throw result.error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-500/15 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Ro'yxatdan o'tdingiz!</h1>
          <p className="text-slate-500 mb-8">Hisobingiz muvaffaqiyatli yaratildi.</p>
          <button
            onClick={() => {
              const returnTo = sessionStorage.getItem('returnToPitch');
              if (returnTo) { sessionStorage.removeItem('returnToPitch'); navigate(`/pitch/${returnTo}`); }
              else navigate('/');
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-colors"
          >
            Boshlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
        <div className="max-w-sm mx-auto w-full">

          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 p-2 border border-white/10 mb-5 shadow-xl shadow-blue-500/10">
              <img src="/bronlogo.png" alt="MYBRON" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Hisob yaratish</h1>
            <p className="text-slate-500 text-sm text-center">Maydonlarni band qilish uchun ro'yxatdan o'ting</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'To\'liq ism', icon: User, type: 'text', value: fullName, onChange: (v: string) => setFullName(v), placeholder: 'Jasur Toshmatov' },
              { label: 'Login', icon: Mail, type: 'text', value: login, onChange: (v: string) => setLogin(v), placeholder: 'jasur_t' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{field.label}</label>
                <div className="relative">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={field.type} value={field.value} onChange={e => field.onChange(e.target.value)} placeholder={field.placeholder} required className={inputCls} />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="+998 90 123 45 67" required className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputCls} />
              </div>
              <p className="text-xs text-slate-600 mt-1.5">Kamida 6 ta belgi</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Ro'yxatdan o'tish <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Hisobingiz bormi?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Kirish
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
