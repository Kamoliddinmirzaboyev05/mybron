import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Phone, ArrowRight, MessageSquare, User, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { formatPhoneNumber, isValidUzbekPhone } from '../lib/phoneFormatter';
import { motion, AnimatePresence } from 'motion/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../components/ui/input-otp';

type AuthStep = 'phone' | 'otp' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, signIn, signUp } = useAuth();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidUzbekPhone(phone)) {
      setError('Iltimos, to\'g\'ri telefon raqamini kiriting');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await sendOTP(phone);
      if (result.error) throw result.error;
      
      setStep('otp');
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Xabar yuborishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setCode(otpCode);
    if (otpCode.length !== 5) return;

    setError('');
    setLoading(true);
    try {
      const result = await verifyOTP(phone, otpCode);
      if (result.error) throw result.error;

      if (result.exists) {
        // User exists, logged in successfully
        const returnTo = sessionStorage.getItem('returnToPitch');
        if (returnTo) {
          sessionStorage.removeItem('returnToPitch');
          navigate(`/pitch/${returnTo}`);
        } else {
          navigate('/');
        }
      } else {
        // New user, need to register
        setStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Kod noto\'g\'ri');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Iltimos, ismingizni kiriting');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await signUp({
        phone,
        code,
        full_name: fullName
      });
      if (result.error) throw result.error;

      const returnTo = sessionStorage.getItem('returnToPitch');
      if (returnTo) {
        sessionStorage.removeItem('returnToPitch');
        navigate(`/pitch/${returnTo}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Xush kelibsiz</h1>
        <p className="text-slate-400 text-sm">
          Davom etish uchun telefon raqamingizni kiriting
        </p>
      </div>

      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Telefon raqami
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+998 00 000 00 00"
              required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isValidUzbekPhone(phone)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Kodni olish <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tasdiqlash kodi bizning <span className="text-blue-400 font-semibold">Telegram</span> botimiz orqali yuboriladi.
        </p>
      </div>
    </motion.div>
  );

  const renderOTPStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button 
        onClick={() => setStep('phone')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
      >
        <ChevronLeft size={18} /> Raqamni o'zgartirish
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Kodni kiriting</h1>
        <p className="text-slate-400 text-sm">
          Biz <span className="text-white font-medium">{phone}</span> raqamiga <br /> Telegram orqali kod yubordik
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <InputOTP
          maxLength={5}
          value={code}
          onChange={handleVerifyOTP}
          pattern={REGEXP_ONLY_DIGITS}
          disabled={loading}
          autoFocus
        >
          <InputOTPGroup className="gap-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="w-14 h-16 text-2xl font-bold bg-white/5 border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-slate-500 text-sm">
              Yangi kodni {timer} soniyadan keyin olishingiz mumkin
            </p>
          ) : (
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              Kodni qayta yuborish
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderRegisterStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Oxirgi qadam</h1>
        <p className="text-slate-400 text-sm">
          Ro'yxatdan o'tishni yakunlash uchun ismingizni kiriting
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
            To'liq ismingiz
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Azizbek Karimov"
              required
              autoFocus
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !fullName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Ro'yxatdan o'tish <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-3xl overflow-hidden bg-white/5 p-3 border border-white/10 mb-6 shadow-2xl shadow-blue-500/10 backdrop-blur-sm"
            >
              <img src="/bronlogo.png" alt="MYBRON" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-blue-500/50" />
              <span className="text-blue-500 font-bold tracking-widest text-xs uppercase">MyBron Platform</span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-blue-500/50" />
            </motion.div>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400 font-medium leading-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {step === 'phone' && renderPhoneStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'register' && renderRegisterStep()}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="py-8 px-6 text-center relative z-10">
        <p className="text-slate-600 text-xs">
          Tizimdan foydalanish orqali siz <br /> 
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Foydalanish shartlari</a> ga rozilik bildirasiz
        </p>
      </div>
    </div>
  );
}
