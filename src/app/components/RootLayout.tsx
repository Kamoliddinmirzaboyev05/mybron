import { Outlet } from 'react-router';
import TelegramManager from './TelegramManager';

export default function RootLayout() {
  return (
    <>
      <TelegramManager />
      <Outlet />
    </>
  );
}
