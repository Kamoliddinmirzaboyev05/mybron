# Requirements Document

## Introduction

MYBRON PWA ilovasi uchun to'liq Push-bildirishnomalar tizimi. Foydalanuvchilar bron holati o'zgarganda (tasdiqlangan, rad etilgan, kutilmoqda) real-time push bildirishnomalar oladi. Tizim uch qismdan iborat: (1) Service Worker — push eventlarni qabul qiladi va bildirishnomalarni ko'rsatadi; (2) Frontend — foydalanuvchidan ruxsat so'raydi, VAPID Public Key yordamida PushSubscription hosil qiladi va backendga yuboradi; (3) Backend (Node.js/Supabase) — subscriptionlarni saqlaydi va `web-push` kutubxonasi orqali xabar yuboradi. iOS va Android qurilmalar qo'llab-quvvatlanadi. Backend hali mock rejimida ishlaydi, shuning uchun subscription API ham mock sifatida loyihalashtiriladi va real backend tayyor bo'lganda almashtiriladi.

---

## Glossary

- **Push_System**: MYBRON PWA push-bildirishnomalar tizimi (Service Worker + Frontend + Backend)
- **Service_Worker**: `public/sw.js` faylida joylashgan background script, push eventlarni qabul qiladi
- **Push_Manager**: Brauzerning `PushManager` API — subscription hosil qilish uchun ishlatiladi
- **PushSubscription**: Brauzer tomonidan yaratilgan, endpoint va kalitlarni o'z ichiga olgan obuna obyekti
- **VAPID**: Voluntary Application Server Identification — push xabarlarni autentifikatsiya qilish standarti
- **VAPID_Public_Key**: Frontend tomonida `subscribe()` chaqiruvida ishlatiladigan ochiq kalit (base64url formatida)
- **VAPID_Private_Key**: Faqat backend tomonida saqlanadigan maxfiy kalit, xabarlarni imzolash uchun
- **Subscription_API**: Backend endpoint — PushSubscription obyektini qabul qilib, ma'lumotlar bazasiga saqlaydi
- **Notification_API**: Backend endpoint — ma'lum foydalanuvchiga push xabar yuboradi
- **Notification_Store**: `localStorage` asosidagi lokal bildirishnomalar ombori (mavjud `notifications.ts`)
- **Permission_Manager**: Brauzerdan bildirishnoma ruxsatini so'rash va holatini kuzatish moduli
- **iOS_Safari**: iOS 16.4+ da PWA rejimida push bildirishnomalarni qo'llab-quvvatlovchi brauzer
- **Booking_Event**: Bron holati o'zgarishi (pending → confirmed yoki rejected)

---

## Requirements

### Requirement 1: Service Worker Push Event Handling

**User Story:** As a foydalanuvchi, I want push bildirishnomalarni qurilmamda ko'rishni, so that bron holatim o'zgarganda darhol xabardor bo'laman.

#### Acceptance Criteria

1. WHEN backend push xabar yuborsa, THE Service_Worker SHALL `push` eventni qabul qilib, `self.registration.showNotification()` orqali bildirishnomani ko'rsatadi.
2. THE Service_Worker SHALL bildirishnoma payloadidan `title`, `body`, `icon`, `badge`, `data.url` va `actions` maydonlarini o'qiydi; agar maydon yo'q bo'lsa, standart qiymatlardan foydalanadi.
3. WHEN foydalanuvchi bildirishnomaga bossa, THE Service_Worker SHALL `notificationclick` eventida bildirishnomani yopadi va `data.url` manziliga yo'naltiradi.
4. WHEN `data.url` bo'yicha oyna allaqachon ochiq bo'lsa, THE Service_Worker SHALL yangi oyna ochish o'rniga mavjud oynani fokusga oladi.
5. IF push event payload JSON formatida bo'lmasa, THEN THE Service_Worker SHALL standart `{ title: 'MYBRON', body: 'Yangi xabar' }` qiymatlaridan foydalanadi va xato tashlamaydi.
6. THE Service_Worker SHALL `event.waitUntil()` orqali barcha async operatsiyalarni to'liq bajarilishini kafolatlaydi.

---

### Requirement 2: VAPID Kalitlar Generatsiyasi

**User Story:** As a developer, I want VAPID kalitlarini xavfsiz generatsiya qilishni, so that push xabarlar autentifikatsiya qilingan holda yuborilsin.

#### Acceptance Criteria

1. THE Push_System SHALL `web-push` kutubxonasining `generateVAPIDKeys()` funksiyasi yordamida bir juft VAPID kalit (public + private) generatsiya qiladi.
2. THE Push_System SHALL VAPID Public Key ni `VITE_VAPID_PUBLIC_KEY` environment variable sifatida frontend uchun saqlaydi.
3. THE Push_System SHALL VAPID Private Key ni faqat backend environment variable (`VAPID_PRIVATE_KEY`) sifatida saqlaydi va hech qachon frontend kodiga kiritilmaydi.
4. THE Push_System SHALL VAPID kalitlarini base64url formatida saqlaydi, chunki `PushManager.subscribe()` `applicationServerKey` parametri shu formatni talab qiladi.
5. IF VAPID kalitlari environment variablelarda mavjud bo'lmasa, THEN THE Push_System SHALL server ishga tushishda xato xabari chiqaradi va to'xtaydi.

---

### Requirement 3: Frontend — Ruxsat So'rash va Subscription Yaratish

**User Story:** As a foydalanuvchi, I want push bildirishnomalarni yoqishni, so that bron yangilanishlarini real-time olaman.

#### Acceptance Criteria

1. WHEN foydalanuvchi "Yoqish" tugmasini bossa, THE Permission_Manager SHALL `Notification.requestPermission()` chaqiradi va natijani qaytaradi.
2. WHEN `Notification.permission === 'granted'` bo'lsa, THE Push_Manager SHALL `serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })` chaqirib, `PushSubscription` hosil qiladi.
3. WHEN PushSubscription muvaffaqiyatli yaratilsa, THE Push_Manager SHALL subscription obyektini JSON formatiga o'tkazib, `Subscription_API` ga HTTP POST so'rov yuboradi.
4. THE Push_Manager SHALL subscription so'rovida foydalanuvchi ID sini ham yuboradi, shunda backend qaysi foydalanuvchiga xabar yuborishni biladi.
5. IF brauzer `PushManager` ni qo'llab-quvvatlamasa, THEN THE Permission_Manager SHALL foydalanuvchiga "Brauzeringiz push bildirishnomalarni qo'llab-quvvatlamaydi" xabarini ko'rsatadi va jarayonni to'xtatadi.
6. IF `Notification.permission === 'denied'` bo'lsa, THEN THE Permission_Manager SHALL foydalanuvchiga brauzer sozlamalaridan ruxsat berish kerakligini ko'rsatadi va `requestPermission()` ni qayta chaqirmaydi.
7. WHILE foydalanuvchi tizimga kirgan bo'lsa, THE Push_Manager SHALL sahifa yuklanganda mavjud subscription holatini tekshiradi va agar subscription yo'q bo'lsa, lekin ruxsat berilgan bo'lsa, avtomatik ravishda subscription yangilaydi.
8. WHERE iOS Safari qo'llanilsa, THE Push_Manager SHALL faqat PWA standalone rejimida (`display-mode: standalone`) push subscription yaratishga urinadi, chunki iOS Safari oddiy brauzer rejimida push bildirishnomalarni qo'llab-quvvatlamaydi.

---

### Requirement 4: Frontend — usePushNotifications Hook

**User Story:** As a developer, I want push notification logikasini qayta ishlatiladigan hook sifatida, so that ilovaning istalgan joyida push bildirishnomalarni boshqarish oson bo'lsin.

#### Acceptance Criteria

1. THE Push_System SHALL `usePushNotifications` nomli React hook eksport qiladi, u `{ permission, isSubscribed, isLoading, subscribe, unsubscribe }` qaytaradi.
2. WHEN `subscribe()` chaqirilsa, THE Push_System SHALL ruxsat so'rash, subscription yaratish va backendga yuborish ketma-ketligini bajaradi.
3. WHEN `unsubscribe()` chaqirilsa, THE Push_System SHALL `PushSubscription.unsubscribe()` chaqiradi va backendga DELETE so'rov yuboradi.
4. THE Push_System SHALL hook ichida barcha xatolarni `try/catch` bilan ushlaydi va `isLoading` holatini har doim `false` ga qaytaradi.
5. THE Push_System SHALL hook holati o'zgarganda komponent qayta render bo'lishini ta'minlaydi.

---

### Requirement 5: Backend — Subscription Saqlash API (Mock)

**User Story:** As a developer, I want subscription ma'lumotlarini saqlashni, so that backend kerakli foydalanuvchilarga push xabar yuborsin.

#### Acceptance Criteria

1. WHEN frontend `POST /api/push/subscribe` so'rov yuborganda, THE Subscription_API SHALL `{ userId, subscription: PushSubscription }` tanasini qabul qiladi va muvaffaqiyat javobini qaytaradi.
2. THE Subscription_API SHALL bir foydalanuvchi uchun bir nechta qurilma subscriptionini saqlaydi (masalan, telefon va planshet).
3. WHEN frontend `DELETE /api/push/subscribe` so'rov yuborganda, THE Subscription_API SHALL foydalanuvchining subscriptionini o'chiradi.
4. IF subscription allaqachon mavjud bo'lsa (bir xil endpoint), THEN THE Subscription_API SHALL uni yangilaydi, yangi yozuv yaratmaydi (upsert).
5. THE Subscription_API SHALL mock rejimida `localStorage` yoki in-memory store ishlatadi; real backend tayyor bo'lganda Supabase `push_subscriptions` jadvaliga almashtiriladi.

---

### Requirement 6: Backend — Push Xabar Yuborish API (Mock)

**User Story:** As a developer, I want admin yoki tizim tomonidan push xabar yuborishni, so that bron holati o'zgarganda foydalanuvchi darhol xabardor bo'lsin.

#### Acceptance Criteria

1. WHEN bron holati `confirmed` ga o'zgarganda, THE Notification_API SHALL tegishli foydalanuvchiga `{ title: 'Bron tasdiqlandi! 🎉', body: '...', url: '/bookings' }` formatida push xabar yuboradi.
2. WHEN bron holati `rejected` ga o'zgarganda, THE Notification_API SHALL tegishli foydalanuvchiga `{ title: 'Bron rad etildi ❌', body: '...', url: '/bookings' }` formatida push xabar yuboradi.
3. THE Notification_API SHALL `web-push` kutubxonasining `sendNotification()` funksiyasidan foydalanadi va VAPID kalitlari bilan sozlanadi.
4. IF foydalanuvchining subscription ma'lumotlari topilmasa, THEN THE Notification_API SHALL xato tashlamasdan, faqat log yozadi va davom etadi.
5. IF `sendNotification()` `410 Gone` xatosi qaytarsa (subscription bekor qilingan), THEN THE Notification_API SHALL ushbu subscriptionni ma'lumotlar bazasidan o'chiradi.
6. THE Notification_API SHALL mock rejimida real push yuborish o'rniga `console.log` orqali xabar tarkibini chiqaradi; real backend tayyor bo'lganda almashtiriladi.

---

### Requirement 7: iOS Moslik

**User Story:** As a iOS foydalanuvchisi, I want push bildirishnomalarni iPhone da olishni, so that Android foydalanuvchilar bilan teng imkoniyatga ega bo'laman.

#### Acceptance Criteria

1. THE Push_System SHALL iOS 16.4 va undan yuqori versiyalarda PWA standalone rejimida push bildirishnomalarni qo'llab-quvvatlaydi.
2. WHEN iOS qurilmada push subscription yaratilsa, THE Push_Manager SHALL `applicationServerKey` ni `Uint8Array` formatiga to'g'ri o'tkazadi, chunki iOS Safari base64url string ni qabul qilmaydi.
3. THE Push_System SHALL iOS da bildirishnoma ko'rsatishda `icon` va `badge` maydonlarini to'g'ri formatda (PNG, 192x192) taqdim etadi.
4. WHERE iOS qurilma aniqlansa va PWA standalone rejimida bo'lmasa, THE Push_Manager SHALL foydalanuvchiga "Ilovani telefonga o'rnatib, push bildirishnomalarni yoqing" ko'rsatmasi beradi.
5. THE Push_System SHALL `manifest.json` da `display: "standalone"` va `start_url` to'g'ri sozlanganligini talab qiladi (mavjud `manifest.json` allaqachon mos keladi).

---

### Requirement 8: Xato Boshqaruvi va Loglash

**User Story:** As a developer, I want barcha xatolar to'g'ri boshqarilishini, so that tizim ishonchli ishlaydi va muammolarni tezda topish mumkin bo'lsin.

#### Acceptance Criteria

1. IF Service Worker ro'yxatdan o'tishda xato yuz bersa, THEN THE Push_System SHALL xatoni `console.error` orqali loglaydi va ilovaning asosiy funksionalligiga ta'sir qilmaydi.
2. IF `PushManager.subscribe()` xato qaytarsa, THEN THE Permission_Manager SHALL foydalanuvchiga tushunarli xato xabari ko'rsatadi va `isLoading` ni `false` ga qaytaradi.
3. IF backend subscription API ga so'rov muvaffaqiyatsiz bo'lsa, THEN THE Push_Manager SHALL xatoni loglaydi, lekin foydalanuvchi interfeysini bloklamaydi (subscription lokal saqlanadi).
4. THE Push_System SHALL barcha async operatsiyalarda `try/catch` ishlatadi va unhandled promise rejection larning oldini oladi.
5. IF brauzer `Notification` API ni qo'llab-quvvatlamasa, THEN THE Push_System SHALL `'unsupported'` holatini qaytaradi va bildirishnoma funksiyalarini chaqirmaydi.

---

### Requirement 9: Mavjud Notification_Store bilan Integratsiya

**User Story:** As a foydalanuvchi, I want push bildirishnomalar va lokal bildirishnomalar bir joyda ko'rinishini, so that barcha xabarlarni `Notifications` sahifasida ko'ra olaman.

#### Acceptance Criteria

1. WHEN push bildirishnoma qabul qilinsa, THE Service_Worker SHALL bildirishnomani ko'rsatish bilan birga, `Notification_Store` ga ham yozadi (mavjud `saveLocalNotification()` funksiyasi orqali).
2. THE Push_System SHALL mavjud `LocalNotification` interfeysi va `NotifType` tiplaridan foydalanadi, yangi tip qo'shmaydi.
3. WHEN foydalanuvchi bildirishnomaga bosib ilovaga qaytsa, THE Push_System SHALL tegishli sahifaga (`/bookings`) yo'naltiradi va bildirishnomani o'qilgan deb belgilaydi.
4. THE Push_System SHALL mavjud `notifications.ts` faylidagi `requestNotificationPermission()` funksiyasini almashtirmaydi, balki kengaytiradi.
