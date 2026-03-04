/**
 * Telefon raqamni formatlash uchun utility funksiyalar
 * Format: +998 XX XXX XX XX
 */

export const formatPhoneNumber = (value: string): string => {
  // Faqat raqamlarni qoldirish
  const numbers = value.replace(/\D/g, '');
  
  // Agar 998 bilan boshlanmasa, qo'shish
  let formatted = numbers;
  if (!formatted.startsWith('998')) {
    formatted = '998' + formatted;
  }
  
  // Maksimal uzunlik: 998 + 9 raqam = 12
  formatted = formatted.slice(0, 12);
  
  // Formatlash: +998 XX XXX XX XX
  let result = '+';
  
  if (formatted.length > 0) {
    result += formatted.slice(0, 3); // 998
  }
  if (formatted.length > 3) {
    result += ' ' + formatted.slice(3, 5); // XX
  }
  if (formatted.length > 5) {
    result += ' ' + formatted.slice(5, 8); // XXX
  }
  if (formatted.length > 8) {
    result += ' ' + formatted.slice(8, 10); // XX
  }
  if (formatted.length > 10) {
    result += ' ' + formatted.slice(10, 12); // XX
  }
  
  return result;
};

export const cleanPhoneNumber = (value: string): string => {
  // Faqat raqamlarni qoldirish
  const numbers = value.replace(/\D/g, '');
  
  // +998 prefiksini qo'shish
  if (numbers.startsWith('998')) {
    return '+' + numbers;
  }
  return '+998' + numbers;
};

export const isValidUzbekPhone = (value: string): boolean => {
  // Faqat raqamlarni olish
  const numbers = value.replace(/\D/g, '');
  
  // 998 bilan boshlanishi va jami 12 ta raqam bo'lishi kerak
  return numbers.startsWith('998') && numbers.length === 12;
};
