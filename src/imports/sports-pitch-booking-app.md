Act as an expert Full-Stack Developer and UI/UX Designer. Build a production-ready, mobile-first Web Application for a "Sports Pitch Booking App" (User Facing) using React, Tailwind CSS, Lucide Icons, and the Supabase Client. 

CRITICAL RULE: This app must feel exactly like a native mobile app. Use a mobile viewport max-width (e.g., max-w-md mx-auto), hide scrollbars, and use smooth touch-friendly UI components.

THEME & UI STYLE:
- Dark theme default with deep blue/grey backgrounds (e.g., bg-slate-950).
- High contrast primary actions (bright blue).
- Bottom Navigation Bar with 4 tabs: Home, Bookings, Notifications, Profile.
- Use Bottom Sheets instead of new pages for quick interactions.

DATABASE INTEGRATION (CRITICAL):
Do NOT create a new database schema or migrations. You MUST connect to my EXISTING Supabase project using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. 
Write the data fetching and inserting logic based strictly on this existing schema:
- `pitches` table: id (uuid), name (text), price_per_hour (numeric), address (text), working_hours_start (time), working_hours_end (time), images (text array).
- `bookings` table: id (uuid), pitch_id (uuid), user_id (uuid), customer_name (text), customer_phone (text), start_time (timestamptz), end_time (timestamptz), status (text: 'pending', 'confirmed', 'rejected', 'manual').

CORE SCREENS & LOGIC:

1. Home Screen (Pitches List):
- Fetch and display all records from the `pitches` table.
- Display as beautiful mobile cards: Large cover image (use first image from the array), Pitch Name, Price per hour, and Location text.
- Tapping a card opens the "Pitch Details & Booking" screen.

2. Pitch Details & Booking Screen (The Core Flow):
- Top: Full-width Image Slider (Swiper/Carousel) showing the pitch images. Top-left back button.
- Info Section: Pitch Name, Map Pin icon with Address, and horizontal scrollable Facility Icons (e.g., Shower, Parking).
- Booking UI (Directly on this page):
  - "Select Date": 3 horizontal Pill-shaped toggle buttons strictly hardcoded as: "Today", "Tomorrow", "Day After" (calculate the actual dates in JS).
  - "Select Time": Fetch from `bookings` where `pitch_id` matches and `status` is IN ('pending', 'confirmed', 'manual'). Display a horizontal grid of 1-hour time slots (e.g., 18:00, 19:00, 20:00). 
  - Time Slot Logic: If a time slot overlaps with an fetched booking, render that slot as greyed out, disabled, and unclickable. Only available slots should be selectable with a clean outline.
- Sticky Bottom Action Bar: Fixed to the bottom of the screen. Show total price on the left, and a large "Book Now" button on the right.
- Submission: On "Book Now", insert a record into the `bookings` table with `status = 'pending'`, calculating the correct `start_time` and `end_time` based on the selected date and slot. Show a success modal: "Request sent to Admin for approval."

3. My Bookings Screen:
- Fetch from `bookings` where `user_id` is the current logged-in user.
- 3 Tabs: "Pending", "Confirmed", "History".
- Each booking item must show: Pitch Name, Date, Time range, and a dynamic colored Status Badge.
- Include a "Cancel Request" button ONLY for bookings in the 'pending' status.

4. Profile & Notifications Screens:
- Profile: Simple UI showing user Name/Phone, a theme toggle, and a Sign Out button.
- Notifications: A simple list UI showing simulated alerts (e.g., "Your booking was approved!").

IMPLEMENTATION DETAILS: Provide fully functional React components. Use Supabase real-time subscriptions on the `bookings` table so if the Admin confirms a booking, the User's "My Bookings" page updates automatically without refreshing.