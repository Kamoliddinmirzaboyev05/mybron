# MYBRON - Futbol Maydonlarini Band Qilish Tizimi

Modern, responsive va PWA qo'llab-quvvatlaydigan futbol maydonlarini band qilish platformasi.

## 🚀 Texnologiyalar

### Frontend
- **React 18** + **TypeScript**
- **Vite** — tez build va development
- **TailwindCSS** — styling
- **React Router** — routing
- **Swiper** — image carousel
- **Sonner** — toast notifications
- **Lucide React** — icons
- **date-fns** — date utilities

### Backend
- Django REST Framework (alohida repository)
- PostgreSQL database
- JWT authentication

## 📁 Loyiha Strukturasi

```
mybron/
├── src/
│   ├── app/
│   │   ├── components/     # React komponentlar
│   │   ├── pages/          # Sahifalar
│   │   ├── lib/            # Utility funksiyalar va API
│   │   └── routes.tsx      # Routing konfiguratsiyasi
│   ├── styles/             # Global CSS
│   └── main.tsx            # Entry point
├── public/                 # Static fayllar (PWA)
├── dist/                   # Production build (git ignore)
└── scripts/                # Utility skriptlar
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ va npm
- Backend server (Django)

### O'rnatish

1. **Repository ni clone qiling:**
```bash
git clone <repository-url>
cd mybron
```

2. **Dependencies o'rnatish:**
```bash
npm install
```

3. **Environment sozlash:**
```bash
cp .env.example .env.local
```

`.env.local` faylini tahrirlang (agar kerak bo'lsa):
```bash
VITE_API_URL=https://gobronapi.webportfolio.uz/api
```

4. **Development serverni ishga tushirish:**
```bash
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

## 📦 Production Build

```bash
npm run build
```

Build natijasi `dist/` papkasida bo'ladi.

Preview:
```bash
npm run preview
```

## 🌐 API Integration

Backend API: `https://gobronapi.webportfolio.uz/api`

Barcha API endpointlar `API_ENDPOINTS.md` faylida hujjatlashtirilgan.

### Asosiy Endpointlar:
- `GET /fields/` — maydonlar ro'yxati
- `GET /fields/{id}/` — maydon tafsilotlari
- `GET /admin/fields/{id}/slots/?date=YYYY-MM-DD` — mavjud slotlar
- `POST /bookings/` — bron yaratish
- `POST /auth/login/` — login
- `POST /auth/register/` — ro'yxatdan o'tish

## 🔐 Authentication

JWT token-based authentication:
- Access token — API so'rovlar uchun
- Refresh token — access token yangilash uchun
- Tokenlar `localStorage` da saqlanadi

## 📱 PWA (Progressive Web App)

Loyiha PWA sifatida ishlaydi:
- ✅ Offline qo'llab-quvvatlash
- ✅ Install qilish mumkin
- ✅ Push notifications (VAPID)
- ✅ Service Worker

### PWA Test qilish:
1. Production build qiling: `npm run build`
2. Preview serverni ishga tushiring: `npm run preview`
3. Browser da `http://localhost:4173` oching
4. "Install" tugmasini bosing

## 🎨 Dizayn Tizimi

### Ranglar:
- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)
- **Background:** Dark (#020817, #0d1526)

### Komponentlar:
- shadcn/ui komponentlari
- Custom komponentlar (EnhancedPitchCard, BookingModal, va boshqalar)

## 📚 Hujjatlar

- `DEVELOPMENT.md` — Development guide
- `DEPLOYMENT.md` — Production deployment
- `API_ENDPOINTS.md` — API hujjatlari
- `CORS_SETUP.md` — CORS sozlash

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment

Batafsil ma'lumot uchun `DEPLOYMENT.md` ga qarang.

### Qisqacha:
1. Build qiling: `npm run build`
2. `dist/` papkasini serverga yuklang
3. Nginx/Apache sozlang
4. CORS sozlang (backend)

## 🔧 Troubleshooting

### CORS xatosi
Backend da CORS sozlang. `CORS_SETUP.md` ga qarang.

### API so'rovlar ishlamayapti
1. Backend server ishlab turganini tekshiring
2. `.env.local` da `VITE_API_URL` to'g'ri ekanligini tekshiring
3. Browser console da xatolarni tekshiring

### PWA install qilmayapti
1. HTTPS ishlatilayotganini tekshiring (yoki localhost)
2. `manifest.json` va `sw.js` to'g'ri yuklanayotganini tekshiring

## 📄 License

[License type] - [License details]

## 👥 Team

- Frontend Developer: [Your name]
- Backend Developer: [Backend dev name]
- Designer: [Designer name]

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📞 Contact

- Email: admin@mybron.uz
- Website: https://gobronapi.webportfolio.uz

---

Made with ❤️ by MYBRON Team
