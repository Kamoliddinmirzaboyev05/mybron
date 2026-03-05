# 📊 Console Output Misoli

## 🎯 Haqiqiy Console Output

### Misol 1: 2 ta Bron Mavjud

```
╔═══════════════════════════════════════════════════════════════════╗
║  🔍 PITCHDETAILS - BAND VAQTLARNI OLISH (fetchBookedSlots)      ║
╚═══════════════════════════════════════════════════════════════════╝

� DATABASE QUERY PARAMETRLARI:
   ├─ Jadval: bookings
   ├─ pitch_id: abc123-def456-ghi789
   ├─ booking_date: 2026-03-05
   └─ status filter: ['pending', 'confirmed', 'manual']

📊 DATABASE DAN KELGAN MA'LUMOT:
   └─ Topilgan bronlar soni: 2

📋 BOOKINGS JADVALIDAGI BARCHA BRONLAR:
   ┌─────────────────────────────────────────────────────────┐
   │ Bron #1:
   │  ├─ start_time: 18:00:00
   │  ├─ end_time: 20:00:00
   │  └─ status: confirmed
   │
   │ Bron #2:
   │  ├─ start_time: 14:30:00
   │  ├─ end_time: 16:45:00
   │  └─ status: pending
   └─────────────────────────────────────────────────────────┘

🔄 VAQT SLOTLARINI HISOBLASH (Range-Based Algorithm):
   └─ Algoritm: slot_time >= booking_start AND slot_time < booking_end

   ┌─ Bron #1 ni qayta ishlash:
   │  ├─ Original (database): 18:00:00 - 20:00:00
   │  ├─ Normalized (HH:mm): 18:00 - 20:00
   │  ├─ Start minutes: 1080 (18*60 + 0)
   │  ├─ End minutes: 1200 (20*60 + 0)
   │  │
   │  └─ Band qilinadigan slotlar:
   │     ├─ ✓ 18:00 - 19:00 (1080 >= 1080 AND 1080 < 1200)
   │     ├─ ✓ 19:00 - 20:00 (1140 >= 1080 AND 1140 < 1200)
   └─ Jami: 2 ta slot band qilindi

   ┌─ Bron #2 ni qayta ishlash:
   │  ├─ Original (database): 14:30:00 - 16:45:00
   │  ├─ Normalized (HH:mm): 14:30 - 16:45
   │  ├─ Start minutes: 870 (14*60 + 30)
   │  ├─ End minutes: 1005 (16*60 + 45)
   │  │
   │  └─ Band qilinadigan slotlar:
   │     ├─ ✓ 14:00 - 15:00 (840 >= 870 AND 840 < 1005)
   │     ├─ ✓ 15:00 - 16:00 (900 >= 870 AND 900 < 1005)
   │     ├─ ✓ 16:00 - 17:00 (960 >= 870 AND 960 < 1005)
   └─ Jami: 3 ta slot band qilindi

╔═══════════════════════════════════════════════════════════════════╗
║  📊 YAKUNIY NATIJA (bookedSlots Set ga saqlandi)                ║
╚═══════════════════════════════════════════════════════════════════╝

🔒 Band slotlar (Set):
   1. 14:00 - 15:00
   2. 15:00 - 16:00
   3. 16:00 - 17:00
   4. 18:00 - 19:00
   5. 19:00 - 20:00

📈 Statistika:
   ├─ Jami band slotlar: 5 ta
   ├─ Qayta ishlangan bronlar: 2 ta
   └─ Sana: 2026-03-05

💾 KEYINGI QADAM:
   └─ Bu Set BookingModal → TimeSlotPicker ga props orqali uzatiladi

═══════════════════════════════════════════════════════════════════

╔════════════════════════════════════════════════════════╗
║  📊 TIMESLOTPICKER - VAQT SLOTLARI TAHLILI           ║
╚════════════════════════════════════════════════════════╝

📥 KIRUVCHI MA'LUMOTLAR:
   ├─ slots (props dan): ['08:00 - 09:00', '09:00 - 10:00', ..., '22:00 - 23:00']
   │  └─ Jami: 15 ta slot
   │
   └─ bookedSlots (props dan): ['14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '18:00 - 19:00', '19:00 - 20:00']
      └─ Jami: 5 ta band slot

🔍 FILTRLASH JARAYONI:
   Har bir slot uchun tekshirish: bookedSlots.has(slot)

   ❌ BAND SLOTLAR (ko'rsatilmaydi):
      ├─ 14:00 - 15:00 ← bookedSlots da mavjud
      ├─ 15:00 - 16:00 ← bookedSlots da mavjud
      ├─ 16:00 - 17:00 ← bookedSlots da mavjud
      ├─ 18:00 - 19:00 ← bookedSlots da mavjud
      ├─ 19:00 - 20:00 ← bookedSlots da mavjud

   ✅ BO'SH SLOTLAR (ko'rsatiladi):
      ├─ 08:00 - 09:00 ← bookedSlots da yo'q
      ├─ 09:00 - 10:00 ← bookedSlots da yo'q
      ├─ 10:00 - 11:00 ← bookedSlots da yo'q
      ├─ 11:00 - 12:00 ← bookedSlots da yo'q
      ├─ 12:00 - 13:00 ← bookedSlots da yo'q
      ├─ 13:00 - 14:00 ← bookedSlots da yo'q
      ├─ 17:00 - 18:00 ← bookedSlots da yo'q
      ├─ 20:00 - 21:00 ← bookedSlots da yo'q
      ├─ 21:00 - 22:00 ← bookedSlots da yo'q
      ├─ 22:00 - 23:00 ← bookedSlots da yo'q

📊 YAKUNIY NATIJA:
   ├─ Band slotlar: 5 ta
   ├─ Bo'sh slotlar: 10 ta
   └─ Jami slotlar: 15 ta

💡 MANBA:
   ├─ slots → BookingModal.tsx dan keladi
   ├─ bookedSlots → PitchDetails.tsx dan keladi
   └─ bookedSlots → fetchBookedSlots() funksiyasidan to'ldiriladi

════════════════════════════════════════════════════════
```

---

### Misol 2: Hech Qanday Bron Yo'q

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 BAND VAQTLARNI OLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Maydon ID: abc123-def456-ghi789
📅 Sana: 2026-03-06
📊 Topilgan bronlar: 0

🔄 VAQT SLOTLARINI HISOBLASH:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YAKUNIY NATIJA:
🔒 Band slotlar: []
📈 Jami: 0 ta slot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Misol 3: Sekundlar Bilan Bron

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 BAND VAQTLARNI OLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Maydon ID: abc123-def456-ghi789
📅 Sana: 2026-03-05
📊 Topilgan bronlar: 1

📋 BARCHA BRONLAR:

   Bron #1:
   ├─ start_time: 13:00:30
   ├─ end_time: 17:00:45
   └─ status: confirmed

🔄 VAQT SLOTLARINI HISOBLASH:

   📌 Bron #1:
      Original: 13:00:30 - 17:00:45
      Normalized: 13:00 - 17:00  ← Sekundlar olib tashlandi
      Minutes: 780 - 1020
      Band qilinadigan slotlar:
         ✓ 13:00 - 14:00
         ✓ 14:00 - 15:00
         ✓ 15:00 - 16:00
         ✓ 16:00 - 17:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YAKUNIY NATIJA:
🔒 Band slotlar: [
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
]
📈 Jami: 4 ta slot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Misol 4: Oraliq Vaqtlar Bilan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 BAND VAQTLARNI OLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Maydon ID: abc123-def456-ghi789
📅 Sana: 2026-03-05
📊 Topilgan bronlar: 1

📋 BARCHA BRONLAR:

   Bron #1:
   ├─ start_time: 13:30:00
   ├─ end_time: 16:45:00
   └─ status: pending

🔄 VAQT SLOTLARINI HISOBLASH:

   📌 Bron #1:
      Original: 13:30:00 - 16:45:00
      Normalized: 13:30 - 16:45
      Minutes: 810 - 1005  ← 13*60+30=810, 16*60+45=1005
      Band qilinadigan slotlar:
         ✓ 14:00 - 15:00  ← 840 >= 810 AND 840 < 1005
         ✓ 15:00 - 16:00  ← 900 >= 810 AND 900 < 1005
         ✓ 16:00 - 17:00  ← 960 >= 810 AND 960 < 1005

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YAKUNIY NATIJA:
🔒 Band slotlar: [
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
]
📈 Jami: 3 ta slot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DIQQAT: 13:00-14:00 ko'rsatilmaydi chunki 13:00 (780 min) < 13:30 (810 min)
```

---

### Misol 5: Ko'p Bronlar

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 BAND VAQTLARNI OLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Maydon ID: abc123-def456-ghi789
📅 Sana: 2026-03-05
📊 Topilgan bronlar: 4

📋 BARCHA BRONLAR:

   Bron #1:
   ├─ start_time: 10:00:00
   ├─ end_time: 12:00:00
   └─ status: confirmed

   Bron #2:
   ├─ start_time: 14:00:00
   ├─ end_time: 16:00:00
   └─ status: pending

   Bron #3:
   ├─ start_time: 18:00:00
   ├─ end_time: 20:00:00
   └─ status: manual

   Bron #4:
   ├─ start_time: 21:00:00
   ├─ end_time: 22:00:00
   └─ status: confirmed

🔄 VAQT SLOTLARINI HISOBLASH:

   📌 Bron #1:
      Original: 10:00:00 - 12:00:00
      Normalized: 10:00 - 12:00
      Minutes: 600 - 720
      Band qilinadigan slotlar:
         ✓ 10:00 - 11:00
         ✓ 11:00 - 12:00

   📌 Bron #2:
      Original: 14:00:00 - 16:00:00
      Normalized: 14:00 - 16:00
      Minutes: 840 - 960
      Band qilinadigan slotlar:
         ✓ 14:00 - 15:00
         ✓ 15:00 - 16:00

   📌 Bron #3:
      Original: 18:00:00 - 20:00:00
      Normalized: 18:00 - 20:00
      Minutes: 1080 - 1200
      Band qilinadigan slotlar:
         ✓ 18:00 - 19:00
         ✓ 19:00 - 20:00

   📌 Bron #4:
      Original: 21:00:00 - 22:00:00
      Normalized: 21:00 - 22:00
      Minutes: 1260 - 1320
      Band qilinadigan slotlar:
         ✓ 21:00 - 22:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YAKUNIY NATIJA:
🔒 Band slotlar: [
  '10:00 - 11:00',
  '11:00 - 12:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '21:00 - 22:00'
]
📈 Jami: 7 ta slot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bo'sh slotlar: 08:00-10:00, 12:00-14:00, 16:00-18:00, 20:00-21:00, 22:00-23:00
```

---

## 🎯 Tushuntirish

### Har Bir Qism Nima Degani:

**1. Maydon ID**
```
📍 Maydon ID: abc123-def456-ghi789
```
- Qaysi maydon uchun vaqtlar tekshirilmoqda

**2. Sana**
```
📅 Sana: 2026-03-05
```
- Qaysi kun uchun bronlar qidirilmoqda

**3. Topilgan Bronlar**
```
📊 Topilgan bronlar: 2
```
- Database dan nechta bron topildi

**4. Har Bir Bron**
```
Bron #1:
├─ start_time: 18:00:00  ← Database dan kelgan
├─ end_time: 20:00:00    ← Database dan kelgan
└─ status: confirmed     ← Faqat pending/confirmed/manual
```

**5. Normalizatsiya**
```
Original: 18:00:00 - 20:00:00
Normalized: 18:00 - 20:00  ← Sekundlar olib tashlandi
```

**6. Minutlarga O'girish**
```
Minutes: 1080 - 1200
```
- 18:00 = 18*60 = 1080 minut
- 20:00 = 20*60 = 1200 minut

**7. Band Slotlar**
```
✓ 18:00 - 19:00  ← 1080 >= 1080 AND 1080 < 1200
✓ 19:00 - 20:00  ← 1140 >= 1080 AND 1140 < 1200
```

**8. Yakuniy Natija**
```
🔒 Band slotlar: ['18:00 - 19:00', '19:00 - 20:00']
📈 Jami: 2 ta slot
```

---

## 🔍 Qanday Foydalanish

1. **Browser Console Oching** (F12)
2. **Maydon Sahifasiga O'ting**
3. **"Band qilish" Tugmasini Bosing**
4. **Console da Loglarni Ko'ring**

---

## ✅ Nima Tekshirish Kerak

### ✓ To'g'ri Ishlayotgan Holat:

```
✅ Topilgan bronlar soni to'g'ri
✅ Har bir bron ma'lumotlari to'liq
✅ Normalizatsiya to'g'ri (sekundlar olib tashlangan)
✅ Minutlar to'g'ri hisoblanmoqda
✅ Band slotlar to'g'ri aniqlanmoqda
✅ Yakuniy natija mantiqiy
```

### ❌ Muammo Bo'lsa:

```
❌ Topilgan bronlar: 0 (lekin band slotlar bor)
   → Database query xato

❌ Normalized vaqtda sekundlar bor
   → substring(0, 5) ishlamayapti

❌ Band slotlar juda ko'p yoki juda kam
   → Range logic xato

❌ Yakuniy natijada takrorlanish
   → Set ishlamayapti
```

---

**Misol Versiyasi**: 1.0  
**Sana**: 5-mart, 2026  
**Status**: ✅ Tayyor
