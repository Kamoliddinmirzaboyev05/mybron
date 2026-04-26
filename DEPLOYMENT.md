# Production Deployment Guide

## Server Ma'lumotlari
- **Backend URL:** `http://103.6.169.242/api`
- **Frontend:** Static build (Vite)

## 1. Environment Sozlash

### Production uchun `.env.production` yarating:
```bash
# .env.production
VITE_API_URL=http://103.6.169.242/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### Yoki default qiymatdan foydalaning:
`.env` faylsiz ham ishlaydi, chunki `api.ts` da default qiymat `http://103.6.169.242/api`

## 2. Production Build

```bash
# Dependencies o'rnatish
npm install

# Production build
npm run build
```

Build natijasi `dist/` papkasida bo'ladi.

## 3. Build Tarkibi

`dist/` papkasida quyidagilar bo'ladi:
- `index.html` — asosiy HTML fayl
- `assets/` — JS, CSS, rasmlar
- `public/` — PWA fayllar (manifest.json, sw.js, bronlogo.png)

## 4. Server ga Joylashtirish

### Nginx konfiguratsiyasi (tavsiya etiladi):

```nginx
server {
    listen 80;
    server_name yourdomain.com;  # yoki IP: 103.6.169.242
    
    root /var/www/mybron/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - barcha so'rovlarni index.html ga yo'naltirish
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker - kesh qilmaslik
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Manifest
    location = /manifest.json {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Apache konfiguratsiyasi:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/mybron/dist

    <Directory /var/www/mybron/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
</VirtualHost>
```

## 5. Deployment Qadamlari

### SSH orqali serverga ulanish:
```bash
ssh user@103.6.169.242
```

### Build fayllarni serverga yuklash:
```bash
# Local mashinada
scp -r dist/* user@103.6.169.242:/var/www/mybron/dist/
```

### Yoki Git orqali:
```bash
# Serverda
cd /var/www/mybron
git pull origin main
npm install
npm run build
```

## 6. Backend CORS Sozlash

Backend serverda CORS sozlangan bo'lishi kerak. `CORS_SETUP.md` ga qarang.

Django uchun:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://103.6.169.242",
    "http://103.6.169.242:3000",
    "http://localhost:3000",  # development uchun
]
```

## 7. HTTPS Sozlash (tavsiya etiladi)

### Let's Encrypt bilan SSL sertifikat:
```bash
# Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d yourdomain.com
```

### HTTPS uchun `.env.production`:
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

## 8. Tekshirish

1. **Frontend:** `http://103.6.169.242` ochib ko'ring
2. **API:** Browser console da xato yo'qligini tekshiring
3. **PWA:** "Install" tugmasi ko'rinishini tekshiring
4. **Network:** DevTools → Network → API so'rovlar muvaffaqiyatli bo'lishini tekshiring

## 9. Monitoring

### Nginx access log:
```bash
tail -f /var/log/nginx/access.log
```

### Nginx error log:
```bash
tail -f /var/log/nginx/error.log
```

## 10. Yangilanishlar

Har safar kod o'zgarganda:
```bash
# Local mashinada
npm run build

# Serverga yuklash
scp -r dist/* user@103.6.169.242:/var/www/mybron/dist/

# Yoki Git orqali
ssh user@103.6.169.242
cd /var/www/mybron
git pull
npm run build
```

## 11. Performance Optimization

### Build optimization allaqachon sozlangan:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression (server tomonida)
- ✅ Asset caching

### Qo'shimcha optimizatsiya:
```bash
# Bundle analyzer
npm install -D rollup-plugin-visualizer
```

## 12. Troubleshooting

### Agar sahifa bo'sh ko'rinsa:
1. Browser console da xatolarni tekshiring
2. Network tab da API so'rovlar muvaffaqiyatli bo'lishini tekshiring
3. `dist/index.html` faylda `<base href="/">` borligini tekshiring

### Agar API so'rovlar ishlamasa:
1. CORS sozlamalarini tekshiring
2. Backend server ishlab turganini tekshiring
3. Firewall sozlamalarini tekshiring

### Agar PWA install qilmasa:
1. HTTPS ishlatilayotganini tekshiring (yoki localhost)
2. `manifest.json` va `sw.js` to'g'ri yuklanayotganini tekshiring
3. Browser console da Service Worker xatolarini tekshiring
