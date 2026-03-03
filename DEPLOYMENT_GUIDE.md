# Deployment Guide - Production Ready

## 🚀 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `DATABASE_MIGRATION.sql` in Supabase SQL Editor
- [ ] Verify `favorites` table created
- [ ] Verify `reviews` table created
- [ ] Verify indexes created
- [ ] Verify RLS policies enabled
- [ ] Test database queries

### 2. Environment Variables
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Test Supabase connection
- [ ] Verify authentication works

### 3. Code Quality
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Build successful: `npm run build`
- [ ] No console errors in production build
- [ ] All imports resolved
- [ ] No unused dependencies

### 4. Testing
- [ ] All features tested manually
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Authentication flow tested
- [ ] Booking flow tested
- [ ] Reviews tested
- [ ] Favorites tested

### 5. Performance
- [ ] Images optimized
- [ ] Bundle size acceptable (< 1MB)
- [ ] Load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No memory leaks

### 6. Security
- [ ] RLS policies tested
- [ ] Authentication required for protected actions
- [ ] Input validation working
- [ ] No sensitive data exposed
- [ ] HTTPS enabled

## 📦 Build Process

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Type Check
```bash
npx tsc --noEmit
```

### Step 3: Build for Production
```bash
npm run build
```

### Step 4: Test Production Build
```bash
npm run preview
```

### Step 5: Verify Build Output
```bash
ls -lh dist/
```

Expected output:
```
dist/
├── index.html
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Setup
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Environment Variables
Add in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### Custom Domain
1. Go to Vercel dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records

---

### Option 2: Netlify

#### Setup
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod
```

#### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

#### Environment Variables
Add in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### Option 3: Custom Server (VPS)

#### Requirements
- Node.js 18+
- Nginx
- SSL certificate (Let's Encrypt)

#### Setup Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/sports-booking/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Deploy Steps
```bash
# Build locally
npm run build

# Upload to server
scp -r dist/* user@server:/var/www/sports-booking/dist/

# Restart Nginx
ssh user@server "sudo systemctl restart nginx"
```

---

### Option 4: GitHub Pages

#### Setup
1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

4. Configure in GitHub:
   - Settings → Pages
   - Source: gh-pages branch

---

## 🔧 Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Visit production URL
- [ ] Test all features
- [ ] Check console for errors
- [ ] Test on mobile device
- [ ] Test authentication
- [ ] Test booking flow

### 2. Monitor Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Monitor error logs
- [ ] Check analytics

### 3. Setup Monitoring

#### Sentry (Error Tracking)
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

#### Google Analytics
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### 4. Setup Backups
- [ ] Database backups enabled in Supabase
- [ ] Code backed up in Git
- [ ] Environment variables documented
- [ ] Deployment process documented

## 📊 Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load routes
const Home = lazy(() => import('./pages/Home'));
const PitchDetails = lazy(() => import('./pages/PitchDetails'));
```

### 2. Image Optimization
- Use WebP format
- Compress images (TinyPNG)
- Use CDN for storage
- Implement lazy loading

### 3. Caching Strategy
```typescript
// Service Worker for offline support
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

## 🔒 Security Hardening

### 1. Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### 2. Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### 3. Rate Limiting (Supabase)
- Enable rate limiting in Supabase dashboard
- Set appropriate limits for API calls
- Monitor for abuse

## 📱 PWA Setup (Optional)

### 1. Add Manifest
```json
// public/manifest.json
{
  "name": "Sports Booking",
  "short_name": "Bron",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Register Service Worker
```typescript
// src/main.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🎯 Launch Checklist

### Pre-Launch (1 week before)
- [ ] All features complete
- [ ] Testing complete
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Stakeholder approval

### Launch Day
- [ ] Database migration executed
- [ ] Environment variables set
- [ ] Build and deploy
- [ ] Verify production works
- [ ] Monitor for errors
- [ ] Announce launch

### Post-Launch (1 week after)
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan next iteration

## 📈 Monitoring & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly
- Review analytics
- Check performance metrics
- Update dependencies

### Monthly
- Security audit
- Performance review
- Feature planning
- Database optimization

## 🆘 Rollback Plan

### If Issues Occur
1. Identify the issue
2. Check error logs
3. Revert to previous version:
```bash
vercel rollback  # For Vercel
# or
git revert HEAD
npm run build
vercel --prod
```

### Emergency Contacts
- Database: Supabase support
- Hosting: Vercel/Netlify support
- Development team: [Your contact]

## 📞 Support

### User Support
- Email: support@yourdomain.com
- Telegram: @yoursupport
- Phone: +998 XX XXX XX XX

### Technical Support
- GitHub Issues: [Your repo]
- Documentation: [Your docs]
- Developer: [Your contact]

## 🎉 Success Metrics

Track these after launch:
- Daily active users
- Booking conversion rate
- Average session duration
- Favorite usage
- Review submission rate
- Share button clicks
- Error rate
- Page load time

## 📝 Post-Deployment Notes

```
Deployment Date: _______________
Deployed By: _______________
Version: _______________
Environment: Production
URL: _______________

Notes:
_________________________________
_________________________________
_________________________________

Issues Found:
_________________________________
_________________________________
_________________________________

Next Steps:
_________________________________
_________________________________
_________________________________
```

---

## ✅ Final Verification

Before marking as complete:
- [ ] Production URL accessible
- [ ] All features working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast load time
- [ ] Secure (HTTPS)
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Team trained

---

**Status**: Ready for Production 🚀

**Deployment Command**:
```bash
npm run build && vercel --prod
```

**Remember**: Always test in staging before production!
