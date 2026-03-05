# 🔍 Console Debug Guide - Vaqt Slotlari

## 📊 Console Loglarini Ko'rish

### 1. Brauzer Console Ochish

**Chrome/Edge:**
- `F12` yoki `Ctrl+Shift+I` (Windows/Linux)
- `Cmd+Option+I` (Mac)

**Firefox:**
- `F12` yoki `Ctrl+Shift+K`

**Safari:**
- `Cmd+Option+C`

---

## 🎯 Qanday Loglar Ko'rinadi

### Booking Modal Ochilganda:

```
=== VAQT SLOTLARINI GENERATSIYA QILISH ===
Maydon: City Sports Complex
Ish vaqti: 08:00:00 - 23:00:00
Tanlangan sana: 2026-03-05
Barcha vaqt slotlari (filtrlashdan oldin): [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  ...
  '22:00 - 23:00'
]
Jami: 15 ta slot
O'tgan vaqtlar filtrlangandan keyin: [
  '14:00 - 15:00',
  '15:00 - 16:00',
  ...
  '22:00 - 23:00'
]
Qolgan: 9 ta slot
```

---

### TimeSlotPicker Render Bo'lganda:

```
=== FOYDALANUVCHI UCHUN VAQT SLOTLARI ===
Barcha slotlar: [
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00'
]
Band qilingan slotlar: [
  '18:00 - 19:00',
  '19:00 - 20:00'
]
Bo'sh slotlar (ko'rsatiladigan): [
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00'
]
Band slotlar soni: 2
Bo'sh slotlar soni: 7
```

---

### Agar Barcha Vaqtlar Band Bo'lsa:

```
⚠️ DIQQAT: Barcha vaqtlar band!
Jami slotlar: 9
Band slotlar: 9
```

---

## 📋 Log Ma'lumotlari Tushuntirish

### 1. Vaqt Slotlarini Generatsiya Qilish

**Maydon**: Qaysi maydon uchun vaqtlar ko'rsatilmoqda
```
Maydon: City Sports Complex
```

**Ish vaqti**: Maydonning ochilish va yopilish vaqti
```
Ish vaqti: 08:00:00 - 23:00:00
```

**Tanlangan sana**: Foydalanuvchi qaysi sanani tanlagani
```
Tanlangan sana: 2026-03-05
```

**Barcha vaqt slotlari**: Maydonning barcha ish vaqtlari
```
Barcha vaqt slotlari (filtrlashdan oldin): ['08:00 - 09:00', '09:00 - 10:00', ...]
Jami: 15 ta slot
```

**Filtrlangandan keyin**: O'tgan vaqtlar olib tashlangandan keyin
```
O'tgan vaqtlar filtrlangandan keyin: ['14:00 - 15:00', '15:00 - 16:00', ...]
Qolgan: 9 ta slot
```

---

### 2. Foydalanuvchi Uchun Vaqt Slotlari

**Barcha slotlar**: Filtrlangandan keyingi barcha slotlar
```
Barcha slotlar: ['14:00 - 15:00', '15:00 - 16:00', ...]
```

**Band qilingan slotlar**: Boshqa foydalanuvchilar band qilgan vaqtlar
```
Band qilingan slotlar: ['18:00 - 19:00', '19:00 - 20:00']
```

**Bo'sh slotlar**: Foydalanuvchi tanlashi mumkin bo'lgan vaqtlar
```
Bo'sh slotlar (ko'rsatiladigan): ['14:00 - 15:00', '16:00 - 17:00', ...]
```

**Statistika**:
```
Band slotlar soni: 2
Bo'sh slotlar soni: 7
```

---

## 🔍 Debug Stsenariylari

### Stsenariy 1: Bugun Uchun Vaqt Tanlash

**Hozirgi vaqt**: 13:45

**Console Output**:
```
=== VAQT SLOTLARINI GENERATSIYA QILISH ===
Maydon: Elite Arena
Ish vaqti: 08:00:00 - 23:00:00
Tanlangan sana: 2026-03-05
Barcha vaqt slotlari (filtrlashdan oldin): [15 ta slot]
Jami: 15 ta slot
O'tgan vaqtlar filtrlangandan keyin: [9 ta slot] ← 08:00-13:00 olib tashlandi
Qolgan: 9 ta slot
```

**Tushuntirish**: 
- Hozirgi soat 13:45
- 14:00 dan oldingi barcha vaqtlar yashirildi
- Faqat 14:00 dan keyingi vaqtlar ko'rsatiladi

---

### Stsenariy 2: Ertaga Uchun Vaqt Tanlash

**Console Output**:
```
=== VAQT SLOTLARINI GENERATSIYA QILISH ===
Maydon: Stadium Pro
Ish vaqti: 08:00:00 - 23:00:00
Tanlangan sana: 2026-03-06
Barcha vaqt slotlari (filtrlashdan oldin): [15 ta slot]
Jami: 15 ta slot
O'tgan vaqtlar filtrlangandan keyin: [15 ta slot] ← Hech narsa olib tashlanmadi
Qolgan: 15 ta slot
```

**Tushuntirish**:
- Ertaga uchun
- Barcha vaqtlar ko'rsatiladi (08:00 dan 23:00 gacha)

---

### Stsenariy 3: Ba'zi Vaqtlar Band

**Console Output**:
```
=== FOYDALANUVCHI UCHUN VAQT SLOTLARI ===
Barcha slotlar: [9 ta slot]
Band qilingan slotlar: ['18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00']
Bo'sh slotlar (ko'rsatiladigan): [6 ta slot]
Band slotlar soni: 3
Bo'sh slotlar soni: 6
```

**Tushuntirish**:
- 9 ta slot mavjud
- 3 tasi band (18:00-21:00)
- 6 tasi bo'sh (foydalanuvchi tanlashi mumkin)

---

### Stsenariy 4: Barcha Vaqtlar Band

**Console Output**:
```
=== FOYDALANUVCHI UCHUN VAQT SLOTLARI ===
Barcha slotlar: [9 ta slot]
Band qilingan slotlar: [9 ta slot]
Bo'sh slotlar (ko'rsatiladigan): []
Band slotlar soni: 9
Bo'sh slotlar soni: 0

⚠️ DIQQAT: Barcha vaqtlar band!
Jami slotlar: 9
Band slotlar: 9
```

**Tushuntirish**:
- Barcha vaqtlar band qilingan
- Foydalanuvchiga "Barcha vaqtlar band" xabari ko'rsatiladi
- Boshqa sana tanlash tavsiya etiladi

---

## 🎯 Muammolarni Aniqlash

### Muammo 1: Bo'sh Vaqtlar Ko'rinmayapti

**Console Tekshirish**:
```
Band qilingan slotlar: [juda ko'p slotlar]
Bo'sh slotlar soni: 0
```

**Sabab**: Barcha vaqtlar band qilingan

**Yechim**: Boshqa sana tanlang

---

### Muammo 2: Band Vaqtlar Ko'rsatilmoqda

**Console Tekshirish**:
```
Band qilingan slotlar: ['18:00 - 19:00']
Bo'sh slotlar (ko'rsatiladigan): ['18:00 - 19:00'] ← XATO!
```

**Sabab**: Filtrlash ishlamayapti

**Yechim**: Kod xatosi, tuzatish kerak

---

### Muammo 3: O'tgan Vaqtlar Ko'rsatilmoqda

**Console Tekshirish**:
```
Hozirgi vaqt: 15:30
O'tgan vaqtlar filtrlangandan keyin: ['08:00 - 09:00', '09:00 - 10:00', ...]
```

**Sabab**: Vaqt filtri ishlamayapti

**Yechim**: `filterPastSlots` funksiyasini tekshirish

---

## 📊 Console Filtrlash

### Faqat Vaqt Slotlari Loglarini Ko'rish

**Console da filter qo'llash**:
```javascript
// Chrome DevTools Console da
// Filter: "VAQT SLOTLARI"
```

**Yoki kod orqali**:
```javascript
// Faqat muhim loglarni ko'rish
console.log('%c=== VAQT SLOTLARI ===', 'color: blue; font-weight: bold');
```

---

## 🔧 Debug Rejimi

### Production da Loglarni O'chirish

**Agar kerak bo'lsa, loglarni o'chirish mumkin**:

```typescript
const DEBUG = false; // false qiling production da

if (DEBUG) {
  console.log('Debug ma\'lumot');
}
```

**Yoki environment variable orqali**:
```typescript
const DEBUG = import.meta.env.DEV; // Faqat development da

if (DEBUG) {
  console.log('Debug ma\'lumot');
}
```

---

## 📝 Qisqacha Qo'llanma

### Vaqt Slotlarini Tekshirish:

1. **Brauzer Console Oching** (F12)
2. **Booking Modal Oching** (Maydon tanlang → "Band qilish")
3. **Console Loglarini Ko'ring**:
   - Barcha slotlar
   - Band slotlar
   - Bo'sh slotlar
4. **Muammolarni Aniqlang**:
   - Bo'sh slotlar soni 0 bo'lsa → Boshqa sana tanlang
   - Band slotlar ko'rsatilsa → Kod xatosi
   - O'tgan vaqtlar ko'rsatilsa → Vaqt filtri xatosi

---

## 🎉 Foydalanish Misoli

### Oddiy Holat:

```
1. Maydon: City Sports Complex
2. Sana: Bugun (2026-03-05)
3. Hozirgi vaqt: 13:45

Console Output:
├─ Barcha slotlar: 15 ta (08:00 - 23:00)
├─ O'tgan vaqtlar olib tashlandi: 6 ta (08:00 - 13:00)
├─ Qolgan: 9 ta (14:00 - 23:00)
├─ Band slotlar: 2 ta (18:00 - 20:00)
└─ Bo'sh slotlar: 7 ta (14:00-18:00, 20:00-23:00)

Natija: Foydalanuvchi 7 ta vaqtni tanlashi mumkin
```

---

**Debug Guide Versiyasi**: 1.0  
**Sana**: 5-mart, 2026  
**Status**: ✅ Tayyor
