import { endOfDay, isSameDay, parseISO, startOfDay } from 'date-fns';

export interface CalEvent {
    summary: string;
    /** Timed events: ISO instant. All-day events: local date `yyyy-MM-dd`. */
    start: string;
    /** Same format as `start`; for all-day events the end day is exclusive (iCal). */
    end: string;
    allDay?: boolean;
}

export function eventsOnDay(events: CalEvent[], day: Date): CalEvent[] {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return events
        .filter((e) => {
            const s = parseISO(e.start);
            const end = parseISO(e.end);
            if (e.allDay) return s <= dayEnd && end > dayStart;
            return isSameDay(s, day) || (s < dayEnd && end > dayStart && end > s);
        })
        .sort(
            (a, b) =>
                Number(!!b.allDay) - Number(!!a.allDay) ||
                parseISO(a.start).getTime() - parseISO(b.start).getTime(),
        );
}

/** A timed event shows its clock time only on the day it starts. */
export const showsTimeOn = (e: CalEvent, day: Date) => !e.allDay && isSameDay(parseISO(e.start), day);
