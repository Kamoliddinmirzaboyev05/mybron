// Push Notification utilities for MYBRON PWA

export type NotifType = 'booking_confirmed' | 'booking_rejected' | 'booking_pending' | 'general';

export interface LocalNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  url?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'mybron_notifications';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// ─── Show notification ────────────────────────────────────────────────────────

export async function showNotification(
  title: string,
  options: { body: string; url?: string; type?: NotifType }
) {
  // Save to local store regardless
  saveLocalNotification({
    id: `notif-${Date.now()}`,
    type: options.type || 'general',
    title,
    body: options.body,
    url: options.url || '/',
    createdAt: new Date().toISOString(),
    read: false,
  });

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Use service worker if available for better mobile support
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body: options.body,
        icon: '/bronlogo.png',
        badge: '/bronlogo.png',
        vibrate: [200, 100, 200],
        data: { url: options.url || '/' },
      });
      return;
    }
  }

  new Notification(title, {
    body: options.body,
    icon: '/bronlogo.png',
  });
}

// ─── Booking notifications ────────────────────────────────────────────────────

export async function notifyBookingCreated(pitchName: string) {
  await showNotification('Bron so\'rov yuborildi ✅', {
    body: `${pitchName} uchun bron so'rovingiz admin tomonidan ko'rib chiqilmoqda.`,
    url: '/bookings',
    type: 'booking_pending',
  });
}

export async function notifyBookingConfirmed(pitchName: string, date: string, time: string) {
  await showNotification('Bron tasdiqlandi! 🎉', {
    body: `${pitchName} — ${date}, ${time}. Maydonni kutib turibdi!`,
    url: '/bookings',
    type: 'booking_confirmed',
  });
}

export async function notifyBookingRejected(pitchName: string) {
  await showNotification('Bron rad etildi ❌', {
    body: `${pitchName} uchun bron so'rovingiz rad etildi. Boshqa vaqt tanlang.`,
    url: '/bookings',
    type: 'booking_rejected',
  });
}

// ─── Local notification store ─────────────────────────────────────────────────

export function saveLocalNotification(notif: LocalNotification) {
  const existing = getLocalNotifications();
  const updated = [notif, ...existing].slice(0, 50); // max 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('mybron_notif_update'));
}

export function getLocalNotifications(): LocalNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markAllRead() {
  const notifs = getLocalNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('mybron_notif_update'));
}

export function getUnreadCount(): number {
  return getLocalNotifications().filter(n => !n.read).length;
}

export function clearNotifications() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('mybron_notif_update'));
}
