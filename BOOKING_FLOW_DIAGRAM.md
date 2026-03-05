# Booking System Flow Diagram

## 🔄 Complete Booking Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SELECTS DATE & TIME                     │
│                                                                 │
│  Today (21:45)  →  Shows: 22:00, 23:00 (future slots only)    │
│  Tomorrow       →  Shows: 08:00 - 23:00 (all slots)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FETCH BOOKED SLOTS FROM DATABASE                   │
│                                                                 │
│  Query: SELECT * FROM bookings                                  │
│         WHERE status IN ('pending', 'confirmed', 'manual')      │
│         AND booking_date = selected_date                        │
│         AND pitch_id = selected_pitch                           │
│                                                                 │
│  Result: Mark these slots as "Band" (Occupied)                 │
│  Note: 'cancelled' and 'rejected' are NOT included             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   USER SELECTS TIME SLOTS                       │
│                                                                 │
│  Available slots: Green border, clickable                       │
│  Booked slots: Grey, disabled                                   │
│  Selected slots: Green background                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  USER CLICKS "BAND QILISH"                      │
│                                                                 │
│  Toast: ⏳ "Bron qilinmoqda..."                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              DOUBLE-CHECK AVAILABILITY (Critical!)              │
│                                                                 │
│  Query: SELECT * FROM bookings                                  │
│         WHERE status IN ('pending', 'confirmed', 'manual')      │
│         AND booking_date = selected_date                        │
│         AND pitch_id = selected_pitch                           │
│                                                                 │
│  Check: Does any existing booking overlap with selected slots?  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │  CONFLICT FOUND   │  │   NO CONFLICT     │
        └───────────────────┘  └───────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │ ❌ Show Error     │  │ ✅ Create Booking │
        │                   │  │                   │
        │ Toast:            │  │ INSERT INTO       │
        │ "Bu vaqt band!"   │  │ bookings          │
        │                   │  │ status: 'pending' │
        │ Refresh slots     │  └───────────────────┘
        └───────────────────┘           ↓
                                ┌───────────────────┐
                                │ ✅ Success Toast  │
                                │                   │
                                │ "Muvaffaqiyatli   │
                                │ band qilindi!"    │
                                └───────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING STATUS: PENDING                      │
│                                                                 │
│  - Slot is BLOCKED for other users                             │
│  - Visible in "Kutilmoqda" tab                                 │
│  - Waiting for admin approval                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │  ADMIN APPROVES   │  │  ADMIN REJECTS    │
        │                   │  │                   │
        │ Status:           │  │ Status:           │
        │ 'confirmed'       │  │ 'rejected'        │
        └───────────────────┘  └───────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │ Slot REMAINS      │  │ Slot RELEASED     │
        │ BLOCKED ✅        │  │ IMMEDIATELY ✅    │
        │                   │  │                   │
        │ Visible in        │  │ Visible in        │
        │ "Tasdiqlangan"    │  │ "Tarix" tab       │
        └───────────────────┘  └───────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │ User can still    │  │ Other users can   │
        │ CANCEL            │  │ book this slot    │
        │                   │  │ IMMEDIATELY       │
        │ Status:           │  └───────────────────┘
        │ 'cancelled'       │
        │                   │
        │ Slot RELEASED ✅  │
        └───────────────────┘
```

## 🎯 Status Matrix

| Status | Blocks Slot? | User Action | Admin Action | Visible Tab |
|--------|-------------|-------------|--------------|-------------|
| `pending` | ✅ YES | Can cancel | Can approve/reject | Kutilmoqda |
| `confirmed` | ✅ YES | Can cancel | - | Tasdiqlangan |
| `manual` | ✅ YES | - | Can modify | Tasdiqlangan |
| `rejected` | ❌ NO | - | - | Tarix |
| `cancelled` | ❌ NO | - | - | Tarix |

## 🔄 Real-time Updates Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE REAL-TIME SUBSCRIPTION                │
│                                                                 │
│  Channel: 'user_bookings_changes'                              │
│  Event: INSERT, UPDATE, DELETE                                  │
│  Table: bookings                                                │
│  Filter: user_id = current_user.id                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CHANGE DETECTED                              │
│                                                                 │
│  - Booking created                                              │
│  - Status updated (pending → confirmed/rejected/cancelled)      │
│  - Booking deleted                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  AUTO-REFRESH UI                                │
│                                                                 │
│  - Bookings list updates                                        │
│  - Available slots refresh                                      │
│  - Status badges update                                         │
│  - No page reload needed                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🕐 Time Filtering Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT TIME: 21:45                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │  SELECT "BUGUN"   │  │ SELECT "ERTAGA"   │
        │  (Today)          │  │ (Tomorrow)        │
        └───────────────────┘  └───────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │ Filter Past Slots │  │ Show All Slots    │
        │                   │  │                   │
        │ Hide:             │  │ Show:             │
        │ 08:00 - 09:00 ❌  │  │ 08:00 - 09:00 ✅  │
        │ 09:00 - 10:00 ❌  │  │ 09:00 - 10:00 ✅  │
        │ ...               │  │ ...               │
        │ 21:00 - 22:00 ❌  │  │ 21:00 - 22:00 ✅  │
        │                   │  │ 22:00 - 23:00 ✅  │
        │ Show:             │  │ 23:00 - 00:00 ✅  │
        │ 22:00 - 23:00 ✅  │  └───────────────────┘
        │ 23:00 - 00:00 ✅  │
        └───────────────────┘
```

## 🚫 Conflict Detection

```
┌─────────────────────────────────────────────────────────────────┐
│              USER A BOOKS: 18:00 - 20:00                        │
│                                                                 │
│  Blocks: 18:00-19:00, 19:00-20:00                              │
│  Status: 'pending'                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              USER B TRIES: 19:00 - 21:00                        │
│                                                                 │
│  Wants: 19:00-20:00, 20:00-21:00                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONFLICT CHECK                               │
│                                                                 │
│  User A's booking: 18:00 - 20:00                               │
│  User B's request: 19:00 - 21:00                               │
│                                                                 │
│  Overlap detected: 19:00 - 20:00 ❌                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RESULT                                       │
│                                                                 │
│  ❌ User B's booking REJECTED                                   │
│  Toast: "Bu vaqt band! Tanlangan vaqtda boshqa bron mavjud."  │
│  Action: Refresh slots, show 19:00-20:00 as occupied          │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 UI State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIME SLOT STATES                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   BO'SH      │  │   TANLANGAN  │  │     BAND     │
│  (Available) │  │  (Selected)  │  │  (Occupied)  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Grey border  │  │ Green bg     │  │ Grey bg      │
│ White text   │  │ White text   │  │ Grey text    │
│ Clickable ✅ │  │ Clickable ✅ │  │ Disabled ❌  │
│              │  │ Border: 2px  │  │ Opacity: 50% │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 📱 Toast Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACTION TRIGGERED                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LOADING TOAST                                │
│                                                                 │
│  ⏳ "Bron qilinmoqda..."                                       │
│  ⏳ "Bekor qilinmoqda..."                                      │
│  ⏳ "Yuklanmoqda..."                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │  SUCCESS          │  │  ERROR            │
        └───────────────────┘  └───────────────────┘
                    ↓                   ↓
        ┌───────────────────┐  ┌───────────────────┐
        │ ✅ Green icon     │  │ ❌ Red icon       │
        │ Success message   │  │ Error message     │
        │ Description       │  │ Actionable tip    │
        │ Auto-dismiss 3s   │  │ Auto-dismiss 5s   │
        └───────────────────┘  └───────────────────┘
```

## 🔐 Security & Validation

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: UI Validation
├─ Disable booked slots
├─ Require consecutive selection
└─ Show visual feedback

Layer 2: Client-side Check
├─ Fetch current bookings
├─ Filter by status
└─ Mark occupied slots

Layer 3: Pre-insert Validation (Critical!)
├─ Double-check availability
├─ Check for race conditions
└─ Validate time range

Layer 4: Database Constraints
├─ Row Level Security (RLS)
├─ Foreign key constraints
└─ Trigger validations

Layer 5: Real-time Updates
├─ Supabase subscriptions
├─ Auto-refresh on changes
└─ Conflict resolution
```

## 🎯 Key Takeaways

1. **Cancelled/Rejected = Available**: These statuses immediately free up slots
2. **Double-check is Critical**: Prevents race conditions
3. **Real-time Updates**: No manual refresh needed
4. **Smart Time Filtering**: Today vs. future dates handled differently
5. **Professional UX**: Toast notifications, loading states, clear errors
6. **Multi-hour Validation**: Each hour in range is checked
7. **Status Flow**: pending → confirmed/rejected/cancelled

---

**Visual Guide Version**: 1.0  
**Last Updated**: March 5, 2026  
**Status**: ✅ Complete
