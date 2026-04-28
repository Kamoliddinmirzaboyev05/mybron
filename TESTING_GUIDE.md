# Testing Guide

## API Integration Test

### 1. Maydonlar Ro'yxati
```bash
# Browser console da:
fetch('https://gobronapi.webportfolio.uz/api/fields/')
  .then(r => r.json())
  .then(console.log)
```

Kutilgan natija:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Maydon nomi",
      "price_per_hour": "0.00",
      ...
    }
  ]
}
```

### 2. Slotlar
```bash
# Browser console da:
fetch('https://gobronapi.webportfolio.uz/api/fields/4/slots/?date=2026-04-27')
  .then(r => r.json())
  .then(console.log)
```

Kutilgan natija:
```json
{
  "field_id": 4,
  "field_name": "Maqsudjon Soliyev maydoni",
  "date": "2026-04-27",
  "slots": [
    {
      "id": 91,
      "start_time": "08:00:00",
      "end_time": "09:00:00",
      "is_active": true,
      "is_booked": false
    }
  ]
}
```

## Frontend Test

### 1. Home Page
- ✅ Maydonlar ro'yxati ko'rinishi kerak
- ✅ Har bir maydon card da: rasm (yoki placeholder), nom, manzil, narx, ish vaqti
- ✅ Search va filter ishlashi kerak
- ✅ Favorite toggle ishlashi kerak (login kerak)

### 2. Maydon Tafsilotlari
- ✅ Maydon ma'lumotlari to'liq ko'rinishi kerak
- ✅ "Band qilish" tugmasi bosilganda modal ochilishi kerak
- ✅ Telefon, manzil, narx to'g'ri ko'rinishi kerak

### 3. Booking Modal
- ✅ Sana tanlash ishlashi kerak
- ✅ Slotlar yuklanishi kerak
- ✅ Slotlar 2 ustunda ko'rinishi kerak
- ✅ Faqat ketma-ket slotlarni tanlash mumkin
- ✅ Tanlangan slotlar yashil rangda
- ✅ Band slotlar ko'rinmasligi kerak
- ✅ Jami narx to'g'ri hisoblanishi kerak

### 4. Authentication
- ✅ Login sahifasi ishlashi kerak
- ✅ Register sahifasi ishlashi kerak
- ✅ Token localStorage ga saqlanishi kerak
- ✅ Logout ishlashi kerak

## Manual Test Checklist

### Home Page
- [ ] Maydonlar yuklanadi
- [ ] Search ishlaydi
- [ ] Filter ishlaydi (Arzon, Dush, 24/7, Yaqin)
- [ ] Favorite toggle ishlaydi
- [ ] Maydon cardiga bosganda details sahifasiga o'tadi

### Maydon Details
- [ ] Maydon ma'lumotlari to'liq ko'rinadi
- [ ] Rasm slider ishlaydi (agar rasmlar bo'lsa)
- [ ] "Band qilish" tugmasi bosilganda modal ochiladi
- [ ] Telefon, Telegram, Xarita tugmalari ishlaydi
- [ ] Reviews ko'rinadi

### Booking Modal
- [ ] Bugun, Ertaga, Indinga tugmalari ishlaydi
- [ ] Sana tanlash ishlaydi
- [ ] Slotlar yuklanadi
- [ ] Slotlarni tanlash ishlaydi
- [ ] Faqat ketma-ket slotlar tanlanadi
- [ ] Jami narx to'g'ri hisoblanadi
- [ ] "Band qilish" tugmasi bosilganda booking yaratiladi
- [ ] Success modal ko'rinadi

### Bookings Page
- [ ] Foydalanuvchi bookinglar ro'yxati ko'rinadi
- [ ] Status (pending, confirmed, rejected) to'g'ri ko'rinadi
- [ ] Cancel tugmasi ishlaydi

### Profile Page
- [ ] Foydalanuvchi ma'lumotlari ko'rinadi
- [ ] Logout tugmasi ishlaydi

### Admin Dashboard (admin uchun)
- [ ] Barcha bookinglar ko'rinadi
- [ ] Status filter ishlaydi
- [ ] Confirm/Reject tugmalari ishlaydi
- [ ] Statistika ko'rinadi

## Browser Console Test

### 1. API so'rovlarni tekshirish
```javascript
// DevTools → Network → Fetch/XHR
// Barcha so'rovlar 200 OK bo'lishi kerak
```

### 2. Console xatolarni tekshirish
```javascript
// DevTools → Console
// Xato bo'lmasligi kerak (CORS, 404, 500, va boshqalar)
```

### 3. LocalStorage tekshirish
```javascript
// DevTools → Application → Local Storage
// access_token, refresh_token, user bo'lishi kerak (login qilgandan keyin)
```

## Performance Test

### 1. Lighthouse
```bash
# Chrome DevTools → Lighthouse
# Run audit
```

Kutilgan natijalar:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 90+

### 2. Network
```bash
# DevTools → Network
# Disable cache
# Reload page
```

Tekshirish:
- [ ] API so'rovlar tez (< 1s)
- [ ] Images optimized
- [ ] JS/CSS minified
- [ ] Gzip enabled

## PWA Test

### 1. Install
- [ ] "Install" tugmasi ko'rinadi
- [ ] Install qilish ishlaydi
- [ ] Installed app ochiladi

### 2. Offline
- [ ] Service Worker registered
- [ ] Offline sahifa ko'rinadi (agar internet yo'q bo'lsa)

### 3. Manifest
```bash
# DevTools → Application → Manifest
```

Tekshirish:
- [ ] name: "MYBRON"
- [ ] short_name: "MYBRON"
- [ ] icons: 192x192, 512x512
- [ ] start_url: "/"
- [ ] display: "standalone"

## Error Handling Test

### 1. Network Error
```bash
# Backend serverni to'xtating
# Frontend da xato xabari ko'rinishi kerak
```

### 2. 401 Unauthorized
```bash
# Token ni o'chiring: localStorage.clear()
# Login sahifasiga redirect bo'lishi kerak
```

### 3. 404 Not Found
```bash
# Mavjud bo'lmagan maydon ID ga o'ting
# "Maydon topilmadi" xabari ko'rinishi kerak
```

## Mobile Test

### 1. Responsive
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

### 2. Touch
- [ ] Swipe ishlaydi (image carousel)
- [ ] Tap ishlaydi (buttons)
- [ ] Scroll ishlaydi

### 3. Keyboard
- [ ] Input focus ishlaydi
- [ ] Keyboard ochilganda layout buzilmaydi

## Security Test

### 1. XSS
```bash
# Input ga script tag kiriting
# <script>alert('XSS')</script>
# Escape qilinishi kerak
```

### 2. CSRF
- [ ] POST so'rovlarda token bo'lishi kerak
- [ ] Authorization header bo'lishi kerak

### 3. Token
- [ ] Token localStorage da saqlanadi
- [ ] Token expire bo'lganda refresh qilinadi
- [ ] Logout qilganda token o'chiriladi

## Accessibility Test

### 1. Keyboard Navigation
- [ ] Tab ishlaydi
- [ ] Enter ishlaydi
- [ ] Esc ishlaydi (modal yopish)

### 2. Screen Reader
- [ ] Alt text bor (images)
- [ ] ARIA labels bor (buttons)
- [ ] Semantic HTML (header, nav, main, footer)

### 3. Color Contrast
- [ ] Text readable (WCAG AA)
- [ ] Focus visible

## Load Test

### 1. Many Fields
```bash
# 100+ maydon bilan test qiling
# Scroll performance tekshiring
```

### 2. Many Slots
```bash
# 50+ slot bilan test qiling
# Render performance tekshiring
```

### 3. Many Bookings
```bash
# 100+ booking bilan test qiling
# List performance tekshiring
```

## Bug Report Template

Agar xato topsangiz:

```markdown
## Bug Description
[Qisqa tavsif]

## Steps to Reproduce
1. [Qadam 1]
2. [Qadam 2]
3. [Qadam 3]

## Expected Behavior
[Kutilgan natija]

## Actual Behavior
[Haqiqiy natija]

## Screenshots
[Screenshot qo'shing]

## Environment
- Browser: [Chrome 120]
- OS: [macOS 14]
- Device: [Desktop/Mobile]

## Console Errors
[Console xatolarni qo'shing]
```
