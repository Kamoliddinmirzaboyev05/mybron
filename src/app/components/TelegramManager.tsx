import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function TelegramManager() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
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
