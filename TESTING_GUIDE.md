# Testing Guide

## Prerequisites
1. Supabase project set up with credentials in `.env`
2. Database tables created (profiles, pitches, bookings)
3. Database trigger `handle_new_user` created
4. Row Level Security policies configured
5. Sample pitch data inserted

## Test Scenarios

### 1. User Registration Flow

**Steps:**
1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+1 234 567 8900"
   - Password: "password123"
3. Click "Sign Up"

**Expected Results:**
- Success message displayed
- Redirected to success screen
- Email verification sent (if enabled in Supabase)
- Profile record created in database with role='user'

**Verification:**
```sql
-- Check if profile was created
SELECT * FROM profiles WHERE email = 'test@example.com';
-- Should show: role = 'user', full_name = 'Test User', phone = '+1 234 567 8900'
```

### 2. User Login Flow

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Sign In"

**Expected Results:**
- Successful login
- Redirected to home page (`/`)
- User session persists on page refresh

### 3. Browse Pitches (Home Page)

**Steps:**
1. After login, you should be on the home page
2. Scroll through the list of pitches

**Expected Results:**
- Only pitches with `is_active = true` are displayed
- Each pitch card shows:
  - First image from images array
  - Pitch name
  - Address with map pin icon
  - Price per hour
  - "View Details" button
- Loading state shown while fetching
- "No pitches available" if database is empty

### 4. View Pitch Details

**Steps:**
1. Click on any pitch card from the home page
2. View the pitch details page

**Expected Results:**
- Image carousel with navigation (if multiple images)
- Back button in top-left
- Pitch name and address displayed
- Google Maps link (if latitude/longitude exist)
- Facility icons shown
- Customer info form (name and phone fields)
- Date selection buttons (Today, Tomorrow, Day After)
- Time slots generated based on working hours
- Booked slots are greyed out and disabled

### 5. Create a Booking

**Steps:**
1. On pitch details page, fill in:
   - Your Name: "Test User"
   - Phone Number: "+1 234 567 8900"
2. Select a date (e.g., "Today")
3. Select an available time slot (e.g., "18:00")
4. Click "Book Now"

**Expected Results:**
- Success modal appears
- Message: "Booking Requested! Your booking request has been sent to the admin for approval."
- "View My Bookings" button shown
- Booking created in database with status='pending'

**Verification:**
```sql
-- Check if booking was created
SELECT * FROM bookings WHERE customer_name = 'Test User' ORDER BY created_at DESC LIMIT 1;
-- Should show: status = 'pending', user_id = (your user id)
```

### 6. View My Bookings

**Steps:**
1. Click "View My Bookings" from success modal, or
2. Navigate to Bookings tab in bottom navigation

**Expected Results:**
- Three tabs: Pending, Confirmed, History
- Pending tab shows the booking just created
- Booking card displays:
  - Pitch name
  - Date and time
  - Status badge (yellow for pending)
  - Customer details
  - "Cancel Request" button

### 7. Cancel a Booking

**Steps:**
1. On My Bookings page, Pending tab
2. Click "Cancel Request" on a pending booking
3. Confirm the cancellation

**Expected Results:**
- Confirmation dialog appears
- Booking is deleted from database
- Booking disappears from the list

### 8. Real-time Booking Updates

**Steps:**
1. Keep the My Bookings page open
2. In Supabase dashboard, manually update a booking status:
   ```sql
   UPDATE bookings 
   SET status = 'confirmed' 
   WHERE id = 'your-booking-id';
   ```

**Expected Results:**
- Booking automatically moves from Pending to Confirmed tab
- No page refresh needed
- Status badge changes to green

### 9. View Profile

**Steps:**
1. Click Profile tab in bottom navigation

**Expected Results:**
- User avatar displayed
- Full name shown
- Email displayed
- Phone number displayed
- Member since date shown
- Dark mode toggle works
- Sign out button present

### 10. Sign Out

**Steps:**
1. On Profile page, click "Sign Out"
2. Confirm sign out

**Expected Results:**
- Confirmation dialog appears
- User is signed out
- Redirected to login page
- Session cleared

### 11. Protected Routes

**Steps:**
1. Sign out if logged in
2. Try to navigate directly to:
   - `http://localhost:5173/bookings`
   - `http://localhost:5173/profile`
   - `http://localhost:5173/notifications`

**Expected Results:**
- Automatically redirected to `/login`
- Cannot access protected pages without authentication

### 12. Notifications Page

**Steps:**
1. Login and navigate to Notifications tab

**Expected Results:**
- Mock notifications displayed
- Different notification types (success, info, error)
- Unread notifications highlighted
- Click to mark as read
- "Mark all read" button works

### 13. Google Maps Integration

**Steps:**
1. View a pitch that has latitude and longitude
2. Click "View on Google Maps" link

**Expected Results:**
- Opens Google Maps in new tab
- Shows correct location on map

### 14. Time Slot Availability

**Steps:**
1. Create a booking for a specific time slot
2. Go back to the same pitch details page
3. Select the same date

**Expected Results:**
- The booked time slot is greyed out
- Cannot select the booked slot
- Other slots remain available

### 15. Date Selection

**Steps:**
1. On pitch details page, switch between dates
2. Observe time slot availability changes

**Expected Results:**
- Time slots refresh when date changes
- Different dates may have different availability
- Selected time resets when changing dates

## Edge Cases to Test

### Empty States
- [ ] No pitches in database
- [ ] No bookings for user
- [ ] No notifications

### Error Handling
- [ ] Invalid login credentials
- [ ] Registration with existing email
- [ ] Weak password (less than 6 characters)
- [ ] Network error during booking
- [ ] Missing required fields

### Mobile Responsiveness
- [ ] Test on mobile viewport (375px width)
- [ ] Bottom navigation stays fixed
- [ ] Touch interactions work smoothly
- [ ] Images load properly
- [ ] Forms are easy to fill on mobile

### Performance
- [ ] Page loads quickly
- [ ] Images load progressively
- [ ] No layout shifts
- [ ] Smooth transitions

## Automated Testing Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Common Issues and Solutions

### Issue: Profile not created after registration
**Solution:** Check if the `handle_new_user` trigger is set up correctly in Supabase.

### Issue: Can't see any pitches
**Solution:** 
1. Check if pitches exist in database
2. Verify `is_active = true` for pitches
3. Check RLS policies on pitches table

### Issue: Can't create bookings
**Solution:**
1. Verify user is logged in
2. Check RLS policies on bookings table
3. Ensure user_id matches authenticated user

### Issue: Real-time updates not working
**Solution:**
1. Check if Supabase Realtime is enabled for the bookings table
2. Verify subscription is set up correctly
3. Check browser console for errors

## Success Criteria

All features working correctly:
- ✅ User registration with role='user'
- ✅ User login and authentication
- ✅ Browse active pitches
- ✅ View pitch details with images
- ✅ Create bookings with status='pending'
- ✅ View user's bookings
- ✅ Cancel pending bookings
- ✅ Real-time booking updates
- ✅ Profile page with user data
- ✅ Sign out functionality
- ✅ Protected routes
- ✅ Mobile-responsive design
- ✅ Google Maps integration
