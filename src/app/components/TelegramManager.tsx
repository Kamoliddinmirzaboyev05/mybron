import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function TelegramManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const { webAuth } = useAuth();

  useEffect(() => {
    // 1. Check for Magic Token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('token');

    if (magicToken) {
      const handleMagicAuth = async () => {
        const { user, error } = await webAuth(magicToken);
        
        if (error) {
          console.error("Token xato yoki eskirgan:", error);
          toast.error("Kirish havolasi eskirgan. Iltimos, botdan qayta kiring.");
          // Redirect to bot
          setTimeout(() => {
            window.location.href = 'https://t.me/GoBronBot';
          }, 2000);
          return;
        }

        if (user) {
          // Role bo'yicha redirect
          if (user.user_role === 'OWNER') {
            window.location.href = 'https://gobrononline.webportfolio.uz';
          } else {
            // PLAYER or other
            navigate('/player-dashboard');
          }
        }
      };

      handleMagicAuth();
    }

    // 2. Telegram WebApp initialization
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Expand the app
    tg.expand();

    // Handle BackButton visibility
    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    // Handle BackButton click
    const handleBackClick = () => {
      navigate(-1);
    };

    tg.BackButton.onClick(handleBackClick);

    // Cleanup
    return () => {
      tg.BackButton.offClick(handleBackClick);
    };
  }, [location.pathname, navigate]);

  return null;
}
