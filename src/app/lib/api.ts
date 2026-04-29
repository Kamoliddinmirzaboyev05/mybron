import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
  user_role?: 'PLAYER' | 'OWNER';
  phone?: string;
  avatar_url?: string | null;
  date_joined?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  is_new_user?: boolean;
}

export interface WebAuthResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
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
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) throw new Error('No refresh token');

            const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
            const { access } = res.data;

            localStorage.setItem('access_token', access);
            this.isRefreshing = false;
            this.onRefreshed(access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        const errorData = error.response?.data || {};
        const errorMsg = errorData.detail || errorData.message || Object.values(errorData).flat().join(', ') || `Xatolik: ${error.response?.status || 'Unknown'}`;
        return Promise.reject(new Error(errorMsg));
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const { method = 'GET', body, params } = options;
    const response = await this.axiosInstance({
      url: endpoint,
      method,
      data: body,
      params,
    });
    return response.data;
  }

  private normalizeUser(data: any): User {
    return {
      ...data,
      id: String(data.id),
      fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      login: data.username,
    };
  }

  // Auth methods
  async webAuth(token: string): Promise<WebAuthResponse> {
    const res = await this.request<any>(`/auth/web-auth/?token=${token}`);
    const user = this.normalizeUser(res.user);
    this.setTokens(res.tokens.access, res.tokens.refresh);
    this.setUser(user);
    return { ...res, user };
  }

  async getProfile(): Promise<User> {
    const res = await this.request<any>('/auth/profile/');
    const user = this.normalizeUser(res);
    this.setUser(user);
    return user;
  }

  async sendOTP(phone: string): Promise<SendOTPResponse> {
    return this.request<SendOTPResponse>('/auth/send-otp/', {
      method: 'POST',
      body: { phone },
    });
  }

  async verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
    const res = await this.request<any>('/auth/verify-otp/', {
      method: 'POST',
      body: { phone, code },
    });
    
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
      body: data,
    });
    const user = this.normalizeUser(res.user);
    this.setTokens(res.access, res.refresh);
    this.setUser(user);
    return { ...res, user };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/login/', {
      method: 'POST',
      body: data,
    });
    const user = this.normalizeUser(res.user);
    this.setTokens(res.access, res.refresh);
    this.setUser(user);
    return { ...res, user };
  }

  async logout(): Promise<void> {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await this.request('/auth/logout/', {
        method: 'POST',
        body: { refresh },
      });
    } catch {}
    this.clearTokens();
  }

  // Field/Pitch methods
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

  // Slot methods
  async getFieldSlots(fieldId: string, dateStr: string): Promise<FieldSlotsResponse> {
    const res = await this.request<any>(`/fields/${fieldId}/slots/`, {
      params: { date: dateStr }
    });
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

  // Booking methods
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
      body: {
        field: bookingData.fieldId,
        booking_date: bookingData.bookingDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        total_price: bookingData.totalPrice,
        note: bookingData.note || '',
      },
    });
    return this.normalizeBooking(res);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const res = await this.request<any>(`/bookings/${bookingId}/`, {
      method: 'PATCH',
      body: { status },
    });
    return this.normalizeBooking(res);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await this.request(`/bookings/${bookingId}/`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
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

  // Admin methods
  async getAdminBookings(status?: string): Promise<Booking[]> {
    const res = await this.request<any>('/admin/bookings/', {
      params: { status }
    });
    return (res.results || []).map((b: any) => this.normalizeBooking(b));
  }

  async getAdminStats(): Promise<{ todayRevenue: number; totalRevenue: number; balance: number }> {
    const res = await this.request<any>('/admin/stats/');
    return {
      todayRevenue: parseFloat(res.today_revenue) || 0,
      totalRevenue: parseFloat(res.total_revenue) || 0,
      balance: parseFloat(res.balance) || 0,
    };
  }

  // Favorite methods
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
      body: { field: fieldId },
    });
    return {
      id: String(res.id),
      fieldId: String(res.field || res.field_id),
    };
  }

  async removeFavorite(fieldId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const favorite = favorites.find(f => f.fieldId === fieldId);
    if (favorite) {
      await this.request(`/favorites/${favorite.id}/`, {
        method: 'DELETE',
      });
    }
  }

  // Review methods
  async getReviews(fieldId: string): Promise<Review[]> {
    const res = await this.request<any>(`/reviews/`, {
      params: { field: fieldId }
    });
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
      body: {
        field: reviewData.fieldId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
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
}

export const api = new ApiClient();
