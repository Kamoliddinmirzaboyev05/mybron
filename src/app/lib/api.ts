// ============================================================
// API - Hozircha mock data ishlatilmoqda (backend yangilanmoqda)
// ============================================================

import {
  MOCK_USER,
  MOCK_ADMIN,
  MOCK_PITCHES,
  MOCK_BOOKINGS,
  MOCK_REVIEWS,
  MOCK_MY_REVIEWS,
  MOCK_FAVORITES,
  MOCK_ADMIN_STATS,
  generateMockSlots,
} from './mockData';

// Simulate network delay
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// Types
export interface User {
  id: string;
  fullName: string;
  login: string;
  role: 'user' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  fullName: string;
  login: string;
  phone: string;
  password: string;
  role?: 'user';
}

export interface LoginData {
  login: string;
  password: string;
}

export interface Pitch {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  pricePerHour: number;
  size: string;
  surface: string;
  description: string;
  amenities: string[];
  images: string[];
  openTime: string;
  closeTime: string;
  phone: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'manual';
  paymentMethod?: string;
  clientName?: string | null;
  clientPhone?: string | null;
  note?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;
  field?: Pitch;
}

export interface Review {
  id: string;
  fieldId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    fullName: string;
  };
}

export interface FieldSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FieldSlotsResponse {
  dates: {
    date: string;
    dayLabel: string;
    slots: FieldSlot[];
  }[];
}

// In-memory mock state (resets on page refresh — intentional for dev)
let mockFavorites = [...MOCK_FAVORITES];
let mockBookings = [...MOCK_BOOKINGS];
let mockReviews: Record<string, Review[]> = {
  'pitch-1': [...(MOCK_REVIEWS['pitch-1'] || [])],
  'pitch-2': [...(MOCK_REVIEWS['pitch-2'] || [])],
  'pitch-3': [...(MOCK_REVIEWS['pitch-3'] || [])],
  'pitch-4': [...(MOCK_REVIEWS['pitch-4'] || [])],
};
let mockMyReviews = [...MOCK_MY_REVIEWS];

// API Client (mock mode)
class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Auth methods
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay();
    const user: User = {
      id: `user-${Date.now()}`,
      fullName: data.fullName,
      login: data.login,
      role: 'user',
      phone: data.phone,
    };
    this.setToken('mock-token-' + user.id);
    this.setUser(user);
    return { user, token: 'mock-token-' + user.id };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    await delay();
    // admin / user login
    const user = data.login === 'admin' ? MOCK_ADMIN : MOCK_USER;
    this.setToken('mock-token-' + user.id);
    this.setUser(user);
    return { user, token: 'mock-token-' + user.id };
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getProfile(): Promise<User> {
    await delay(200);
    const stored = this.getUser();
    if (!stored) throw new Error('Not authenticated');
    return stored;
  }

  // Field/Pitch methods
  async getFields(): Promise<Pitch[]> {
    await delay();
    return MOCK_PITCHES;
  }

  async getFieldById(id: string): Promise<Pitch> {
    await delay();
    const pitch = MOCK_PITCHES.find(p => p.id === id);
    if (!pitch) throw new Error('Maydon topilmadi');
    return pitch;
  }

  // Booking methods
  async getBookings(_userId: string): Promise<Booking[]> {
    await delay();
    return mockBookings;
  }

  async createBooking(bookingData: {
    fieldId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    note?: string;
  }): Promise<Booking> {
    await delay();
    const field = MOCK_PITCHES.find(p => p.id === bookingData.fieldId);
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: 'user-1',
      fieldId: bookingData.fieldId,
      bookingDate: bookingData.bookingDate,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      totalPrice: bookingData.totalPrice,
      status: 'pending',
      paymentMethod: 'cash',
      clientName: MOCK_USER.fullName,
      clientPhone: MOCK_USER.phone,
      note: bookingData.note || null,
      createdAt: new Date().toISOString(),
      field,
    };
    mockBookings = [newBooking, ...mockBookings];
    return newBooking;
  }

  async bookSlot(slotData: {
    slotId: string;
    fieldId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<Booking> {
    await delay();
    const field = MOCK_PITCHES.find(p => p.id === slotData.fieldId);
    const hours =
      parseInt(slotData.endTime.split(':')[0]) -
      parseInt(slotData.startTime.split(':')[0]);
    const totalPrice = (field?.pricePerHour || 0) * hours;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: 'user-1',
      fieldId: slotData.fieldId,
      bookingDate: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      totalPrice,
      status: 'pending',
      paymentMethod: 'cash',
      clientName: MOCK_USER.fullName,
      clientPhone: MOCK_USER.phone,
      note: null,
      createdAt: new Date().toISOString(),
      field,
    };
    mockBookings = [newBooking, ...mockBookings];
    return newBooking;
  }

  async getFieldSlots(pitchId: string, dateStr: string): Promise<FieldSlotsResponse> {
    await delay();
    return generateMockSlots(pitchId, dateStr);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    await delay();
    mockBookings = mockBookings.map(b =>
      b.id === bookingId ? { ...b, status: status as Booking['status'] } : b
    );
    const updated = mockBookings.find(b => b.id === bookingId);
    if (!updated) throw new Error('Bron topilmadi');
    return updated;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await delay();
    mockBookings = mockBookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
  }

  // Admin methods
  async getAdminBookings(_status?: string): Promise<Booking[]> {
    await delay();
    return mockBookings;
  }

  async getAllBookings(_status?: string): Promise<Booking[]> {
    await delay();
    return mockBookings;
  }

  async getAdminStats(): Promise<{ todayRevenue: number; totalRevenue: number; balance: number }> {
    await delay();
    return MOCK_ADMIN_STATS;
  }

  // Favorite methods
  async getFavorites(): Promise<{ id: string; fieldId: string }[]> {
    await delay(200);
    return mockFavorites;
  }

  async addFavorite(fieldId: string): Promise<{ id: string; fieldId: string }> {
    await delay(200);
    const fav = { id: `fav-${Date.now()}`, fieldId };
    mockFavorites = [...mockFavorites, fav];
    return fav;
  }

  async removeFavorite(fieldId: string): Promise<void> {
    await delay(200);
    mockFavorites = mockFavorites.filter(f => f.fieldId !== fieldId);
  }

  // Review methods
  async getReviews(fieldId: string): Promise<Review[]> {
    await delay();
    return mockReviews[fieldId] || [];
  }

  async getMyReviews(): Promise<Review[]> {
    await delay();
    return mockMyReviews;
  }

  async submitReview(reviewData: {
    fieldId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    await delay();
    const newReview: Review = {
      id: `review-${Date.now()}`,
      fieldId: reviewData.fieldId,
      userId: 'user-1',
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      user: { fullName: MOCK_USER.fullName },
    };
    mockReviews[reviewData.fieldId] = [
      newReview,
      ...(mockReviews[reviewData.fieldId] || []),
    ];
    mockMyReviews = [newReview, ...mockMyReviews];
    return newReview;
  }

  // Utility methods
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export const api = new ApiClient();
