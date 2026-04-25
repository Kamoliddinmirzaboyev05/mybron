// ============================================================
// MOCK DATA - Backend tayyor bo'lguncha ishlatiladi
// ============================================================

import type { User, Pitch, Booking, Review, FieldSlot, FieldSlotsResponse } from './api';

export const MOCK_USER: User = {
  id: 'user-1',
  fullName: 'Ali Valiyev',
  login: 'ali_valiyev',
  role: 'user',
  phone: '+998901234567',
};

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  fullName: 'Admin Adminov',
  login: 'admin',
  role: 'admin',
  phone: '+998901111111',
};

export const MOCK_PITCHES: Pitch[] = [
  {
    id: 'pitch-1',
    userId: 'admin-1',
    name: 'City Sports Complex',
    address: 'Amir Temur ko\'chasi 15',
    city: 'Toshkent',
    lat: 41.2995,
    lng: 69.2401,
    pricePerHour: 150000,
    size: '5x5',
    surface: 'Sun\'iy o\'t',
    description: 'Zamonaviy futbol maydoni, yoritish tizimi bilan jihozlangan.',
    amenities: ['Dush', 'Parkovka', 'Yoritish', 'Kafe'],
    images: [],
    openTime: '08:00',
    closeTime: '23:00',
    phone: '+998901234567',
    isActive: true,
    rating: 4.8,
    reviewCount: 24,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pitch-2',
    userId: 'admin-1',
    name: 'Elite Arena',
    address: 'Yunusobod tumani, 7-mavze',
    city: 'Toshkent',
    lat: 41.3425,
    lng: 69.2878,
    pricePerHour: 200000,
    size: '7x7',
    surface: 'Tabiiy o\'t',
    description: 'Professional darajadagi futbol maydoni.',
    amenities: ['Dush', 'Kiyinish xonasi', 'Parkovka', 'WiFi'],
    images: [],
    openTime: '07:00',
    closeTime: '22:00',
    phone: '+998907654321',
    isActive: true,
    rating: 4.5,
    reviewCount: 18,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'pitch-3',
    userId: 'admin-1',
    name: 'Stadium Pro',
    address: 'Chilonzor tumani, 9-mavze',
    city: 'Toshkent',
    lat: 41.2756,
    lng: 69.2034,
    pricePerHour: 120000,
    size: '5x5',
    surface: 'Sun\'iy o\'t',
    description: 'Qulay narxda sifatli futbol maydoni.',
    amenities: ['Dush', 'Yoritish'],
    images: [],
    openTime: '09:00',
    closeTime: '21:00',
    phone: '+998909876543',
    isActive: true,
    rating: 4.2,
    reviewCount: 31,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'pitch-4',
    userId: 'admin-1',
    name: 'Green Field',
    address: 'Mirzo Ulug\'bek tumani',
    city: 'Toshkent',
    lat: 41.3201,
    lng: 69.3012,
    pricePerHour: 180000,
    size: '6x6',
    surface: 'Sun\'iy o\'t',
    description: 'Yashil maydon, barcha qulayliklar bilan.',
    amenities: ['Dush', 'Parkovka', 'Kafe', 'WiFi', 'Yoritish'],
    images: [],
    openTime: '08:00',
    closeTime: '23:00',
    phone: '+998905551234',
    isActive: true,
    rating: 4.6,
    reviewCount: 12,
    createdAt: '2024-04-01T00:00:00Z',
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    fieldId: 'pitch-1',
    bookingDate: '2026-04-28',
    startTime: '18:00',
    endTime: '20:00',
    totalPrice: 300000,
    status: 'pending',
    paymentMethod: 'cash',
    clientName: 'Ali Valiyev',
    clientPhone: '+998901234567',
    note: null,
    createdAt: '2026-04-25T10:00:00Z',
    field: MOCK_PITCHES[0],
  },
  {
    id: 'booking-2',
    userId: 'user-1',
    fieldId: 'pitch-2',
    bookingDate: '2026-04-26',
    startTime: '16:00',
    endTime: '18:00',
    totalPrice: 400000,
    status: 'confirmed',
    paymentMethod: 'cash',
    clientName: 'Ali Valiyev',
    clientPhone: '+998901234567',
    note: null,
    createdAt: '2026-04-24T09:00:00Z',
    field: MOCK_PITCHES[1],
  },
  {
    id: 'booking-3',
    userId: 'user-1',
    fieldId: 'pitch-3',
    bookingDate: '2026-04-20',
    startTime: '14:00',
    endTime: '15:00',
    totalPrice: 120000,
    status: 'rejected',
    paymentMethod: 'cash',
    clientName: 'Ali Valiyev',
    clientPhone: '+998901234567',
    note: null,
    createdAt: '2026-04-19T08:00:00Z',
    field: MOCK_PITCHES[2],
  },
];

export const MOCK_REVIEWS: Record<string, Review[]> = {
  'pitch-1': [
    {
      id: 'review-1',
      fieldId: 'pitch-1',
      userId: 'user-2',
      rating: 5,
      comment: 'Ajoyib maydon, hammasi zo\'r!',
      createdAt: '2026-04-20T10:00:00Z',
      user: { fullName: 'Bobur Toshmatov' },
    },
    {
      id: 'review-2',
      fieldId: 'pitch-1',
      userId: 'user-3',
      rating: 4,
      comment: 'Yaxshi maydon, narxi ham qulay.',
      createdAt: '2026-04-18T14:00:00Z',
      user: { fullName: 'Jasur Karimov' },
    },
  ],
  'pitch-2': [
    {
      id: 'review-3',
      fieldId: 'pitch-2',
      userId: 'user-4',
      rating: 5,
      comment: 'Professional daraja, tavsiya qilaman!',
      createdAt: '2026-04-22T11:00:00Z',
      user: { fullName: 'Sardor Umarov' },
    },
  ],
  'pitch-3': [],
  'pitch-4': [],
};

export const MOCK_MY_REVIEWS: Review[] = [
  {
    id: 'my-review-1',
    fieldId: 'pitch-1',
    userId: 'user-1',
    rating: 5,
    comment: 'Juda yaxshi maydon!',
    createdAt: '2026-04-15T10:00:00Z',
    user: { fullName: 'Ali Valiyev' },
  },
];

export const MOCK_FAVORITES: { id: string; fieldId: string }[] = [
  { id: 'fav-1', fieldId: 'pitch-1' },
];

// Generate time slots for a given pitch and date
export function generateMockSlots(pitchId: string, dateStr: string): FieldSlotsResponse {
  const pitch = MOCK_PITCHES.find(p => p.id === pitchId);
  const openHour = parseInt(pitch?.openTime?.split(':')[0] || '8');
  const closeHour = parseInt(pitch?.closeTime?.split(':')[0] || '22');

  const slots: FieldSlot[] = [];
  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];

  for (let h = openHour; h < closeHour; h++) {
    const startTime = `${String(h).padStart(2, '0')}:00`;
    const endTime = `${String(h + 1).padStart(2, '0')}:00`;

    // Mark past slots as unavailable for today
    const isPast = isToday && h <= now.getHours();
    // Randomly mark some slots as booked
    const isBooked = ['pitch-1'].includes(pitchId) && [18, 19].includes(h) && dateStr === '2026-04-28';

    slots.push({
      id: `slot-${pitchId}-${dateStr}-${h}`,
      startTime,
      endTime,
      isAvailable: !isPast && !isBooked,
    });
  }

  const date = new Date(dateStr);
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  return {
    dates: [
      {
        date: dateStr,
        dayLabel: days[date.getDay()],
        slots,
      },
    ],
  };
}

export const MOCK_ADMIN_STATS = {
  todayRevenue: 1500000,
  totalRevenue: 45000000,
  balance: 12000000,
};
