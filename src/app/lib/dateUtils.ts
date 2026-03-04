import { format, startOfDay, addDays, parseISO } from 'date-fns';

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 * This ensures March 4, 2026 is always '2026-03-04' regardless of timezone
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date object to YYYY-MM-DD string (local timezone)
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date for selection (today, tomorrow, dayAfter)
 */
export function getDateForSelection(selection: string): Date {
  const today = startOfDay(new Date());
  
  switch (selection) {
    case 'today':
      return today;
    case 'tomorrow':
      return addDays(today, 1);
    case 'dayAfter':
      return addDays(today, 2);
    default:
      return today;
  }
}

/**
 * Parse YYYY-MM-DD string to Date object
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return toDateString(date1) === toDateString(date2);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return toDateString(date) === toDateString(today);
}

/**
 * Format time from HH:MM:SS to HH:MM
 */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Calculate hours between two time strings (HH:MM:SS)
 */
export function calculateHours(startTime: string, endTime: string): number {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  return endHour - startHour;
}

/**
 * Get current hour (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Filter out past time slots for today
 * @param slots - Array of time slot strings like "08:00 - 09:00"
 * @param selectedDate - The selected date
 * @returns Filtered array of time slots
 */
export function filterPastSlots(slots: string[], selectedDate: Date): string[] {
  // If not today, return all slots
  if (!isToday(selectedDate)) {
    return slots;
  }

  const currentHour = getCurrentHour();
  
  // Filter out slots that have already passed
  return slots.filter(slot => {
    const [startStr] = slot.split(' - ');
    const slotHour = parseInt(startStr.split(':')[0]);
    return slotHour > currentHour;
  });
}
