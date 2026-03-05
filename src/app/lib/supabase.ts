import { createClient } from '@supabase/supabase-js';

// Use placeholder values if environment variables are not set
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const isSupabaseConfigured = !!(
  import.meta.env?.VITE_SUPABASE_URL && 
  import.meta.env?.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Please add credentials to .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Pitch {
  id: string;
  name: string;
  price_per_hour: number;
  location: string;
  landmark?: string;
  start_time: string;
  end_time: string;
  latitude?: number;
  longitude?: number;
  images: string[]; // Changed back to array
  amenities?: string[];
  is_active: boolean;
  owner_id?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  pitch_id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  customer_name?: string; // Legacy field
  customer_phone?: string; // Legacy field
  booking_date: string; // DATE format
  start_time: string; // TIME format (HH:MM:SS)
  end_time: string; // TIME format (HH:MM:SS)
  total_price?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'manual';
  created_at?: string;
  pitches?: Pitch;
}

export interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  total_revenue?: number;
  balance?: number;
  updated_at?: string;
  created_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  pitch_id: string;
  created_at?: string;
}

export interface Review {
  id: string;
  pitch_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  profiles?: Profile;
}

export interface PitchSlot {
  id: string;
  pitch_id: string;
  slot_date: string; // DATE format (YYYY-MM-DD)
  slot_time: string; // TIME format (HH:MM:SS)
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}