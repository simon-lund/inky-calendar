import { endOfMonth, format, setHours, setMinutes, setDate, addMinutes } from 'date-fns';
import type { CalEvent } from '@/lib/events';

// The static demo (INKY_DEMO=1) has no API: example events instead of an iCal feed, drawings in localStorage.
export const DEMO = process.env.NEXT_PUBLIC_INKY_DEMO === '1';

// Placed by day of month, so every month you page to has some.
const SAMPLE = [
  { day: 2, h: 9, m: 30, min: 60, summary: 'Dentist' },
  { day: 4, h: 18, m: 0, min: 120, summary: 'Climbing' },
  { day: 7, h: 10, m: 0, min: 60, summary: 'Design review' },
  { day: 9, h: 19, m: 30, min: 150, summary: 'Dinner with friends' },
  { day: 12, h: 7, m: 45, min: 90, summary: 'Flight to Berlin' },
  { day: 14, h: 14, m: 0, min: 180, summary: 'Workshop' },
  { day: 17, h: 11, m: 0, min: 30, summary: 'Call with the bank' },
  { day: 17, h: 18, m: 30, min: 120, summary: 'Climbing' },
  { day: 21, h: 9, m: 0, min: 120, summary: 'Quarterly planning' },
  { day: 24, h: 20, m: 0, min: 150, summary: 'Concert' },
  { day: 27, h: 12, m: 30, min: 60, summary: 'Lunch with the team' },
  { day: 30, h: 16, m: 0, min: 60, summary: 'Haircut' },
];

export function demoEvents(month: Date): CalEvent[] {
  const last = endOfMonth(month).getDate();
  return SAMPLE.filter((e) => e.day <= last).map((e) => {
    const start = setMinutes(setHours(setDate(month, e.day), e.h), e.m);
    return { summary: e.summary, start: start.toISOString(), end: addMinutes(start, e.min).toISOString() };
  });
}

const key = (month: Date) => `inky-demo-drawing:${format(month, 'yyyy-MM')}`;

export function loadDemoDrawing(month: Date): string | null {
  try {
    return localStorage.getItem(key(month));
  } catch {
    return null;
  }
}

export function saveDemoDrawing(month: Date, data: string) {
  try {
    localStorage.setItem(key(month), data);
  } catch {
    // storage blocked: the drawing just isn't kept
  }
}
