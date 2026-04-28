# Authentication Flow

## Umumiy Qoidalar

### Public Endpoints (Auth kerak emas)
- ✅ `GET /fields/` — Barcha maydonlar ro'yxati
- ✅ `GET /fields/{id}/` — Maydon tafsilotlari
- ✅ `GET /fields/{id}/slots/?date=YYYY-MM-DD` — Mavjud slotlar
- ✅ `GET /reviews/?field={id}` — Maydon sharhlari

### Protected Endpoints (Auth kerak)
- 🔒 `POST /bookings/` — Bron yaratish
- 🔒 `GET /bookings/` — Foydalanuvchi bronlari
- 🔒 `PATCH /bookings/{id}/` — Bron statusini o'zgartirish
- 🔒 `POST /favorites/` — Sevimlilar qo'shish
- 🔒 `GET /favorites/` — Sevimlilar ro'yxati
- 🔒 `DELETE /favorites/{id}/` — Sevimlilardan o'chirish
- 🔒 `POST /reviews/` — Sharh qoldirish
- 🔒 `GET /reviews/my/` — Mening sharhlarim
- 🔒 `GET /auth/profile/` — Profil ma'lumotlari

## User Flow

### 1. Maydon Ko'rish (Auth kerak emas)

```
User → Home Page
  ↓
Maydonlar ro'yxati yuklanadi (GET /fields/)
  ↓
User maydon cardini bosadi
  ↓
Maydon details sahifasi (GET /fields/{id}/)
  ↓
User "Band qilish" tugmasini bosadi
  ↓
Auth tekshiriladi:
  - Agar login qilgan → Booking Modal ochiladi
  - Agar login qilmagan → Login sahifasiga yo'naltiriladi
```

### 2. Login Flow

```
User → Login sahifasi
  ↓
Login va parol kiritadi
  ↓
POST /auth/login/
  ↓
Success:
  - Access token va refresh token olinadi
  - localStorage ga saqlanadi
  - User ma'lumotlari saqlanadi
  - Agar returnToPitch bor bo'lsa → Maydon sahifasiga qaytadi
  - Aks holda → Home sahifasiga yo'naltiriladi
  ↓
Error:
  - Xato xabari ko'rsatiladi
```

### 3. Register Flow

```
User → Register sahifasi
  ↓
Forma to'ldiriladi (ism, familiya, login, telefon, parol)
  ↓
POST /auth/register/
  ↓
Success:
  - Access token va refresh token olinadi
  - localStorage ga saqlanadi
  - User ma'lumotlari saqlanadi
  - Success modal ko'rsatiladi
  - Agar returnToPitch bor bo'lsa → 1.5s dan keyin maydon sahifasiga qaytadi
  - Aks holda → "Boshlash" tugmasi bilan Home ga o'tadi
  ↓
Error:
  - Xato xabari ko'rsatiladi
```

### 4. Booking Flow (Auth kerak)

```
User → Maydon details sahifasi
  ↓
"Band qilish" tugmasini bosadi
  ↓
Auth tekshiriladi:
  - Agar login qilmagan:
    * sessionStorage.setItem('returnToPitch', fieldId)
    * Login sahifasiga yo'naltiriladi
  - Agar login qilgan:
    * Booking Modal ochiladi
    ↓
    Sana tanlanadi
    ↓
    Slotlar yuklanadi (GET /fields/{id}/slots/?date=YYYY-MM-DD)
    ↓
    Slotlar tanlanadi
    ↓
    "Band qilish" tugmasi bosiladi
    ↓
    POST /bookings/
    ↓
    Success:
      - Success modal ko'rsatiladi
      - Push notification yuboriladi
      - "Bronlarimni ko'rish" tugmasi bilan Bookings sahifasiga o'tish
    ↓
    Error:
      - Xato xabari ko'rsatiladi
```

### 5. Favorite Flow (Auth kerak)

```
User → Maydon cardida yoki details sahifasida heart icon bosadi
  ↓
Auth tekshiriladi:
  - Agar login qilmagan:
    * sessionStorage.setItem('returnToPitch', fieldId)
    * Login sahifasiga yo'naltiriladi
  - Agar login qilgan:
    * Agar favorite bo'lsa:
      - DELETE /favorites/{id}/
      - "Sevimlilardan olib tashlandi" toast
    * Agar favorite bo'lmasa:
      - POST /favorites/
      - "Sevimlilarga qo'shildi" toast
```

### 6. Review Flow (Auth kerak)

```
User → Maydon details sahifasida "Sharh qoldirish" tugmasini bosadi
  ↓
Auth tekshiriladi:
  - Agar login qilmagan → Login sahifasiga yo'naltiriladi
  - Agar login qilgan:
    ↓
    Review modal ochiladi
    ↓
    Rating va comment kiritiladi
    ↓
    POST /reviews/
    ↓
    Success:
      - Sharh ro'yxatiga qo'shiladi
      - "Sharh qo'shildi" toast
    ↓
    Error:
      - Xato xabari ko'rsatiladi
```

## Token Management

### Access Token
- Har bir protected endpoint so'rovida `Authorization: Bearer {access_token}` header yuboriladi
- Token expire bo'lganda (401 error) avtomatik refresh qilinadi

### Refresh Token
- Access token expire bo'lganda `POST /auth/token/refresh/` chaqiriladi
- Yangi access token olinadi va localStorage ga saqlanadi
- Agar refresh ham expire bo'lsa:
  - Tokenlar o'chiriladi
  - Login sahifasiga yo'naltiriladi

### Logout
```
User → Profile sahifasida "Chiqish" tugmasini bosadi
  ↓
POST /auth/logout/ (refresh token yuboriladi)
  ↓
localStorage dan tokenlar o'chiriladi
  ↓
Login sahifasiga yo'naltiriladi
```

## Return to Pitch Logic

### Scenario 1: Login qilmagan user maydon details sahifasiga kiradi
```
1. User maydon details sahifasini ochadi (auth kerak emas)
2. User "Band qilish" tugmasini bosadi
3. sessionStorage.setItem('returnToPitch', fieldId)
4. Login sahifasiga yo'naltiriladi
5. User login qiladi
6. sessionStorage dan returnToPitch olinadi
7. Maydon details sahifasiga qaytadi
8. sessionStorage dan returnToPitch o'chiriladi
```

### Scenario 2: Login qilmagan user favorite bosadi
```
1. User home page da maydon cardida heart icon bosadi
2. sessionStorage.setItem('returnToPitch', fieldId)
3. Login sahifasiga yo'naltiriladi
4. User login qiladi
5. Maydon details sahifasiga qaytadi
6. User yana favorite bosishi mumkin
```

### Scenario 3: Register orqali
```
1. User maydon details sahifasida "Band qilish" bosadi
2. Login sahifasiga yo'naltiriladi
3. User "Ro'yxatdan o'tish" tugmasini bosadi
4. Register sahifasida forma to'ldiriladi
5. Register muvaffaqiyatli bo'ladi
6. 1.5s dan keyin maydon details sahifasiga qaytadi
7. User "Band qilish" tugmasini bosishi mumkin
```

## Error Handling

### 401 Unauthorized
```
Protected endpoint chaqiriladi
  ↓
401 error qaytadi
  ↓
Refresh token bilan yangi access token olinadi
  ↓
So'rov qayta yuboriladi
  ↓
Agar refresh ham expire bo'lsa:
  - Tokenlar o'chiriladi
  - Login sahifasiga yo'naltiriladi
  - "Sessiya tugadi. Iltimos, qayta kiring." xabari
```

### 403 Forbidden
```
User ruxsati yo'q endpoint ga so'rov yuboradi
  ↓
403 error qaytadi
  ↓
"Ruxsat yo'q" xabari ko'rsatiladi
```

### Network Error
```
API so'rov yuboriladi
  ↓
Network error (server ishlamayapti)
  ↓
"Server bilan bog'lanib bo'lmadi" xabari ko'rsatiladi
```

## Security

### Token Storage
- ✅ Access token va refresh token `localStorage` da saqlanadi
- ✅ User ma'lumotlari `localStorage` da saqlanadi
- ⚠️ XSS hujumlaridan himoyalanish uchun input sanitization qilinadi

### HTTPS
- 🔒 Production da HTTPS ishlatilishi kerak
- 🔒 Token faqat HTTPS orqali yuborilishi kerak

### CORS
- ✅ Backend da CORS to'g'ri sozlangan bo'lishi kerak
- ✅ Faqat ma'lum originlarga ruxsat berilishi kerak

## Testing

### Manual Test
1. **Public endpoints:**
   - Login qilmagan holda maydonlar ro'yxatini ko'ring
   - Maydon details sahifasini oching
   - Slotlarni ko'ring

2. **Protected endpoints:**
   - "Band qilish" tugmasini bosing
   - Login sahifasiga yo'naltirilishini tekshiring
   - Login qiling
   - Maydon sahifasiga qaytishini tekshiring
   - Booking modal ochilishini tekshiring

3. **Token refresh:**
   - Access token ni o'chiring: `localStorage.removeItem('access_token')`
   - Protected endpoint chaqiring
   - Avtomatik refresh qilinishini tekshiring

4. **Logout:**
   - Profile sahifasida "Chiqish" tugmasini bosing
   - Tokenlar o'chirilishini tekshiring
   - Login sahifasiga yo'naltirilishini tekshiring

### Automated Test
```javascript
// Test 1: Public endpoint without auth
fetch('https://gobronapi.webportfolio.uz/api/fields/')
  .then(r => r.json())
  .then(console.log)

// Test 2: Protected endpoint without auth (should fail)
fetch('https://gobronapi.webportfolio.uz/api/bookings/')
  .then(r => console.log(r.status)) // 401

// Test 3: Protected endpoint with auth
fetch('https://gobronapi.webportfolio.uz/api/bookings/', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(r => r.json())
  .then(console.log)
```
