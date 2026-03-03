# Architecture Diagram - Enhanced Sports Booking Platform

## Component Hierarchy

```
App
└── Routes
    ├── Home (/)
    │   ├── Header
    │   │   ├── Logo + Dynamic Greeting
    │   │   └── Map Toggle Button
    │   ├── SearchBar
    │   ├── QuickFilters
    │   ├── PitchGrid
    │   │   ├── EnhancedPitchCard (x N)
    │   │   │   ├── PitchCardSlider
    │   │   │   ├── Favorite Button (❤️)
    │   │   │   ├── Rating Badge (⭐)
    │   │   │   └── Distance Badge (📍)
    │   │   └── PitchCardSkeleton (loading)
    │   └── BottomNav
    │
    ├── PitchDetails (/pitch/:id)
    │   ├── Header
    │   │   ├── Back Button
    │   │   └── Share Button
    │   ├── PitchImageSlider
    │   ├── Pitch Info
    │   │   ├── Name, Location
    │   │   ├── Price Card
    │   │   ├── Google Maps Link
    │   │   └── Amenities
    │   ├── ReviewsSection
    │   │   ├── Average Rating
    │   │   ├── Add Review Form
    │   │   └── Reviews List
    │   └── Sticky Booking Button
    │
    ├── BookingModal (overlay)
    │   ├── Header
    │   ├── DatePicker (horizontal)
    │   ├── TimeSlotPicker (color-coded)
    │   ├── Price Summary
    │   └── Confirm Button
    │
    └── Other Routes
        ├── Login
        ├── Register
        ├── Bookings
        ├── Notifications
        └── Profile
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Supabase                             │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  ├── pitches (existing)                                     │
│  ├── bookings (existing)                                    │
│  ├── profiles (existing)                                    │
│  ├── favorites (NEW) ──────────────┐                        │
│  └── reviews (NEW) ────────────────┼────────────┐           │
└────────────────────────────────────┼────────────┼───────────┘
                                     │            │
                                     ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│  State Management:                                           │
│  ├── pitches: Pitch[]                                       │
│  ├── filteredPitches: Pitch[]                               │
│  ├── favorites: Set<string>                                 │
│  ├── reviews: Review[]                                      │
│  ├── searchQuery: string                                    │
│  ├── activeFilter: string | null                            │
│  └── user: User | null                                      │
└─────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
├─────────────────────────────────────────────────────────────┤
│  User Actions:                                               │
│  ├── Search pitches ──────────► Filter pitches              │
│  ├── Apply quick filter ──────► Sort/filter pitches         │
│  ├── Toggle favorite ─────────► Optimistic UI update        │
│  ├── Select date/time ────────► Fetch booked slots          │
│  ├── Submit review ────────────► Add to reviews             │
│  └── Share pitch ──────────────► Native share dialog        │
└─────────────────────────────────────────────────────────────┘
```

## Feature Flow Diagrams

### 1. Favorite Toggle Flow

```
User clicks ❤️
     │
     ▼
Update UI immediately (Optimistic)
     │
     ├─────────────────────┐
     ▼                     ▼
Add to favorites      Remove from favorites
     │                     │
     ▼                     ▼
Supabase INSERT      Supabase DELETE
     │                     │
     ├─────────────────────┤
     │                     │
     ▼                     ▼
Success ✓            Error ✗
     │                     │
     │                     ▼
     │              Rollback UI
     │                     │
     └─────────────────────┘
```

### 2. Booking Flow

```
User clicks "Band qilish"
     │
     ▼
Check authentication
     │
     ├─────────────────┐
     ▼                 ▼
Authenticated    Not authenticated
     │                 │
     ▼                 ▼
Open modal      Redirect to login
     │
     ▼
Select date (DatePicker)
     │
     ▼
Fetch booked slots for date
     │
     ▼
Display TimeSlotPicker
     │
     ▼
User selects time slot
     │
     ▼
Show price summary
     │
     ▼
User confirms
     │
     ▼
Create booking in Supabase
     │
     ├─────────────────┐
     ▼                 ▼
Success          Overlap error
     │                 │
     ▼                 ▼
Show success    Show error message
modal           "Bu vaqtda band"
     │
     ▼
Navigate to bookings
```

### 3. Review Submission Flow

```
User clicks "Sharh qo'shish"
     │
     ▼
Check authentication
     │
     ├─────────────────┐
     ▼                 ▼
Authenticated    Not authenticated
     │                 │
     ▼                 ▼
Show form       Hide button
     │
     ▼
User selects rating (1-5 stars)
     │
     ▼
User writes comment
     │
     ▼
User clicks "Yuborish"
     │
     ▼
Validate input
     │
     ├─────────────────┐
     ▼                 ▼
Valid            Invalid
     │                 │
     ▼                 ▼
Submit to       Show error
Supabase
     │
     ├─────────────────┐
     ▼                 ▼
Success          Error
     │                 │
     ▼                 ▼
Refresh reviews  Show alert
Close form
```

### 4. Search & Filter Flow

```
User types in search bar
     │
     ▼
Update searchQuery state
     │
     ▼
Filter pitches by name/location
     │
     ▼
Update filteredPitches
     │
     ▼
Re-render grid
     
     
User clicks quick filter
     │
     ▼
Update activeFilter state
     │
     ├──────────────────────────────┐
     ▼                              ▼
"Eng arzon"                   "Dushi bor"
     │                              │
     ▼                              ▼
Sort by price              Filter by amenities
     │                              │
     └──────────────────────────────┘
                    │
                    ▼
          Update filteredPitches
                    │
                    ▼
              Re-render grid
```

## Database Schema Relationships

```
┌──────────────┐
│ auth.users   │
└──────┬───────┘
       │
       │ (user_id)
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│  profiles    │                  │  favorites   │
│              │                  │              │
│  id (PK)     │                  │  id (PK)     │
│  email       │                  │  user_id (FK)│
│  full_name   │                  │  pitch_id(FK)│
│  phone       │                  └──────┬───────┘
│  role        │                         │
└──────────────┘                         │
                                         │
       ┌─────────────────────────────────┤
       │                                 │
       │                                 │
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│   pitches    │◄─────────────────│   reviews    │
│              │                  │              │
│  id (PK)     │                  │  id (PK)     │
│  name        │                  │  pitch_id(FK)│
│  location    │                  │  user_id (FK)│
│  price       │                  │  rating      │
│  images[]    │                  │  comment     │
│  amenities[] │                  └──────────────┘
│  latitude    │
│  longitude   │
└──────┬───────┘
       │
       │ (pitch_id)
       │
       ▼
┌──────────────┐
│  bookings    │
│              │
│  id (PK)     │
│  pitch_id(FK)│
│  user_id (FK)│
│  date        │
│  start_time  │
│  end_time    │
│  status      │
└──────────────┘
```

## Component Dependencies

```
Home.tsx
├── imports
│   ├── supabase (data)
│   ├── useAuth (user state)
│   ├── SearchBar
│   ├── QuickFilters
│   ├── EnhancedPitchCard
│   │   └── PitchCardSlider
│   ├── PitchCardSkeleton
│   └── BottomNav
└── state
    ├── pitches
    ├── filteredPitches
    ├── favorites
    ├── searchQuery
    └── activeFilter

PitchDetails.tsx
├── imports
│   ├── supabase (data)
│   ├── useAuth (user state)
│   ├── PitchImageSlider
│   ├── BookingModal
│   │   ├── DatePicker
│   │   └── TimeSlotPicker
│   └── ReviewsSection
└── state
    ├── pitch
    ├── bookedSlots
    ├── showBookingModal
    └── showSuccess

BookingModal.tsx
├── imports
│   ├── DatePicker
│   └── TimeSlotPicker
└── state
    ├── selectedDate
    ├── selectedTime
    └── isSubmitting

ReviewsSection.tsx
├── imports
│   ├── supabase (data)
│   └── useAuth (user state)
└── state
    ├── reviews
    ├── showAddReview
    ├── rating
    └── comment
```

## API Calls Summary

### Home Page
```typescript
// Fetch all active pitches
GET /pitches?is_active=true

// Fetch user favorites (if authenticated)
GET /favorites?user_id=eq.{userId}

// Toggle favorite
POST /favorites { user_id, pitch_id }
DELETE /favorites?user_id=eq.{userId}&pitch_id=eq.{pitchId}
```

### Pitch Details
```typescript
// Fetch single pitch
GET /pitches?id=eq.{pitchId}

// Fetch booked slots for date
GET /bookings?pitch_id=eq.{pitchId}&booking_date=eq.{date}

// Create booking
POST /bookings { pitch_id, user_id, date, start_time, end_time }

// Fetch reviews
GET /reviews?pitch_id=eq.{pitchId}
  .select('*, profiles(full_name, email)')

// Submit review
POST /reviews { pitch_id, user_id, rating, comment }
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│                    Optimization Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Skeleton Screens                                        │
│     └─► Show loading state immediately                      │
│                                                              │
│  2. Optimistic UI                                           │
│     └─► Update UI before API response                       │
│                                                              │
│  3. Database Indexes                                        │
│     ├─► favorites(user_id, pitch_id)                        │
│     └─► reviews(pitch_id, user_id)                          │
│                                                              │
│  4. Lazy Loading                                            │
│     └─► Images load on demand                               │
│                                                              │
│  5. Efficient Queries                                       │
│     ├─► Only fetch necessary fields                         │
│     └─► Use proper filters and ordering                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Authentication (Supabase Auth)                          │
│     └─► JWT tokens, session management                      │
│                                                              │
│  2. Row Level Security (RLS)                                │
│     ├─► favorites: user can only manage own                 │
│     ├─► reviews: user can only submit own                   │
│     └─► bookings: user can only view own                    │
│                                                              │
│  3. Input Validation                                        │
│     ├─► Rating: 1-5 constraint                              │
│     ├─► Unique constraints                                  │
│     └─► Foreign key constraints                             │
│                                                              │
│  4. Protected Routes                                        │
│     └─► Redirect to login if not authenticated              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (Vite + React + TS)                       │
│                                                              │
│  Hosted on: Vercel / Netlify / Custom                       │
│  Build: npm run build                                       │
│  Output: dist/                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                    (Supabase Cloud)                          │
│                                                              │
│  ├── PostgreSQL Database                                    │
│  ├── Authentication                                         │
│  ├── Storage (images)                                       │
│  └── Real-time subscriptions                                │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Scalable component structure
- ✅ Clear data flow
- ✅ Optimistic UI updates
- ✅ Secure authentication
- ✅ Efficient database queries
- ✅ Mobile-first design
- ✅ Production-ready deployment
