import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = 'https://gobron-backend.onrender.com/api/v1';

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
  pitchId: string;
  userId: string;
  date: string;
  timeSlots: string[];
  totalHours: number;
  totalPrice: number;
  createdAt: string;
  pitch?: Pitch;
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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
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
    return this.request<Booking[]>(`/bookings/user/${userId}`);
  }

  async createBooking(bookingData: {
    pitchId: string;
    userId: string;
    date: string;
    timeSlots: string[];
    totalHours: number;
    totalPrice: number;
  }): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookedSlots(pitchId: string, dateStr: string): Promise<string[]> {
    return this.request<string[]>(`/bookings/slots/${pitchId}?date=${dateStr}`);
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
