# Database Setup Guide

## Required Database Trigger

For the authentication to work properly, you need to create a database trigger that automatically creates a profile record when a new user signs up.

### Step 1: Create the profiles table (if not exists)

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### Step 2: Create the handle_new_user function

```sql
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
```

### Step 3: Create the trigger

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Set up Row Level Security for pitches table

```sql
-- Enable RLS on pitches
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active pitches
CREATE POLICY "Anyone can read active pitches"
  ON pitches
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert/update/delete pitches
CREATE POLICY "Admins can manage pitches"
  ON pitches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Step 5: Set up Row Level Security for bookings table

```sql
-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own pending bookings
CREATE POLICY "Users can delete own pending bookings"
  ON bookings
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Verification

After setting up the trigger, test it by:

1. Register a new user through the app
2. Check the `profiles` table in Supabase dashboard
3. Verify that a new profile record was created with:
   - Correct user ID
   - Email from registration
   - Full name from registration
   - Phone from registration
   - Role set to 'user'

## Supabase Dashboard Steps

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Create a new query
4. Copy and paste the SQL commands above
5. Run each section one at a time
6. Verify in the "Table Editor" that the policies are created

## Testing Authentication

1. Open the app and navigate to `/register`
2. Fill in the registration form
3. Submit the form
4. Check your email for verification (if email confirmation is enabled)
5. Navigate to `/login` and sign in
6. You should be redirected to the home page
7. Check the Profile page to see your user information

## Troubleshooting

### Issue: Profile not created after registration
- Check if the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check if the function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
- Check Supabase logs for any errors

### Issue: Can't read pitches
- Verify RLS policies are set up correctly
- Check if pitches have `is_active = true`
- Try disabling RLS temporarily to test: `ALTER TABLE pitches DISABLE ROW LEVEL SECURITY;`

### Issue: Can't create bookings
- Verify user is authenticated
- Check RLS policies on bookings table
- Verify user_id matches auth.uid()
