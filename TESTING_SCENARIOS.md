# Testing Scenarios - Enhanced Features

## 🧪 Test Plan Overview

This document provides comprehensive testing scenarios for all new features.

## 1️⃣ Home Page Features

### Test 1.1: Dynamic Greeting
**Objective**: Verify personalized greeting displays correctly

**Steps**:
1. Open app without logging in
2. Verify greeting shows "Salom, Mehmon!"
3. Login with test account
4. Verify greeting shows "Salom, [Your Name]!"
5. Logout
6. Verify greeting returns to "Salom, Mehmon!"

**Expected Result**: Greeting updates based on authentication state

---

### Test 1.2: Global Search
**Objective**: Verify search filters pitches in real-time

**Steps**:
1. Navigate to home page
2. Type "Olimpiya" in search bar
3. Verify only matching pitches display
4. Clear search (click X button)
5. Verify all pitches display again
6. Type "Chilonzor" (location)
7. Verify pitches in that location display

**Expected Result**: Search filters by name and location instantly

---

### Test 1.3: Quick Filters
**Objective**: Verify filter chips work correctly

**Test 1.3a: Eng arzon (Cheapest)**
1. Click "Eng arzon" filter
2. Verify pitches sort by price (lowest first)
3. Click again to deactivate
4. Verify original order restored

**Test 1.3b: Dushi bor (Has Shower)**
1. Click "Dushi bor" filter
2. Verify only pitches with shower amenity display
3. Click again to deactivate
4. Verify all pitches display

**Test 1.3c: 24/7 ochiq**
1. Click "24/7 ochiq" filter
2. Verify only 24-hour pitches display
3. Click again to deactivate

**Expected Result**: Each filter works independently

---

### Test 1.4: Enhanced Pitch Cards
**Objective**: Verify card enhancements display correctly

**Steps**:
1. View home page pitch grid
2. Verify each card shows:
   - ⭐ Rating badge (top-left)
   - ❤️ Favorite button (top-right)
   - 📍 Distance badge (bottom-left)
   - Image slider
   - Pitch name and location
   - Price
   - "Batafsil" button

**Expected Result**: All elements visible and properly positioned

---

### Test 1.5: Favorite Toggle (Authenticated)
**Objective**: Verify favorite functionality with optimistic UI

**Steps**:
1. Login to account
2. Click heart icon on a pitch card
3. Verify heart turns red immediately
4. Refresh page
5. Verify heart remains red
6. Click heart again
7. Verify heart turns white immediately
8. Refresh page
9. Verify heart remains white

**Expected Result**: Optimistic UI updates instantly, persists after refresh

---

### Test 1.6: Favorite Toggle (Unauthenticated)
**Objective**: Verify redirect to login when not authenticated

**Steps**:
1. Logout if logged in
2. Click heart icon on any pitch card
3. Verify redirect to login page
4. Login
5. Verify redirect back to home page

**Expected Result**: Unauthenticated users redirected to login

---

### Test 1.7: Skeleton Loading
**Objective**: Verify loading state displays correctly

**Steps**:
1. Clear browser cache
2. Reload home page
3. Verify skeleton cards display while loading
4. Wait for data to load
5. Verify skeleton replaced with actual cards

**Expected Result**: Smooth transition from skeleton to content

---

### Test 1.8: Map View Toggle
**Objective**: Verify map view toggle works

**Steps**:
1. Click map icon in header
2. Verify map view placeholder displays
3. Click map icon again
4. Verify list view displays

**Expected Result**: Toggle between list and map view

---

## 2️⃣ Pitch Details Features

### Test 2.1: Share Functionality
**Objective**: Verify share button works

**Test 2.1a: Native Share (Mobile)**
1. Open pitch details on mobile device
2. Click share button (top-right)
3. Verify native share dialog opens
4. Select Telegram
5. Verify pitch info shared correctly

**Test 2.1b: Clipboard Fallback (Desktop)**
1. Open pitch details on desktop
2. Click share button
3. Verify "Havola nusxalandi!" alert
4. Paste in text editor
5. Verify URL copied correctly

**Expected Result**: Share works on all devices

---

### Test 2.2: Reviews Display
**Objective**: Verify reviews section displays correctly

**Steps**:
1. Navigate to pitch details
2. Scroll to "Sharhlar" section
3. Verify average rating displays
4. Verify review count displays
5. Verify reviews list displays
6. Verify each review shows:
   - User name/email
   - Rating (stars)
   - Comment
   - Date

**Expected Result**: All review information visible

---

### Test 2.3: Add Review (Authenticated)
**Objective**: Verify review submission works

**Steps**:
1. Login to account
2. Navigate to pitch details
3. Scroll to "Sharhlar" section
4. Click "Sharh qo'shish"
5. Select 5 stars
6. Type comment: "Juda yaxshi maydon!"
7. Click "Yuborish"
8. Verify form closes
9. Verify new review appears in list
10. Verify average rating updates

**Expected Result**: Review submitted and displayed

---

### Test 2.4: Add Review (Duplicate)
**Objective**: Verify one review per user per pitch

**Steps**:
1. Submit a review (as in Test 2.3)
2. Try to submit another review
3. Verify error message or form disabled

**Expected Result**: Cannot submit duplicate review

---

### Test 2.5: Add Review (Unauthenticated)
**Objective**: Verify review button hidden when not logged in

**Steps**:
1. Logout if logged in
2. Navigate to pitch details
3. Scroll to "Sharhlar" section
4. Verify "Sharh qo'shish" button not visible

**Expected Result**: Button hidden for guests

---

## 3️⃣ Booking Modal Features

### Test 3.1: Horizontal Date Picker
**Objective**: Verify date picker displays and works

**Steps**:
1. Click "Band qilish" on any pitch
2. Verify modal opens
3. Verify horizontal date picker shows 7 days
4. Verify today is highlighted
5. Click tomorrow's date
6. Verify selection updates
7. Verify time slots refresh

**Expected Result**: Date picker interactive and responsive

---

### Test 3.2: Time Slot Selection
**Objective**: Verify time slots display with correct colors

**Steps**:
1. Open booking modal
2. Select today's date
3. Verify time slots display
4. Identify available slot (white border)
5. Click available slot
6. Verify slot turns green
7. Identify booked slot (grey)
8. Try to click booked slot
9. Verify no action (disabled)

**Expected Result**: Color coding works correctly

---

### Test 3.3: Price Summary
**Objective**: Verify price calculation displays

**Steps**:
1. Open booking modal
2. Select date and time
3. Scroll to price summary section
4. Verify displays:
   - "1 soat × 150k = 150k so'm"
   - "Jami: 150,000 so'm"
5. Verify price matches pitch price

**Expected Result**: Price calculated and displayed correctly

---

### Test 3.4: Booking Confirmation
**Objective**: Verify booking submission works

**Steps**:
1. Open booking modal
2. Select date and available time slot
3. Click "Band qilish"
4. Verify button shows "Yuklanmoqda..."
5. Wait for success modal
6. Verify success message displays
7. Click "Mening bandlovlarim"
8. Verify redirect to bookings page
9. Verify new booking appears

**Expected Result**: Booking created successfully

---

### Test 3.5: Booking Overlap Prevention
**Objective**: Verify cannot book already booked slot

**Steps**:
1. Book a specific time slot
2. Logout and login as different user
3. Try to book same pitch, date, time
4. Verify error message
5. Verify booking not created

**Expected Result**: Overlap prevented with clear error

---

## 4️⃣ Integration Tests

### Test 4.1: Search + Filter Combination
**Objective**: Verify search and filters work together

**Steps**:
1. Type "Olimpiya" in search
2. Click "Eng arzon" filter
3. Verify results filtered by both
4. Clear search
5. Verify filter still active
6. Deactivate filter
7. Verify all pitches display

**Expected Result**: Search and filters combine correctly

---

### Test 4.2: Favorite + Booking Flow
**Objective**: Verify favorite and booking work together

**Steps**:
1. Favorite a pitch
2. Click on favorited pitch
3. Book a time slot
4. Navigate back to home
5. Verify pitch still favorited
6. Go to bookings page
7. Verify booking exists

**Expected Result**: Both features work independently

---

### Test 4.3: Review + Share Flow
**Objective**: Verify review and share work together

**Steps**:
1. Submit a review
2. Click share button
3. Share pitch link
4. Open shared link in new tab
5. Verify your review displays

**Expected Result**: Review visible in shared link

---

## 5️⃣ Edge Cases

### Test 5.1: Empty States
**Objective**: Verify empty states display correctly

**Test 5.1a: No Pitches**
1. Search for non-existent pitch
2. Verify "Maydonlar topilmadi" message
3. Verify "Filtrlarni tozalash" button

**Test 5.1b: No Reviews**
1. Navigate to pitch with no reviews
2. Verify "Hali sharhlar yo'q" message

**Test 5.1c: No Favorites**
1. Remove all favorites
2. Navigate to favorites page (if exists)
3. Verify empty state message

**Expected Result**: Clear empty state messages

---

### Test 5.2: Network Errors
**Objective**: Verify error handling

**Steps**:
1. Disconnect internet
2. Try to favorite a pitch
3. Verify error handling
4. Try to submit review
5. Verify error message
6. Try to book pitch
7. Verify error message

**Expected Result**: Graceful error handling

---

### Test 5.3: Long Content
**Objective**: Verify UI handles long content

**Test 5.3a: Long Pitch Name**
1. Create pitch with very long name
2. Verify name truncates with ellipsis

**Test 5.3b: Long Review Comment**
1. Submit review with very long comment
2. Verify comment displays properly

**Test 5.3c: Many Amenities**
1. View pitch with many amenities
2. Verify horizontal scroll works

**Expected Result**: Long content handled gracefully

---

### Test 5.4: Rapid Interactions
**Objective**: Verify UI handles rapid clicks

**Steps**:
1. Rapidly click favorite button 10 times
2. Verify only one API call made
3. Rapidly click booking button
4. Verify modal opens once
5. Rapidly submit review
6. Verify only one review created

**Expected Result**: Debouncing prevents duplicate actions

---

## 6️⃣ Performance Tests

### Test 6.1: Load Time
**Objective**: Verify page loads quickly

**Steps**:
1. Clear cache
2. Open home page
3. Measure time to interactive
4. Verify < 3 seconds on 3G

**Expected Result**: Fast load time

---

### Test 6.2: Scroll Performance
**Objective**: Verify smooth scrolling

**Steps**:
1. Load home page with many pitches
2. Scroll rapidly up and down
3. Verify no lag or jank
4. Check frame rate (should be 60fps)

**Expected Result**: Smooth 60fps scrolling

---

### Test 6.3: Image Loading
**Objective**: Verify images load efficiently

**Steps**:
1. Open home page
2. Verify images load progressively
3. Scroll down
4. Verify lazy loading works
5. Check network tab
6. Verify images optimized

**Expected Result**: Efficient image loading

---

## 7️⃣ Mobile-Specific Tests

### Test 7.1: Touch Interactions
**Objective**: Verify touch targets are adequate

**Steps**:
1. Test on mobile device
2. Tap all buttons
3. Verify minimum 44x44px tap targets
4. Test swipe on image sliders
5. Test horizontal scroll on filters

**Expected Result**: All interactions work smoothly

---

### Test 7.2: Orientation Changes
**Objective**: Verify layout adapts to orientation

**Steps**:
1. Open app in portrait
2. Rotate to landscape
3. Verify layout adjusts
4. Rotate back to portrait
5. Verify layout restores

**Expected Result**: Responsive to orientation

---

### Test 7.3: Keyboard Behavior
**Objective**: Verify keyboard doesn't break layout

**Steps**:
1. Focus search input
2. Verify keyboard appears
3. Verify content scrolls
4. Type search query
5. Dismiss keyboard
6. Verify layout restores

**Expected Result**: Keyboard handled properly

---

## 8️⃣ Accessibility Tests

### Test 8.1: Keyboard Navigation
**Objective**: Verify keyboard navigation works

**Steps**:
1. Use Tab key to navigate
2. Verify focus visible
3. Use Enter to activate buttons
4. Use Escape to close modals

**Expected Result**: Full keyboard support

---

### Test 8.2: Screen Reader
**Objective**: Verify screen reader compatibility

**Steps**:
1. Enable screen reader
2. Navigate home page
3. Verify elements announced correctly
4. Test booking flow
5. Verify all actions accessible

**Expected Result**: Screen reader friendly

---

### Test 8.3: Color Contrast
**Objective**: Verify sufficient color contrast

**Steps**:
1. Use contrast checker tool
2. Check all text colors
3. Verify WCAG AA compliance
4. Check button states
5. Verify icon visibility

**Expected Result**: Meets WCAG AA standards

---

## 9️⃣ Security Tests

### Test 9.1: Authentication
**Objective**: Verify protected routes work

**Steps**:
1. Logout
2. Try to favorite pitch
3. Verify redirect to login
4. Try to submit review
5. Verify button hidden
6. Try to book pitch
7. Verify redirect to login

**Expected Result**: Protected actions require auth

---

### Test 9.2: Data Isolation
**Objective**: Verify users can only see their data

**Steps**:
1. Login as User A
2. Favorite some pitches
3. Logout
4. Login as User B
5. Verify User A's favorites not visible
6. Verify User B has separate favorites

**Expected Result**: Data properly isolated

---

### Test 9.3: Input Validation
**Objective**: Verify input validation works

**Steps**:
1. Try to submit review with rating 0
2. Verify error or disabled
3. Try to submit review with rating 6
4. Verify error or disabled
5. Try to submit empty comment
6. Verify validation message

**Expected Result**: Invalid input rejected

---

## 🔟 Regression Tests

### Test 10.1: Existing Features
**Objective**: Verify existing features still work

**Steps**:
1. Test login/logout
2. Test registration
3. Test profile page
4. Test bookings page
5. Test notifications

**Expected Result**: No regressions

---

## 📊 Test Results Template

```
Test ID: [e.g., 1.1]
Test Name: [e.g., Dynamic Greeting]
Date: [YYYY-MM-DD]
Tester: [Name]
Environment: [Dev/Staging/Prod]
Device: [Desktop/Mobile/Tablet]
Browser: [Chrome/Safari/Firefox]

Result: [✅ Pass / ❌ Fail]
Notes: [Any observations]
Screenshots: [If applicable]
```

---

## 🎯 Test Coverage Summary

| Feature | Tests | Priority |
|---------|-------|----------|
| Home Page | 8 | High |
| Pitch Details | 5 | High |
| Booking Modal | 5 | High |
| Integration | 3 | Medium |
| Edge Cases | 4 | Medium |
| Performance | 3 | Medium |
| Mobile | 3 | High |
| Accessibility | 3 | Low |
| Security | 3 | High |
| Regression | 1 | High |

**Total Tests**: 38

---

## ✅ Pre-Launch Checklist

- [ ] All high-priority tests pass
- [ ] Mobile tests pass
- [ ] Security tests pass
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Database migration complete
- [ ] Documentation reviewed
- [ ] Stakeholder approval

---

**Ready for Production**: When all tests pass! 🚀
