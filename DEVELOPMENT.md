# Development Guide

## Serverni ishga tushirish

### 1. Dependencies o'rnatish
```bash
npm install
```

### 2. Environment o'rnatish
`.env.example` faylini `.env.local` ga nusxalang:
```bash
cp .env.example .env.local
```

### 3. Development serverni ishga tushirish
```bash
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

## Backend bilan ishlash

### CORS muammosi
Agar backend bilan ishlashda CORS xatosi chiqsa:

**Yechim: Backend da CORS sozlash (tavsiya etiladi)**
- `CORS_SETUP.md` faylini o'qing va backend da CORS sozlang

### API URL sozlash

```bash
# .env.local
VITE_API_URL=https://gobronapi.webportfolio.uz/api
```

## Xatolarni tuzatish

### CORS xatosi
```
Access to fetch at 'https://gobronapi.webportfolio.uz/api/fields/' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Yechim:**
1. Backend da CORS sozlang (`CORS_SETUP.md` ga qarang)
2. Yoki backend URL ni `127.0.0.1` dan `localhost` ga o'zgartiring

### Geolocation xatosi
```
CoreLocationProvider: CoreLocation framework reported a kCLErrorLocationUnknown failure
```

**Yechim:**
- Bu normal xato, foydalanuvchi location ruxsat bermagan
- Ilova location bo'lmasa ham ishlaydi
- Browser da location ruxsat bering: Settings → Privacy → Location

## Build qilish

Production uchun build:
```bash
npm run build
```

Build natijasi `dist/` papkasida bo'ladi.

## PWA Test qilish

1. Production build qiling:
```bash
npm run build
```

2. Build ni serve qiling:
```bash
npm run preview
```

3. Browser da `http://localhost:4173` ochib, PWA install qiling

## Foydali buyruqlar

```bash
# Development server
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```
