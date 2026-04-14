import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = 'https://gobron-backend-production.up.railway.app/api/v1';

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

// API Client
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

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store the access token
    this.setToken(result.accessToken);
    
    // Store user data
    this.setUser(result.user);
    
    return {
      user: result.user,
      token: result.accessToken
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const result = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store the access token
    this.setToken(result.accessToken);
    
    // Store user data
    this.setUser(result.user);
    
    return {
      user: result.user,
      token: result.accessToken
    };
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Field/Pitch methods
  async getFields(): Promise<Pitch[]> {
    return this.request<Pitch[]>('/fields/all/list');
  }

  async getFieldById(id: string): Promise<Pitch> {
    return this.request<Pitch>(`/fields/${id}`);
  }

  // Booking methods
  async getBookings(userId: string): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings/my');
  }

  async createBooking(bookingData: {
    fieldId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    note?: string;
  }): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async bookSlot(slotData: {
    slotId: string;
    fieldId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<Booking> {
    return this.request<Booking>('/slots/book', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  }

  async getFieldSlots(pitchId: string, dateStr: string): Promise<FieldSlotsResponse> {
    return this.request<FieldSlotsResponse>(`/slots/field/${pitchId}?date=${dateStr}`);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(bookingId: string): Promise<void> {
    return this.request<void>(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  }

  // Admin methods
  async getAdminBookings(status?: string): Promise<Booking[]> {
    const endpoint = status ? `/bookings/admin?status=${status}` : '/bookings/admin';
    return this.request<Booking[]>(endpoint);
  }

  async getAllBookings(status?: string): Promise<Booking[]> {
    const endpoint = status ? `/bookings/all?status=${status}` : '/bookings/all';
    return this.request<Booking[]>(endpoint);
  }

  async getAdminStats(): Promise<{ todayRevenue: number; totalRevenue: number; balance: number }> {
    // Note: Stats endpoint not found in swagger, but keeping it as a placeholder or assuming it exists on a different path
    return this.request<{ todayRevenue: number; totalRevenue: number; balance: number }>('/bookings/admin/stats');
  }

  // Favorite methods
  async getFavorites(): Promise<{ id: string; fieldId: string }[]> {
    return this.request<{ id: string; fieldId: string }[]>('/favorites/my');
  }

  async addFavorite(fieldId: string): Promise<{ id: string; fieldId: string }> {
    return this.request<{ id: string; fieldId: string }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ fieldId }),
    });
  }

  async removeFavorite(fieldId: string): Promise<void> {
    return this.request<void>(`/favorites/${fieldId}`, {
      method: 'DELETE',
    });
  }

  // Review methods
  async getReviews(fieldId: string): Promise<Review[]> {
    return this.request<Review[]>(`/reviews/field/${fieldId}`);
  }

  async getMyReviews(): Promise<Review[]> {
    return this.request<Review[]>('/reviews/my');
  }

  async submitReview(reviewData: {
    fieldId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
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
