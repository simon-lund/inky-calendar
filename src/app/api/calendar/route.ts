import { NextResponse } from 'next/server';
import ical, { type CalendarResponse, type VEvent } from 'node-ical';
import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import type { CalEvent } from '@/lib/events';

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; data: CalendarResponse }>();

// A fresh copy of the feed at most every few minutes (or right away when asked); if Google is unreachable, the last copy.
async function loadFeed(url: string, force: boolean): Promise<CalendarResponse> {
    const hit = cache.get(url);
    if (!force && hit && Date.now() - hit.at < CACHE_MS) return hit.data;
    try {
        const data = await ical.async.fromURL(url);
        cache.set(url, { at: Date.now(), data });
        return data;
    } catch (error) {
        if (hit) return hit.data;
        throw error;
    }
}

// node-ical returns text properties either as a string or as { val, params }.
const text = (v: unknown): string =>
    typeof v === 'string' ? v : v && typeof v === 'object' && 'val' in v ? String((v as { val: unknown }).val) : '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url') || process.env.ICAL_URL;
    const dateStr = searchParams.get('date'); // Date within the month

    if (!rawUrl) {
        return NextResponse.json({ error: 'No calendar URL set', code: 'missing_url' }, { status: 400 });
    }
    const url = rawUrl.replace(/^webcal:\/\//i, 'https://');

    try {
        const data = await loadFeed(url, searchParams.get('refresh') === '1');
        const focusDate = dateStr ? new Date(dateStr) : new Date();

        // Whole weeks around the month, like the grid shows
        const viewStart = startOfWeek(startOfMonth(focusDate), { weekStartsOn: 1 });
        const viewEnd = endOfWeek(endOfMonth(focusDate), { weekStartsOn: 1 });

        const events: CalEvent[] = [];
        const add = (summary: string, start: Date, end: Date, allDay: boolean) => {
            if (allDay && end <= start) end = addDays(start, 1);
            if (start > viewEnd || end < viewStart) return;
            const fmt = (d: Date) => (allDay ? format(d, 'yyyy-MM-dd') : d.toISOString());
            events.push({ summary, start: fmt(start), end: fmt(end), allDay });
        };

        for (const item of Object.values(data)) {
            if (!item || item.type !== 'VEVENT') continue;
            const event = item as VEvent;
            const allDay = event.datetype === 'date';
            const start = new Date(event.start);
            const end = event.end ? new Date(event.end) : start;
            const duration = end.getTime() - start.getTime();

            if (!event.rrule) {
                add(text(event.summary), start, end, allDay);
                continue;
            }

            // Repeating event: expand the occurrences inside the grid, honouring exceptions and edited instances
            for (const date of event.rrule.between(new Date(viewStart.getTime() - duration), viewEnd, true)) {
                const key = date.toISOString().slice(0, 10);
                if (event.exdate?.[key]) continue;
                const edited = event.recurrences?.[key];
                if (edited) {
                    add(text(edited.summary), new Date(edited.start), new Date(edited.end ?? edited.start), edited.datetype === 'date');
                } else {
                    add(text(event.summary), date, new Date(date.getTime() + duration), allDay);
                }
            }
        }

        return NextResponse.json({ events, viewStart: viewStart.toISOString() });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return NextResponse.json({ error: 'Failed to fetch calendar', code: 'calendar_fetch_failed' }, { status: 502 });
    }
}
