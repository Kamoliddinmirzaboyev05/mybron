import { motion } from 'motion/react';
import { MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';

export default function Login() {
  const BOT_USERNAME = 'GoBronBot';
  const BOT_URL = `https://t.me/${BOT_USERNAME}`;

  const handleLoginClick = () => {
    window.location.href = BOT_URL;
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl"
        >
          {/* Logo/Icon */}
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Tizimga kirish</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              GoBron Mini App-dan foydalanish uchun Telegram botimiz orqali kiring
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLoginClick}
              className="w-full group flex items-center justify-between bg-blue-600 hover:bg-blue-500 text-white px-6 py-5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span>Telegram orqali kirish</span>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              Botga o'tganingizdan so'ng, "Start" tugmasini bosing
            </p>
          </div>

          {/* Info Card */}
          <div className="mt-10 p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Nega Telegram?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Xavfsizlik va qulaylik uchun biz Telegram-ning rasmiy autentifikatsiyasidan foydalanamiz. Hech qanday parol kerak emas.
            </p>
          </div>
        </motion.div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a 
            href={BOT_URL}
            className="text-slate-500 hover:text-blue-400 text-sm font-medium transition-colors"
          >
            @{BOT_USERNAME}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
