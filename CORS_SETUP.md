# CORS Sozlash (Backend)

## Muammo
Frontend (`http://localhost:3000`) dan backend (`http://103.6.169.242`) ga so'rov yuborilganda CORS xatosi:
```
Access to fetch at 'http://103.6.169.242/api/fields/' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

## Yechim

### Django Backend uchun

1. **django-cors-headers o'rnatish:**
```bash
pip install django-cors-headers
```

2. **settings.py da sozlash:**

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Eng yuqorida bo'lishi kerak
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Development uchun (barcha originlarga ruxsat)
CORS_ALLOW_ALL_ORIGINS = True

# Production uchun tavsiya etiladi
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://103.6.169.242",
]

# Credentials (cookies, authorization headers) uchun
CORS_ALLOW_CREDENTIALS = True

# Qo'shimcha sozlamalar
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### FastAPI Backend uchun

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS sozlash
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://103.6.169.242",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Express.js Backend uchun

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS sozlash
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://103.6.169.242',
    'http://103.6.169.242:3000',
  ],
  credentials: true,
}));
```

## Frontend Proxy (Vaqtinchalik yechim)

Frontend da proxy allaqachon sozlangan (`vite.config.ts`):

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://103.6.169.242',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Bu yechim faqat development uchun ishlaydi. Production da backend CORS sozlash shart!

## Production uchun

Production da:
1. Backend da CORS to'g'ri sozlangan bo'lishi kerak
2. Frontend `.env` faylida `VITE_API_URL` o'rnatilishi kerak:
```
VITE_API_URL=https://api.mybron.uz/api
```

## Tekshirish

Backend sozlangandan keyin:
1. Backend serverni qayta ishga tushiring
2. Frontend serverni qayta ishga tushiring (`npm run dev`)
3. Browser console da xato yo'qligini tekshiring
