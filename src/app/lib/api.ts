// ============================================================
// API - Backend integration
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'https://gobronapi.webportfolio.uz/api';

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
  is_new_user?: boolean;
}

export interface SendOTPResponse {
  message: string;
  status: 'success' | 'error';
}

export interface VerifyOTPResponse extends AuthResponse {
  exists: boolean;
}

export interface RegisterData {
  full_name: string;
  phone: string;
  code: string;
  role?: 'user';
}

export interface LoginData {
  phone: string;
  code: string;
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
  subscriptionValid: boolean;
  advanceBookingDays: number;
  imagesCount: number;
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
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isBooked: boolean;
  isAvailable: boolean;
}

export interface FieldSlotsResponse {
  slots: FieldSlot[];
}

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

  private async request<T>(endpoint: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Only add Authorization header if auth is required and token exists
    if (requireAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Only try to refresh token if auth is required
      if (response.status === 401 && requireAuth && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          return this.request<T>(endpoint, options, requireAuth);
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
  async sendOTP(phone: string): Promise<SendOTPResponse> {
    return this.request<SendOTPResponse>('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }, false);
  }

  async verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
    const res = await this.request<any>('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }, false);
    
    if (res.exists) {
      const user = this.normalizeUser(res.user);
      this.setTokens(res.access, res.refresh);
      this.setUser(user);
      return { ...res, user };
    }
    return res;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.full_name,
        phone: data.phone,
        code: data.code,
        role: data.role || 'user',
      }),
    }, false);
    const user = this.normalizeUser(res.user);
    this.setTokens(res.access, res.refresh);
    this.setUser(user);
    return { user, access: res.access, refresh: res.refresh };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ phone: data.phone, code: data.code }),
    }, false);
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

  // Field/Pitch methods (real API - no auth required)
  async getFields(): Promise<Pitch[]> {
    const res = await this.request<any>('/fields/', {}, false);
    return (res.results || []).map((f: any) => this.normalizeField(f));
  }

  async getFieldById(id: string): Promise<Pitch> {
    const res = await this.request<any>(`/fields/${id}/`, {}, false);
    return this.normalizeField(res);
  }

  private normalizeField(apiField: any): Pitch {
    const images: string[] = [];
    if (apiField.cover_image_url) images.push(apiField.cover_image_url);

    if (Array.isArray(apiField.images)) {
      apiField.images.forEach((img: any) => {
        if (img.image_url) images.push(img.image_url);
      });
    }

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
      subscriptionValid: apiField.subscription_valid ?? true,
      advanceBookingDays: apiField.advance_booking_days ?? 1,
      imagesCount: apiField.images_count ?? images.length,
      rating: apiField.rating || 0,
      reviewCount: apiField.review_count || 0,
      createdAt: apiField.created_at || new Date().toISOString(),
    };
  }

  // Slot methods (real API - no auth required)
  async getFieldSlots(fieldId: string, dateStr: string): Promise<FieldSlotsResponse> {
    const res = await this.request<any>(`/fields/${fieldId}/slots/?date=${dateStr}`, {}, false);
    const slots = (res.slots || []).map((slot: any) => this.normalizeSlot(slot));
    return { slots };
  }

  private normalizeSlot(apiSlot: any): FieldSlot {
    return {
      id: String(apiSlot.id),
      fieldId: String(apiSlot.field),
      date: apiSlot.date,
      startTime: (apiSlot.start_time || '').slice(0, 5),
      endTime: (apiSlot.end_time || '').slice(0, 5),
      isActive: apiSlot.is_active ?? true,
      isBooked: apiSlot.is_booked ?? false,
      isAvailable: (apiSlot.is_active && !apiSlot.is_booked) ?? true,
    };
  }

  // Booking methods (real API)
  async getBookings(): Promise<Booking[]> {
    const res = await this.request<any>('/bookings/my/');
    return (res.results || []).map((b: any) => this.normalizeBooking(b));
  }

  async createBooking(bookingData: {
    fieldId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    note?: string;
  }): Promise<Booking> {
    const res = await this.request<any>('/bookings/', {
      method: 'POST',
      body: JSON.stringify({
        field: bookingData.fieldId,
        booking_date: bookingData.bookingDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        total_price: bookingData.totalPrice,
        note: bookingData.note || '',
      }),
    });
    return this.normalizeBooking(res);
  }

  async bookSlot(slotData: {
    slotId: string;
    fieldId: string;
    date: string;
    note?: string;
  }): Promise<Booking> {
    const res = await this.request<any>('/bookings/', {
      method: 'POST',
      body: JSON.stringify({
        slot_id: parseInt(slotData.slotId),
        field_id: parseInt(slotData.fieldId),
        date: slotData.date,
        note: slotData.note || '',
      }),
    });
    return this.normalizeBooking(res);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const res = await this.request<any>(`/bookings/${bookingId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return this.normalizeBooking(res);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await this.request(`/bookings/${bookingId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  }

  private normalizeBooking(apiBooking: any): Booking {
    return {
      id: String(apiBooking.id),
      userId: String(apiBooking.user || apiBooking.user_id || ''),
      fieldId: String(apiBooking.field || apiBooking.field_id || ''),
      bookingDate: apiBooking.date || apiBooking.booking_date || '',
      startTime: (apiBooking.start_time || '').slice(0, 5),
      endTime: (apiBooking.end_time || '').slice(0, 5),
      totalPrice: parseFloat(apiBooking.total_price) || 0,
      status: apiBooking.status || 'pending',
      paymentMethod: apiBooking.payment_method || 'cash',
      clientName: apiBooking.client_name || null,
      clientPhone: apiBooking.client_phone || null,
      note: apiBooking.note || null,
      createdAt: apiBooking.created_at || new Date().toISOString(),
      confirmedAt: apiBooking.confirmed_at || null,
      rejectedAt: apiBooking.rejected_at || null,
      rejectReason: apiBooking.reject_reason || null,
      field: (apiBooking.field_detail || apiBooking.field_details) ? this.normalizeField(apiBooking.field_detail || apiBooking.field_details) : undefined,
    };
  }

  // Admin methods (real API)
  async getAdminBookings(status?: string): Promise<Booking[]> {
    const endpoint = status ? `/admin/bookings/?status=${status}` : '/admin/bookings/';
    const res = await this.request<any>(endpoint);
    return (res.results || []).map((b: any) => this.normalizeBooking(b));
  }

  async getAllBookings(status?: string): Promise<Booking[]> {
    return this.getAdminBookings(status);
  }

  async getAdminStats(): Promise<{ todayRevenue: number; totalRevenue: number; balance: number }> {
    const res = await this.request<any>('/admin/stats/');
    return {
      todayRevenue: parseFloat(res.today_revenue) || 0,
      totalRevenue: parseFloat(res.total_revenue) || 0,
      balance: parseFloat(res.balance) || 0,
    };
  }

  // Favorite methods (real API)
  async getFavorites(): Promise<{ id: string; fieldId: string }[]> {
    const res = await this.request<any>('/favorites/');
    return (res.results || []).map((f: any) => ({
      id: String(f.id),
      fieldId: String(f.field || f.field_id),
    }));
  }

  async addFavorite(fieldId: string): Promise<{ id: string; fieldId: string }> {
    const res = await this.request<any>('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ field: fieldId }),
    });
    return {
      id: String(res.id),
      fieldId: String(res.field || res.field_id),
    };
  }

  async removeFavorite(fieldId: string): Promise<void> {
    // Find favorite by fieldId first
    const favorites = await this.getFavorites();
    const favorite = favorites.find(f => f.fieldId === fieldId);
    if (favorite) {
      await this.request(`/favorites/${favorite.id}/`, {
        method: 'DELETE',
      });
    }
  }

  // Review methods (real API)
  async getReviews(fieldId: string): Promise<Review[]> {
    const res = await this.request<any>(`/reviews/?field=${fieldId}`);
    return (res.results || []).map((r: any) => this.normalizeReview(r));
  }

  async getMyReviews(): Promise<Review[]> {
    const res = await this.request<any>('/reviews/my/');
    return (res.results || []).map((r: any) => this.normalizeReview(r));
  }

  async submitReview(reviewData: {
    fieldId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const res = await this.request<any>('/reviews/', {
      method: 'POST',
      body: JSON.stringify({
        field: reviewData.fieldId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
    });
    return this.normalizeReview(res);
  }

  private normalizeReview(apiReview: any): Review {
    return {
      id: String(apiReview.id),
      fieldId: String(apiReview.field || apiReview.field_id),
      userId: String(apiReview.user || apiReview.user_id),
      rating: apiReview.rating || 0,
      comment: apiReview.comment || '',
      createdAt: apiReview.created_at || new Date().toISOString(),
      user: apiReview.user_details ? {
        fullName: `${apiReview.user_details.first_name || ''} ${apiReview.user_details.last_name || ''}`.trim(),
      } : undefined,
    };
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
