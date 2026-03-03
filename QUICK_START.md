# Quick Start Guide

Get your Sports Pitch Booking App up and running in 5 minutes!

## Step 1: Clone and Install (1 min)

```bash
# Install dependencies
npm install
```

## Step 2: Configure Supabase (2 min)

1. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Get your credentials from [Supabase Dashboard](https://app.supabase.com):
   - Go to Project Settings → API
   - Copy "Project URL" and "anon public" key

## Step 3: Set Up Database (2 min)

Run these SQL commands in Supabase SQL Editor:

```sql
-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Add missing columns to pitches table (if needed)
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Insert sample data
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

## Step 4: Run the App (30 sec)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 5: Test It Out! (1 min)

1. Click "Sign Up" and create an account
2. Login with your credentials
3. Browse pitches on the home page
4. Click a pitch to view details
5. Make a booking!

## That's It! 🎉

You now have a fully functional sports pitch booking app with:
- ✅ User authentication
- ✅ Pitch browsing
- ✅ Real-time booking system
- ✅ User profile management
- ✅ Mobile-responsive design

## Next Steps

- **Add RLS Policies**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for security setup
- **Customize**: Modify colors, add more pitches, adjust working hours
- **Deploy**: Deploy to Vercel, Netlify, or your preferred hosting

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🔧 [Database Setup Guide](./DATABASE_SETUP.md)
- 🧪 [Testing Guide](./TESTING_GUIDE.md)
- 📝 [Implementation Details](./IMPLEMENTATION.md)

## Common Issues

**Can't see pitches?**
- Make sure you inserted sample data
- Check that `is_active = true` for pitches

**Registration not working?**
- Verify the trigger was created successfully
- Check Supabase logs for errors

**Bookings not saving?**
- Make sure you're logged in
- Check that the bookings table exists

## Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Happy booking! 🏟️⚽🏀
