import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { formatPhoneNumber, cleanPhoneNumber, isValidUzbekPhone } from '../lib/phoneFormatter';
import { 
  User, Lock, Mail, Phone, AlertCircle, CheckCircle, 
  ArrowRight, Eye, EyeOff 
} from 'lucide-react';

interface FormErrors {
  first_name?: string;
  last_name?: string;
  login?: string;
  phone?: string;
  password?: string;
  password2?: string;
  terms?: string;
  general?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    login: '',
    phone: '+998 ',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field as keyof typeof form]);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'first_name':
        if (!value.trim()) error = 'Ism kiritilishi shart';
        else if (value.trim().length < 2) error = 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak';
        break;
      case 'last_name':
        if (!value.trim()) error = 'Familiya kiritilishi shart';
        else if (value.trim().length < 2) error = 'Familiya kamida 2 ta harfdan iborat bo\'lishi kerak';
        break;
      case 'login':
        if (!value.trim()) error = 'Login kiritilishi shart';
        else if (value.length < 3) error = 'Login kamida 3 ta belgidan iborat bo\'lishi kerak';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Login faqat harf, raqam va underscore (_) dan iborat bo\'lishi mumkin';
        break;
      case 'phone': {
        const cleaned = cleanPhoneNumber(value);
        if (!value.trim()) error = 'Telefon raqami kiritilishi shart';
        else if (!isValidUzbekPhone(cleaned)) error = 'Telefon raqami noto\'g\'ri formatda (+998 XX XXX XX XX)';
        break;
      }
      case 'password':
        if (!value) error = 'Parol kiritilishi shart';
        else if (value.length < 8) error = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak';
        else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) error = 'Parol kamida bitta harf va bitta raqamdan iborat bo\'lishi kerak';
        break;
      case 'password2':
        if (!value) error = 'Parolni tasdiqlang';
        else if (value !== form.password) error = 'Parollar mos kelmadi';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { label: 'Juda zaif', color: 'bg-red-500', width: '25%' },
      { label: 'Zaif', color: 'bg-orange-500', width: '50%' },
      { label: 'O\'rtacha', color: 'bg-yellow-500', width: '75%' },
      { label: 'Kuchli', color: 'bg-emerald-500', width: '100%' },
    ];
    return levels[Math.min(score, 3)];
  };

  const strength = getPasswordStrength(form.password);

  const isFormValid = () => {
    return (
      form.first_name.trim().length >= 2 &&
      form.last_name.trim().length >= 2 &&
      form.login.length >= 3 &&
      /^[a-zA-Z0-9_]+$/.test(form.login) &&
      isValidUzbekPhone(cleanPhoneNumber(form.phone)) &&
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /[0-9]/.test(form.password) &&
      form.password === form.password2 &&
      agreeTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.keys(form).forEach(key => {
      setTouched(prev => ({ ...prev, [key]: true }));
      validateField(key, form[key as keyof typeof form]);
    });
    if (!agreeTerms) {
      setErrors(prev => ({ ...prev, terms: 'Foydalanish shartlariga rozilik bildiring' }));
    }
    if (!isFormValid()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, general: undefined }));
    try {
      const result = await signUp({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        login: form.login.trim(),
        phone: cleanPhoneNumber(form.phone),
        password: form.password,
        password2: form.password2,
      });
      if (result.error) throw result.error;
      setSuccess(true);
    } catch (err: any) {
      const msg = err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
      setErrors(prev => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Ro'yxatdan o'tdingiz!</h1>
          <p className="text-slate-500 mb-8">Hisobingiz muvaffaqiyatli yaratildi.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-colors"
          >
            Boshlash
          </button>
        </div>
      </div>
    );
  }

  const inputBase = "w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all";
  const inputError = "border-red-500/40 focus:border-red-500/60";
  const inputNormal = "border-white/10";

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col overflow-y-auto">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 p-2 border border-white/10 mb-5 shadow-xl shadow-blue-500/10">
              <img src="/bronlogo.png" alt="MYBRON" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Hisob yaratish</h1>
            <p className="text-slate-500 text-sm text-center">Maydonlarni band qilish uchun ro'yxatdan o'ting</p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ism</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={e => updateField('first_name', e.target.value)}
                    onBlur={() => handleBlur('first_name')}
                    placeholder="Ali"
                    className={`${inputBase} ${touched.first_name && errors.first_name ? inputError : inputNormal}`}
                  />
                </div>
                {touched.first_name && errors.first_name && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Familiya</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={e => updateField('last_name', e.target.value)}
                    onBlur={() => handleBlur('last_name')}
                    placeholder="Valiyev"
                    className={`${inputBase} ${touched.last_name && errors.last_name ? inputError : inputNormal}`}
                  />
                </div>
                {touched.last_name && errors.last_name && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Foydalanuvchi nomi (Login)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={form.login}
                  onChange={e => updateField('login', e.target.value)}
                  onBlur={() => handleBlur('login')}
                  placeholder="ali_valiyev"
                  className={`${inputBase} ${touched.login && errors.login ? inputError : inputNormal}`}
                />
              </div>
              {touched.login && errors.login ? (
                <p className="text-xs text-red-400 mt-1.5">{errors.login}</p>
              ) : (
                <p className="text-xs text-slate-600 mt-1.5">Kamida 3 ta belgi, faqat harf va raqam</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Telefon raqami</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => {
                    let v = e.target.value;
                    if (!v.startsWith('+998')) { v = '+998 '; }
                    const formatted = formatPhoneNumber(v);
                    setForm(prev => ({ ...prev, phone: formatted }));
                    if (touched.phone) validateField('phone', formatted);
                  }}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+998 90 123 45 67"
                  className={`${inputBase} ${touched.phone && errors.phone ? inputError : inputNormal}`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-xs text-red-400 mt-1.5">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`${inputBase} pr-12 ${touched.password && errors.password ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{strength.label}</p>
                </div>
              )}
              {touched.password && errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parolni tasdiqlang</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  value={form.password2}
                  onChange={e => updateField('password2', e.target.value)}
                  onBlur={() => handleBlur('password2')}
                  placeholder="••••••••"
                  className={`${inputBase} pr-12 ${touched.password2 && errors.password2 ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password2 && errors.password2 && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password2}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(!agreeTerms);
                  if (!agreeTerms) setErrors(prev => ({ ...prev, terms: undefined }));
                }}
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreeTerms ? 'bg-blue-600 border-blue-600' : 'border-white/20 bg-white/5'}`}
              >
                {agreeTerms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </button>
              <div>
                <p className="text-sm text-slate-400">
                  <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className="text-slate-300 hover:text-white transition-colors">
                    Foydalanish shartlari
                  </button> ga va{' '}
                  <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className="text-slate-300 hover:text-white transition-colors">
                    maxfiylik siyosati
                  </button> ga roziman
                </p>
                {errors.terms && <p className="text-xs text-red-400 mt-1">{errors.terms}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 mt-2"
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
