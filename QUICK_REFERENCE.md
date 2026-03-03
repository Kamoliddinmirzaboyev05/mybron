# Quick Reference Card - Enhanced Features

## 🚀 Quick Start (3 Steps)

1. **Run Database Migration**
   ```bash
   # Open Supabase SQL Editor
   # Copy & paste DATABASE_MIGRATION.sql
   # Execute
   ```

2. **Start Development**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Features**
   - Search for pitches
   - Click heart to favorite
   - Book a pitch
   - Leave a review

## 📋 Feature Checklist

### Home Page
- [x] Dynamic greeting with user name
- [x] Search bar (real-time filtering)
- [x] Quick filters (4 categories)
- [x] Enhanced cards (favorite, rating, distance)
- [x] Skeleton loading
- [x] Map view toggle

### Booking
- [x] Horizontal date picker (7 days)
- [x] Color-coded time slots
- [x] Price summary
- [x] Real-time availability

### Social
- [x] Reviews section
- [x] 5-star rating system
- [x] Share functionality

### Technical
- [x] Optimistic UI (favorites)
- [x] TypeScript types
- [x] Database migration
- [x] RLS policies

## 🎯 Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `SearchBar` | Global search | Home header |
| `QuickFilters` | Category filters | Below search |
| `EnhancedPitchCard` | Pitch card with extras | Home grid |
| `DatePicker` | Horizontal date selector | Booking modal |
| `TimeSlotPicker` | Color-coded slots | Booking modal |
| `ReviewsSection` | Reviews & ratings | Pitch details |

## 🎨 Color Codes

### Time Slots
- 🟢 **Green** (`bg-green-600`): Selected
- ⚫ **Grey** (`bg-slate-800`): Booked
- ⬜ **White** (`bg-slate-800 border`): Available

### UI Elements
- **Primary**: `blue-600` (buttons, links)
- **Background**: `slate-950` (page)
- **Cards**: `slate-900` (containers)
- **Borders**: `slate-800` (dividers)
- **Text**: `white`, `slate-300`, `slate-400`

## 📊 Database Tables

### Favorites
```sql
favorites (
  id, user_id, pitch_id, created_at
)
```

### Reviews
```sql
reviews (
  id, pitch_id, user_id, rating, comment, created_at
)
```

## 🔧 Common Tasks

### Add New Filter
1. Edit `src/app/components/QuickFilters.tsx`
2. Add filter to array
3. Edit `src/app/pages/Home.tsx`
4. Add filter logic in `applyFilters()`

### Customize Colors
1. Edit component files
2. Replace `blue-600` with your color
3. Replace `slate-950` with your background

### Change Language
1. Search for Uzbek text
2. Replace with your language
3. Update date/time formatting

### Add New Amenity Icon
1. Edit `src/app/pages/PitchDetails.tsx`
2. Find `getAmenityIcon()` function
3. Add new condition

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Favorites not working | Check if user is logged in |
| Reviews not showing | Run database migration |
| Search not filtering | Check pitch data exists |
| Time slots not loading | Verify pitch has start/end time |
| Build errors | Run `npm install` |

## 📱 Testing Checklist

- [ ] Search pitches by name
- [ ] Search pitches by location
- [ ] Apply "Eng arzon" filter
- [ ] Apply "Dushi bor" filter
- [ ] Toggle favorite (logged in)
- [ ] Toggle favorite (logged out → redirect)
- [ ] Select date in booking modal
- [ ] Select time slot
- [ ] View price summary
- [ ] Confirm booking
- [ ] View reviews
- [ ] Add review (logged in)
- [ ] Share pitch
- [ ] Test on mobile device

## 🎯 Performance Tips

1. **Images**: Use WebP format, compress
2. **Caching**: Add React Query or SWR
3. **Lazy Load**: Implement infinite scroll
4. **CDN**: Use for static assets
5. **Indexes**: Already added in migration

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `FEATURE_ENHANCEMENTS.md` | Detailed feature docs |
| `SETUP_NEW_FEATURES.md` | Setup guide |
| `IMPLEMENTATION_SUMMARY.md` | Complete summary |
| `ARCHITECTURE_DIAGRAM.md` | System architecture |
| `DATABASE_MIGRATION.sql` | Database setup |
| `QUICK_REFERENCE.md` | This file |

## 🔗 Important Links

- **Supabase Dashboard**: Your project URL
- **SQL Editor**: Dashboard → SQL Editor
- **Table Editor**: Dashboard → Table Editor
- **Authentication**: Dashboard → Authentication

## 💡 Pro Tips

1. **Optimistic UI**: Updates UI before API call for instant feedback
2. **Skeleton Screens**: Shows loading state immediately
3. **RLS Policies**: Secure data at database level
4. **TypeScript**: Catch errors at compile time
5. **Mobile First**: Design for mobile, enhance for desktop

## 🎉 Success Indicators

✅ Users can search and filter pitches
✅ Favorites work with instant feedback
✅ Booking shows available time slots
✅ Reviews display with ratings
✅ Share button works
✅ Mobile responsive
✅ No console errors
✅ Build successful

## 📞 Need Help?

1. Check browser console for errors
2. Verify Supabase connection
3. Check database tables exist
4. Review RLS policies
5. Test with different users
6. Check documentation files

---

**Quick Command Reference**

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Type check
npx tsc --noEmit

# Check for errors
npm run build 2>&1 | grep -i error
```

---

**File Structure**

```
src/app/
├── components/
│   ├── DatePicker.tsx          ← Horizontal date picker
│   ├── EnhancedPitchCard.tsx   ← Card with extras
│   ├── PitchCardSkeleton.tsx   ← Loading state
│   ├── QuickFilters.tsx        ← Filter chips
│   ├── ReviewsSection.tsx      ← Reviews & ratings
│   ├── SearchBar.tsx           ← Global search
│   └── TimeSlotPicker.tsx      ← Time slots
├── pages/
│   ├── Home.tsx                ← Main page (updated)
│   └── PitchDetails.tsx        ← Details page (updated)
└── lib/
    └── supabase.ts             ← Types (updated)
```

---

**Remember**: Run `DATABASE_MIGRATION.sql` first! 🚀
