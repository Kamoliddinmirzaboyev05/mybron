// ============================================================
// API - Backend integration (auth connected to real API)
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

const BASE_URL = 'http://127.0.0.1:8000/api';

// Simulate network delay for mock endpoints
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// Types
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  fullName: string;
  login: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar_url?: string | null;
  date_joined?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  login: string;
  phone: string;
  password: string;
  password2: string;
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

// API Client
class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && retry && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          return this.request<T>(endpoint, options, false);
        } catch {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Sessiya tugadi. Iltimos, qayta kiring.');
        }
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || errorData.message || Object.values(errorData).flat().join(', ') || `Xatolik: ${response.status}`;
      throw new Error(errorMsg);
    }

    return response.json();
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token');
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: this.refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    this.accessToken = data.access;
    localStorage.setItem('access_token', data.access);
  }

  private normalizeUser(data: any): User {
    return {
      ...data,
      id: String(data.id),
      fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      login: data.username,
    };
  }

  // Auth methods (real API)
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        username: data.login,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        password: data.password,
        password2: data.password2,
        role: data.role || 'user',
      }),
    });
    const user = this.normalizeUser(res.user);
    this.setTokens(res.access, res.refresh);
    this.setUser(user);
    return { user, access: res.access, refresh: res.refresh };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username: data.login, password: data.password }),
    });
    const user = this.normalizeUser(res.user);
    this.setTokens(res.access, res.refresh);
    this.setUser(user);
    return { user, access: res.access, refresh: res.refresh };
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } catch {}
    this.clearTokens();
  }

  async getProfile(): Promise<User> {
    const user = await this.request<any>('/auth/profile/');
    const normalized = this.normalizeUser(user);
    this.setUser(normalized);
    return normalized;
  }

  // Field/Pitch methods (real API)
  async getFields(): Promise<Pitch[]> {
    const res = await this.request<any>('/fields/');
    return (res.results || []).map((f: any) => this.normalizeField(f));
  }

  async getFieldById(id: string): Promise<Pitch> {
    const res = await this.request<any>(`/fields/${id}/`);
    return this.normalizeField(res);
  }

  private normalizeField(apiField: any): Pitch {
    const images: string[] = [];
    if (apiField.cover_image_url) images.push(apiField.cover_image_url);

    // Parse location_url for lat/lng if it's a Google Maps URL
    let lat: number | null = null;
    let lng: number | null = null;
    if (apiField.location_url) {
      const match = apiField.location_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    return {
      id: String(apiField.id),
      userId: String(apiField.owner || apiField.user_id || ''),
      name: apiField.name,
      address: apiField.address || '',
      city: apiField.city || '',
      lat,
      lng,
      pricePerHour: parseFloat(apiField.price_per_hour) || 0,
      size: apiField.size || '',
      surface: apiField.surface || '',
      description: apiField.description || '',
      amenities: apiField.amenities || [],
      images,
      openTime: (apiField.opening_time || '08:00:00').slice(0, 5),
      closeTime: (apiField.closing_time || '23:00:00').slice(0, 5),
      phone: apiField.phone || '',
      isActive: apiField.is_active ?? true,
      rating: apiField.rating || 0,
      reviewCount: apiField.review_count || 0,
      createdAt: apiField.created_at || new Date().toISOString(),
    };
  }

  // Booking methods (mock)
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

  // Admin methods (mock)
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

  // Favorite methods (mock)
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

  // Review methods (mock)
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
