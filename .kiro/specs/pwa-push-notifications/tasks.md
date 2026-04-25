# Implementation Tasks: PWA Push-Bildirishnomalar Tizimi

## Tasks

- [ ] 1. VAPID utility va environment sozlamalari
  - [ ] 1.1 `src/app/lib/vapid.ts` faylini yarat: `urlBase64ToUint8Array(base64String: string): Uint8Array` funksiyasini yoz (iOS Safari uchun zarur konvertatsiya)
  - [ ] 1.2 `isPushSupported(): boolean` va `isIOSStandalone(): boolean` yordamchi funksiyalarini `src/app/lib/notifications.ts` ga qo'sh
  - [ ] 1.3 `.env.example` faylini yarat: `VITE_VAPID_PUBLIC_KEY=` va `VAPID_PRIVATE_KEY=` va `VAPID_SUBJECT=` o'zgaruvchilarini hujjatlashtir
  - [ ] 1.4 `scripts/generate-vapid-keys.mjs` skriptini yarat: `web-push generateVAPIDKeys()` chaqirib natijani konsolga chiqaradi, developer uchun bir martalik ishlatiladi
  - Requirement: 2.1, 2.2, 2.3, 2.4, 7.2

- [ ] 2. Service Worker — push va notificationclick handlerlarini yangilash
  - [ ] 2.1 `public/sw.js` dagi mavjud `push` event handlerini yangilash: payload JSON parse xatosini `try/catch` bilan ushlash, `title`/`body`/`icon`/`badge`/`data.url`/`actions` maydonlarini standart qiymatlar bilan o'qish
  - [ ] 2.2 `notificationclick` handlerini yangilash: `event.notification.close()`, `clients.matchAll()` bilan mavjud oynani fokusga olish, yo'q bo'lsa `clients.openWindow(url)` chaqirish
  - [ ] 2.3 SW ichida `saveLocalNotification` ekvivalentini qo'shish: push qabul qilinganda `clients.matchAll()` orqali ochiq ilovaga `postMessage` yuborish, ilova uni `mybron_notif_update` event orqali qayta ishlaydi
  - [ ] 2.4 Barcha async operatsiyalar `event.waitUntil()` ichida ekanligini tekshirish
  - Requirement: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1

- [ ] 3. Mock Backend — subscription va notify API handlerlari
  - [ ] 3.1 `src/app/lib/mockPushApi.ts` faylini yarat: `StoredSubscription` interfeysi va `subscriptions: Map<string, StoredSubscription[]>` in-memory store
  - [ ] 3.2 `apiSubscribe(userId, subscription)` funksiyasini yoz: bir xil endpoint bo'lsa upsert, yo'q bo'lsa qo'shish (Req 5.4)
  - [ ] 3.3 `apiUnsubscribe(userId, endpoint)` funksiyasini yoz: endpoint bo'yicha subscriptionni o'chirish
  - [ ] 3.4 `apiSendNotification(userId, payload)` funksiyasini yoz: mock rejimda `console.log` bilan payload chiqarish, subscription topilmasa log yozib davom etish (Req 6.4, 6.6)
  - [ ] 3.5 `api.ts` ga `subscribePush(userId, subscription)` va `unsubscribePush(userId, endpoint)` metodlarini qo'sh: mock rejimda `mockPushApi` ga yo'naltiradi
  - Requirement: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6

- [ ] 4. `usePushNotifications` React hook
  - [ ] 4.1 `src/app/lib/usePushNotifications.ts` faylini yarat: `PushNotificationState` interfeysi (`permission`, `isSubscribed`, `isLoading`, `subscribe`, `unsubscribe`)
  - [ ] 4.2 `useEffect` da `navigator.serviceWorker.ready` orqali mavjud subscriptionni tekshirish (`pushManager.getSubscription()`)
  - [ ] 4.3 `subscribe()` funksiyasini yoz: `requestNotificationPermission()` → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY) })` → `api.subscribePush(userId, subscription.toJSON())`
  - [ ] 4.4 iOS standalone tekshiruvini qo'sh: `isIOSStandalone()` false bo'lsa subscribe urinmaslik, foydalanuvchiga ko'rsatma berish (Req 3.8, 7.4)
  - [ ] 4.5 `unsubscribe()` funksiyasini yoz: `subscription.unsubscribe()` → `api.unsubscribePush(userId, endpoint)`
  - [ ] 4.6 Barcha xatolarni `try/catch` bilan ushlash, `isLoading` ni `finally` blokida `false` ga qaytarish (Req 4.4, 8.2)
  - Requirement: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 8.2, 8.3

- [ ] 5. `Notifications.tsx` sahifasini `usePushNotifications` hook bilan integratsiya qilish
  - [ ] 5.1 `handleEnableNotifications` funksiyasini `usePushNotifications.subscribe()` ga almashtirib yangilash
  - [ ] 5.2 Permission banner ni kengaytirish: iOS standalone emas bo'lsa "Ilovani o'rnatib yoqing" ko'rsatmasini ko'rsatish
  - [ ] 5.3 `isSubscribed` holatiga qarab "Yoqish" / "O'chirish" tugmasini ko'rsatish
  - [ ] 5.4 `isLoading` holatida tugmada spinner ko'rsatish
  - Requirement: 3.1, 3.5, 3.6, 7.4, 8.2

- [ ] 6. `Profile.tsx` sahifasini `usePushNotifications` hook bilan integratsiya qilish
  - [ ] 6.1 `handleEnableNotifications` ni `usePushNotifications.subscribe()` ga almashtirib yangilash
  - [ ] 6.2 Bildirishnomalar bo'limida `isSubscribed` va `isLoading` holatlarini ko'rsatish
  - [ ] 6.3 iOS standalone emas bo'lsa "Ilovani o'rnatib yoqing" ko'rsatmasini qo'shish
  - Requirement: 3.1, 3.5, 3.6, 7.4

- [ ] 7. Service Worker `postMessage` → `notifications.ts` integratsiyasi
  - [ ] 7.1 `src/main.tsx` da `navigator.serviceWorker.addEventListener('message', handler)` qo'sh: SW dan kelgan `PUSH_RECEIVED` xabarini `saveLocalNotification()` orqali saqlash
  - [ ] 7.2 `mybron_notif_update` event dispatch qilish, shunda `Notifications.tsx` va `BottomNav` avtomatik yangilanadi
  - Requirement: 9.1, 9.2, 9.3

- [ ] 8. AdminDashboard — bron tasdiqlash/rad etishda push xabar yuborish
  - [ ] 8.1 `handleApproveBooking` funksiyasiga `api.subscribePush` orqali saqlangan subscriptionga `apiSendNotification` chaqiruvini qo'sh (mock: console.log)
  - [ ] 8.2 `handleRejectBooking` funksiyasiga xuddi shunday qo'sh
  - Requirement: 6.1, 6.2, 6.3

- [ ] 9. Property-based testlar (fast-check)
  - [ ] 9.1 `src/app/lib/__tests__/notifications.test.ts` faylini yarat: `saveLocalNotification` → `getLocalNotifications` round trip testi (P1)
  - [ ] 9.2 `getUnreadCount` invariant testi: N ta `read: false` notification saqlanganda `getUnreadCount() === N` (P3)
  - [ ] 9.3 `markAllRead` idempotentlik testi: bir yoki bir necha marta chaqirilganda `getUnreadCount() === 0` (P4)
  - [ ] 9.4 `src/app/lib/__tests__/mockPushApi.test.ts` faylini yarat: `apiSubscribe` upsert testi — bir xil endpoint bilan N marta chaqirilganda 1 ta yozuv (P5)
  - [ ] 9.5 `apiUnsubscribe` testi: subscribe → unsubscribe, endpoint topilmaydi (P6)
  - [ ] 9.6 `src/app/lib/__tests__/vapid.test.ts` faylini yarat: `urlBase64ToUint8Array` round trip testi (P7)
  - [ ] 9.7 Push payload default qiymatlar testi: to'liqsiz payload bilan SW handler xato tashlamasligini tekshirish (P8)
  - Requirement: 1.5, 2.4, 5.4, 5.3, 9.1, 9.2, 9.3, 9.4

- [ ] 10. `manifest.json` va `vercel.json` tekshiruvi
  - [ ] 10.1 `public/manifest.json` da `display: "standalone"`, `start_url: "/"`, `theme_color`, `icons` (192x192 va 512x512) mavjudligini tekshirish va kerak bo'lsa yangilash
  - [ ] 10.2 `vercel.json` da `sw.js` uchun `Service-Worker-Allowed: /` header mavjudligini tekshirish
  - Requirement: 7.5, 2.4
