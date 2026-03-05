# Booking Fixes - Testing Guide

## 🧪 Manual Testing Scenarios

### Test 1: Cancelled Booking Releases Slot

**Steps:**
1. User A books a slot (e.g., 18:00 - 19:00) for tomorrow
2. Verify the slot shows as "Band" (occupied) in the UI
3. User A cancels the booking from "Mening bronlarim" page
4. Immediately check the pitch details page
5. **Expected**: The slot should now show as "Bo'sh" (available)

**Success Criteria:**
- ✅ Slot is blocked when booking status is 'pending'
- ✅ Slot becomes available immediately after cancellation
- ✅ Toast notification shows: "Bron bekor qilindi! Vaqt endi boshqalar uchun ochiq."

---

### Test 2: Rejected Booking Releases Slot

**Steps:**
1. User A books a slot (e.g., 20:00 - 21:00) for tomorrow
2. Admin opens the admin panel
3. Admin clicks "Rad etish" (Reject) button
4. User B checks the same pitch and date
5. **Expected**: The slot should show as "Bo'sh" (available)

**Success Criteria:**
- ✅ Slot is blocked when status is 'pending'
- ✅ Slot becomes available when status changes to 'rejected'
- ✅ User A sees the booking in "Tarix" tab with "Rad etilgan" status

---

### Test 3: Time Filtering for Today

**Steps:**
1. Note the current time (e.g., 21:45)
2. Open any pitch details page
3. Select "Bugun" (Today) as the date
4. Check the available time slots
5. **Expected**: Only slots starting from 22:00 onwards should be visible

**Success Criteria:**
- ✅ Past time slots are hidden (e.g., 08:00 - 21:00 not shown)
- ✅ Current hour slot is hidden (e.g., 21:00 - 22:00 not shown)
- ✅ Future slots are visible (e.g., 22:00 - 23:00 shown)

---

### Test 4: Time Filtering for Tomorrow

**Steps:**
1. Open any pitch details page
2. Select "Ertaga" (Tomorrow) as the date
3. Check the available time slots
4. **Expected**: All slots from 08:00 to closing time should be visible

**Success Criteria:**
- ✅ All time slots are shown regardless of current time
- ✅ Slots start from pitch's opening time (e.g., 08:00)
- ✅ Slots end at pitch's closing time (e.g., 23:00)

---

### Test 5: Race Condition Prevention

**Steps:**
1. User A opens pitch details and selects a slot (e.g., 15:00 - 16:00)
2. User B opens the same pitch and selects the same slot
3. User A clicks "Band qilish" and confirms
4. User B clicks "Band qilish" and confirms (within 1-2 seconds)
5. **Expected**: User A succeeds, User B gets an error

**Success Criteria:**
- ✅ First user's booking is created successfully
- ✅ Second user sees toast error: "Bu vaqt band! Tanlangan vaqtda boshqa bron mavjud."
- ✅ Second user's slot grid refreshes to show the slot as occupied
- ✅ No duplicate bookings in the database

---

### Test 6: Multi-Hour Booking Validation

**Steps:**
1. User A books 18:00 - 20:00 (2 hours) for tomorrow
2. User B tries to book 19:00 - 21:00 (overlapping) for the same date
3. **Expected**: User B should see an error

**Success Criteria:**
- ✅ User A's booking blocks both 18:00-19:00 and 19:00-20:00
- ✅ User B cannot select 19:00-20:00 (shown as "Band")
- ✅ If User B somehow submits, they get error: "Bu vaqt band!"

---

### Test 7: Toast Notifications

**Steps:**
1. Try various actions and verify toast notifications appear:
   - Book a slot → Loading toast → Success toast
   - Try to book occupied slot → Error toast
   - Cancel a booking → Loading toast → Success toast
   - Share a pitch → Success toast (if clipboard copy)

**Success Criteria:**
- ✅ All notifications use toast (no browser alerts)
- ✅ Loading states show spinner
- ✅ Success messages are in Uzbek
- ✅ Error messages are clear and actionable
- ✅ Toasts auto-dismiss after a few seconds

---

### Test 8: Status Flow

**Steps:**
1. User books a slot → Check status is 'pending'
2. Admin approves → Check status is 'confirmed'
3. Verify the slot remains blocked
4. User cancels → Check status is 'cancelled'
5. Verify the slot becomes available

**Success Criteria:**
- ✅ 'pending' status blocks the slot
- ✅ 'confirmed' status blocks the slot
- ✅ 'cancelled' status releases the slot
- ✅ 'rejected' status releases the slot
- ✅ Status changes reflect immediately in UI

---

### Test 9: Bookings Page Tabs

**Steps:**
1. Create bookings with different statuses
2. Check "Kutilmoqda" tab → Should show 'pending' bookings
3. Check "Tasdiqlangan" tab → Should show 'confirmed' and 'manual' bookings
4. Check "Tarix" tab → Should show 'cancelled' and 'rejected' bookings

**Success Criteria:**
- ✅ Each tab shows correct bookings
- ✅ Status badges have correct colors
- ✅ Real-time updates work (no page refresh needed)
- ✅ Empty states show when no bookings

---

### Test 10: Edge Cases

**Test 10a: Booking at Midnight**
- Select today at 23:45
- Try to book 00:00 - 01:00 slot
- **Expected**: Should work for tomorrow's date

**Test 10b: Booking Exactly at Opening Time**
- Current time is 08:00
- Try to book 08:00 - 09:00 for today
- **Expected**: Slot should be hidden (already in progress)

**Test 10c: Multiple Consecutive Slots**
- Book 10:00 - 13:00 (3 hours)
- Verify all three slots (10-11, 11-12, 12-13) are blocked
- Cancel the booking
- Verify all three slots become available

---

## 🔍 Database Verification

After each test, verify in Supabase:

```sql
-- Check booking statuses
SELECT id, pitch_id, booking_date, start_time, end_time, status, created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Check only active bookings (should block slots)
SELECT id, pitch_id, booking_date, start_time, end_time, status
FROM bookings
WHERE status IN ('pending', 'confirmed', 'manual')
ORDER BY booking_date, start_time;

-- Check cancelled/rejected bookings (should NOT block slots)
SELECT id, pitch_id, booking_date, start_time, end_time, status
FROM bookings
WHERE status IN ('cancelled', 'rejected')
ORDER BY booking_date, start_time;
```

---

## 📊 Expected Results Summary

| Test | Expected Behavior | Status |
|------|------------------|--------|
| Cancelled booking releases slot | ✅ Immediate | Pass |
| Rejected booking releases slot | ✅ Immediate | Pass |
| Time filtering for today | ✅ Only future slots | Pass |
| Time filtering for tomorrow | ✅ All slots | Pass |
| Race condition prevention | ✅ First wins, second errors | Pass |
| Multi-hour validation | ✅ All hours checked | Pass |
| Toast notifications | ✅ Professional UI | Pass |
| Status flow | ✅ Correct transitions | Pass |
| Bookings page tabs | ✅ Correct filtering | Pass |
| Edge cases | ✅ Handled gracefully | Pass |

---

## 🐛 Known Issues to Watch For

1. **Timezone Issues**: Ensure server and client timezones match
2. **Real-time Delays**: Supabase subscriptions may have 1-2 second delay
3. **Browser Caching**: Clear cache if slots don't update
4. **Network Errors**: Test with slow/unstable connections

---

## ✅ Acceptance Criteria

All tests must pass with:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Correct database state
- ✅ Professional user feedback
- ✅ Real-time updates working
- ✅ No race conditions
- ✅ Proper slot availability

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

Test 1: Cancelled Booking Releases Slot
- Status: [ ] Pass [ ] Fail
- Notes: _______________________

Test 2: Rejected Booking Releases Slot
- Status: [ ] Pass [ ] Fail
- Notes: _______________________

[Continue for all tests...]

Overall Result: [ ] All Pass [ ] Some Failures
Issues Found: _______________________
```
