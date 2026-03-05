# 🚀 Quick Start Guide - New Features

## ⚡ 5-Minute Setup

### 1. Database Setup (2 minutes)

**Update Profiles Table:**
```sql
-- Add financial columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;

-- Create an admin user
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

**Update Pitches Table (for geolocation):**
```sql
-- Add coordinates
ALTER TABLE pitches
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Example: Add coordinates for Tashkent pitches
UPDATE pitches
SET latitude = 41.2995, longitude = 69.2401
WHERE name = 'City Sports Complex';
```

---

### 2. Test Admin Dashboard (1 minute)

```bash
# 1. Start development server
npm run dev

# 2. Login with admin account
# Email: your-admin@email.com

# 3. Navigate to Profile page
# Click "Admin Dashboard" button

# 4. Verify 3-column layout appears
```

**Expected Result:**
- ✅ Finance column shows metrics
- ✅ Today's schedule displays bookings
- ✅ Pending bookings list appears

---

### 3. Test Geolocation (1 minute)

```bash
# 1. Open home page
# 2. Allow location permission when prompted
# 3. Click "Yaqin masofada" filter
# 4. Verify pitches sort by distance
```

**Expected Result:**
- ✅ Browser asks for location permission
- ✅ Pitches reorder (closest first)
- ✅ Distance displays on cards ("1.5 km")

---

### 4. Test Booking Conflicts (1 minute)

```bash
# 1. Create a booking (status: pending)
# 2. Try to book the same slot with another user
# 3. Verify error toast appears
```

**Expected Result:**
- ✅ First booking succeeds
- ✅ Second booking shows error: "Bu vaqt band!"
- ✅ Slot shows as occupied

---

## 📋 Feature Checklist

### Admin Dashboard:
- [ ] Access `/admin` route
- [ ] See 3-column layout
- [ ] Finance metrics display
- [ ] Today's schedule shows bookings
- [ ] Pending bookings list appears
- [ ] Approve button works
- [ ] Reject button works
- [ ] Toast notifications appear

### Statistics Bar:
- [ ] Home page shows statistics
- [ ] Pitches count correct
- [ ] Users count displays
- [ ] Average rating shows

### Geolocation:
- [ ] Location permission requested
- [ ] "Yaqin masofada" filter works
- [ ] Pitches sort by distance
- [ ] Distance displays on cards

### Booking System:
- [ ] Pending bookings block slots
- [ ] Confirmed bookings block slots
- [ ] Cancelled bookings release slots
- [ ] Rejected bookings release slots
- [ ] Toast notifications work

---

## 🔧 Troubleshooting

### Admin Dashboard Not Accessible

**Problem**: Redirected to home page

**Solution**:
```sql
-- Check user role
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';

-- Set admin role
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

### Geolocation Not Working

**Problem**: No distance displayed

**Solution**:
1. Check browser console for errors
2. Ensure HTTPS (geolocation requires secure context)
3. Verify pitches have latitude/longitude:
```sql
SELECT id, name, latitude, longitude FROM pitches;
```
4. Update missing coordinates:
```sql
UPDATE pitches SET latitude = 41.2995, longitude = 69.2401 WHERE id = 'pitch-id';
```

---

### Statistics Showing Zero

**Problem**: All statistics show 0

**Solution**:
```sql
-- Check data exists
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM pitches WHERE is_active = true;
SELECT COUNT(*) FROM reviews;

-- If no data, add sample data
INSERT INTO profiles (id, full_name, role) VALUES 
  (gen_random_uuid(), 'Test User', 'user');
```

---

### Booking Conflicts Still Occurring

**Problem**: Same slot booked twice

**Solution**:
1. Check booking statuses:
```sql
SELECT id, pitch_id, booking_date, start_time, end_time, status 
FROM bookings 
WHERE booking_date = '2026-03-05';
```

2. Verify only correct statuses block slots:
```typescript
// Should be: ['pending', 'confirmed', 'manual']
// Should NOT include: ['cancelled', 'rejected']
```

3. Clear browser cache and test again

---

## 📊 Sample Data

### Create Sample Admin User:
```sql
-- Insert admin profile
INSERT INTO profiles (id, email, full_name, role, total_revenue, balance)
VALUES (
  'admin-user-id',
  'admin@example.com',
  'Admin User',
  'admin',
  2500000,
  500000
);
```

### Create Sample Pitch with Coordinates:
```sql
INSERT INTO pitches (id, name, location, latitude, longitude, price_per_hour, start_time, end_time, is_active)
VALUES (
  gen_random_uuid(),
  'City Sports Complex',
  'Toshkent, Chilonzor',
  41.2995,
  69.2401,
  50000,
  '08:00:00',
  '23:00:00',
  true
);
```

### Create Sample Bookings:
```sql
-- Pending booking
INSERT INTO bookings (id, pitch_id, user_id, full_name, phone, booking_date, start_time, end_time, total_price, status)
VALUES (
  gen_random_uuid(),
  'pitch-id',
  'user-id',
  'Alisher Karimov',
  '+998901234567',
  '2026-03-05',
  '18:00:00',
  '19:00:00',
  50000,
  'pending'
);

-- Confirmed booking
INSERT INTO bookings (id, pitch_id, user_id, full_name, phone, booking_date, start_time, end_time, total_price, status)
VALUES (
  gen_random_uuid(),
  'pitch-id',
  'user-id',
  'Bobur Rahimov',
  '+998907654321',
  '2026-03-05',
  '20:00:00',
  '21:00:00',
  60000,
  'confirmed'
);
```

---

## 🧪 Quick Tests

### Test 1: Admin Approval (30 seconds)
```bash
1. Login as admin
2. Go to /admin
3. Click green "Tasdiqlash" button
4. Verify toast appears
5. Check booking moved to schedule
```

### Test 2: Admin Rejection (30 seconds)
```bash
1. Login as admin
2. Go to /admin
3. Click red "Rad etish" button
4. Verify toast appears
5. Check slot becomes available
```

### Test 3: Geolocation (30 seconds)
```bash
1. Open home page
2. Allow location
3. Click "Yaqin masofada"
4. Verify sorting changes
5. Check distance displays
```

### Test 4: Statistics (30 seconds)
```bash
1. Open home page
2. Check statistics bar
3. Verify counts are correct
4. Check rating displays
```

---

## 📱 Mobile Testing

### Test on Mobile Device:
```bash
# 1. Get local IP
ipconfig getifaddr en0  # macOS
# or
hostname -I  # Linux

# 2. Access from mobile
http://YOUR_IP:5173

# 3. Test features:
- Statistics bar responsive
- Geolocation permission
- Admin dashboard (3 columns stack)
- Toast notifications
```

---

## 🎯 Success Criteria

### All features working if:
- ✅ Admin can access dashboard
- ✅ Finance metrics display correctly
- ✅ Approve/reject buttons work
- ✅ Statistics bar shows data
- ✅ Geolocation sorts pitches
- ✅ Distance displays on cards
- ✅ Booking conflicts prevented
- ✅ Toast notifications appear
- ✅ Real-time updates work

---

## 📞 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Preview production
npm run preview

# Check for errors
npm run build 2>&1 | grep -i error
```

---

## 🔗 Quick Links

### Documentation:
- **Full Guide**: `NEW_FEATURES_IMPLEMENTATION.md`
- **Uzbek Guide**: `YANGI_FUNKSIYALAR_QISQACHA.md`
- **Admin Dashboard**: `ADMIN_DASHBOARD_GUIDE.md`
- **Testing**: `TEST_BOOKING_FIXES.md`

### Code Files:
- **Admin Dashboard**: `src/app/pages/AdminDashboard.tsx`
- **Geolocation**: `src/app/lib/geoUtils.ts`
- **Home Page**: `src/app/pages/Home.tsx`
- **Routes**: `src/app/routes.ts`

---

## 🎉 You're Ready!

If all tests pass, you're ready to:
1. ✅ Deploy to staging
2. ✅ Test with real users
3. ✅ Deploy to production

---

**Setup Time**: ~5 minutes  
**Status**: ✅ Ready  
**Version**: 2.0
