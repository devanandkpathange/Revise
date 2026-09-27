import { format, addDays, parseISO, startOfDay } from 'date-fns';

export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysToStr(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  const newDate = addDays(date, days);
  return format(newDate, 'yyyy-MM-dd');
}

export function isPastOrToday(dateStr: string): boolean {
  const today = startOfDay(new Date());
  const date = parseISO(dateStr);
  return date <= today;
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  
  // Sort descending
  const sorted = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
  
  let streak = 0;
  const todayStr = getTodayStr();
  let currentExpectedDate = todayStr;
  
  // If no task completed today, we check if they completed yesterday.
  // If not today and not yesterday, streak is 0.
  if (sorted[0] !== todayStr) {
    const yesterdayStr = addDaysToStr(todayStr, -1);
    if (sorted[0] === yesterdayStr) {
      currentExpectedDate = yesterdayStr;
    } else {
      return 0; // Missed yesterday and today
    }
  }

  for (const dateStr of sorted) {
    if (dateStr === currentExpectedDate) {
      streak++;
      currentExpectedDate = addDaysToStr(currentExpectedDate, -1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}
