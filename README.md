# Sports Pitch Booking App

A mobile-first web application for booking sports pitches, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Authentication**: 
  - User registration with email, password, name, and phone
  - Login with email and password
  - Automatic profile creation with 'user' role
  - Protected routes requiring authentication
  - Sign out functionality
- **Home Screen**: Browse all available sports pitches with images, pricing, and location
- **Pitch Details**: 
  - View detailed information about each pitch with image carousel
  - Google Maps integration for location viewing
  - Facility icons (Shower, Parking, WiFi, Cafe)
- **Smart Booking System**: 
  - Select date (Today, Tomorrow, Day After)
  - View available time slots with real-time availability
  - Booked slots are automatically disabled
  - Customer information collection (name & phone)
  - Uses authenticated user's ID for bookings
- **My Bookings**: Track all your bookings with three tabs:
  - Pending: Requests awaiting admin approval
  - Confirmed: Approved bookings
  - History: Past and rejected bookings
  - Real-time updates when admin approves bookings
  - Cancel pending bookings
- **Notifications**: Stay updated on booking status changes
- **Profile**: 
  - View user information from database
  - Manage account settings and preferences
  - Sign out
- **Bottom Navigation**: Native mobile app-style navigation

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete database setup instructions including:
- Creating the profiles table
- Setting up the `handle_new_user` trigger
- Configuring Row Level Security (RLS) policies
- Testing the authentication flow

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Database Schema

### `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `pitches` table:
```sql
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_per_hour NUMERIC NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  working_hours_start TIME NOT NULL,
  working_hours_end TIME NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `bookings` table:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID REFERENCES pitches(id),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Data

```sql
-- Insert sample pitches
INSERT INTO pitches (name, price_per_hour, address, landmark, working_hours_start, working_hours_end, latitude, longitude, images, is_active) VALUES
('City Sports Complex', 50, '123 Main Street, Downtown', 'Near Central Park', '06:00', '22:00', 40.7128, -74.0060, ARRAY[
  'https://images.unsplash.com/photo-1651043421470-88b023bb9636?w=1080',
  'https://images.unsplash.com/photo-1762025858816-bb383940763a?w=1080'
], true),
('Elite Arena', 75, '456 Park Avenue, Uptown', 'Next to Metro Station', '08:00', '23:00', 40.7589, -73.9851, ARRAY[
  'https://images.unsplash.com/photo-1764439063840-a03b75a477f3?w=1080',
  'https://images.unsplash.com/photo-1771344159210-ceb27cd406a7?w=1080'
], true);
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Navigation
- **Tailwind CSS v4** - Styling
- **Supabase** - Backend (authentication, database, real-time subscriptions)
- **Lucide React** - Icons
- **Custom Components** - Image carousel, bottom navigation

## Key Features Implementation

### Authentication Flow
1. User registers with email, password, name, and phone
2. Supabase creates auth user with metadata: `{ role: 'user', full_name, phone }`
3. Database trigger `handle_new_user` creates profile record
4. User verifies email (if email confirmation enabled)
5. User logs in and gets redirected to home page
6. Auth state persists across page refreshes

### Real-time Updates
The app uses Supabase real-time subscriptions to automatically update the bookings page when an admin confirms or rejects a booking request.

### Smart Time Slot System
- Automatically generates time slots based on pitch working hours
- Fetches existing bookings and marks those slots as unavailable
- Prevents double-booking
- Refreshes availability when date changes

### Mobile-First Design
- Max width container (max-w-md) centered on screen
- Hidden scrollbars for native app feel
- Touch-friendly buttons and interactions
- Bottom navigation bar
- Smooth transitions and animations
- Dark theme with high contrast

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── BottomNav.tsx          # Bottom navigation bar
│   │   ├── ImageCarousel.tsx      # Image slider component
│   │   ├── SetupBanner.tsx        # Supabase setup warning
│   │   └── ProtectedRoute.tsx     # Auth protection wrapper
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client & types
│   │   └── AuthContext.tsx        # Authentication context
│   ├── pages/
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration page
│   │   ├── Home.tsx               # Main feed
│   │   ├── PitchDetails.tsx       # Pitch details & booking
│   │   ├── Bookings.tsx           # User's bookings
│   │   ├── Notifications.tsx      # Notifications feed
│   │   └── Profile.tsx            # User profile
│   ├── App.tsx                    # App wrapper with AuthProvider
│   └── routes.ts                  # Route configuration
└── main.tsx                       # App entry point
```

## Security Features

- Row Level Security (RLS) policies on all tables
- Users can only read/modify their own data
- Admins have elevated permissions
- Protected routes redirect to login
- Secure password handling via Supabase Auth
- Email verification support

## Documentation

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detailed implementation notes
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide

## Future Enhancements

- Email verification flow
- Password reset functionality
- Profile editing
- Push notifications
- Payment integration
- Booking history with filters
- Favorite pitches
- Reviews and ratings
- Admin dashboard (separate app)
- Real notification system