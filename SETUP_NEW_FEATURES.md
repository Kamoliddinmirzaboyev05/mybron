# Quick Setup Guide - New Features

## 🚀 Getting Started

### Step 1: Database Setup

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `DATABASE_MIGRATION.sql`
4. Paste and execute the SQL

This will create:
- `favorites` table for user favorites
- `reviews` table for pitch reviews
- Proper indexes for performance
- Row Level Security policies

### Step 2: Verify Installation

Run the development server:
```bash
npm run dev
```

### Step 3: Test Features

#### Test Favorites
1. Login as a user
2. Click the heart icon on any pitch card
3. Heart should turn red immediately (optimistic UI)
4. Refresh page - favorite should persist

#### Test Search
1. Type in the search bar at the top
2. Results filter in real-time
3. Clear button appears when typing

#### Test Quick Filters
1. Click "Eng arzon" - pitches sort by price
2. Click "Dushi bor" - only pitches with showers show
3. Click again to deactivate filter

#### Test Enhanced Booking
1. Click "Band qilish" on any pitch
2. Scroll through the horizontal date picker
3. Select a date
4. See available time slots (green border when selected)
5. View price summary at bottom
6. Confirm booking

#### Test Reviews
1. Open any pitch details page
2. Scroll to "Sharhlar" section
3. Click "Sharh qo'shish"
4. Select rating (1-5 stars)
5. Write a comment
6. Submit review

#### Test Share
1. Open pitch details
2. Click share icon (top-right)
3. Share via native dialog or copy link

## 🎨 Customization

### Change Colors
Edit `src/styles/tailwind.css` or component files:
- Primary: `blue-600` → your color
- Background: `slate-950` → your color
- Cards: `slate-900` → your color

### Change Language
All text is in Uzbek. To change:
1. Search for Uzbek text in components
2. Replace with your language
3. Update date/time formatting

### Adjust Filters
Edit `src/app/components/QuickFilters.tsx`:
```typescript
const filters = [
  { id: 'your-filter', label: 'Your Label', icon: YourIcon },
  // Add more filters
];
```

Then update filter logic in `src/app/pages/Home.tsx`:
```typescript
if (activeFilter === 'your-filter') {
  // Your filter logic
}
```

## 📱 Mobile Testing

Test on mobile devices or use browser DevTools:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Test touch interactions

## 🔧 Troubleshooting

### Favorites Not Working
- Check if user is logged in
- Verify `favorites` table exists in Supabase
- Check browser console for errors
- Verify RLS policies are enabled

### Reviews Not Showing
- Check if `reviews` table exists
- Verify foreign key relationships
- Check if profiles table has data
- Look for console errors

### Search Not Filtering
- Verify pitches have data in `name` and `location` fields
- Check if `filteredPitches` state is updating
- Look for console errors

### Time Slots Not Loading
- Verify pitch has `start_time` and `end_time`
- Check if bookings table has correct data
- Verify date format is correct (YYYY-MM-DD)

## 📊 Performance Tips

1. **Add Indexes** (already in migration):
   - `favorites(user_id, pitch_id)`
   - `reviews(pitch_id, user_id)`

2. **Optimize Images**:
   - Use WebP format
   - Compress images
   - Use CDN for storage

3. **Enable Caching**:
   - Cache pitch data
   - Cache user favorites
   - Use SWR or React Query

4. **Lazy Load**:
   - Images load on demand
   - Reviews load on scroll
   - Infinite scroll for pitches

## 🎯 Next Steps

1. **Add Google Maps**:
   - Get Google Maps API key
   - Install `@react-google-maps/api`
   - Implement map view

2. **Add Notifications**:
   - Setup push notifications
   - Email confirmations
   - SMS reminders

3. **Add Analytics**:
   - Google Analytics
   - Track user behavior
   - Monitor conversions

4. **Add Payment**:
   - Integrate payment gateway
   - Handle transactions
   - Generate receipts

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check database tables exist
4. Review RLS policies
5. Test with different users

## ✅ Checklist

Before going live:
- [ ] Database migration completed
- [ ] All features tested
- [ ] Mobile responsive verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Analytics setup
- [ ] Backup strategy in place

## 🎉 You're Ready!

All features are now live and ready to use. Start booking pitches! 🏟️⚽
