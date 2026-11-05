"use client";

import React from 'react';
import { format, addDays, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { CalEvent, eventsOnDay, showsTimeOn } from '@/lib/events';

interface CalendarViewProps {
    viewStart: Date;
    viewEnd: Date;
    events: CalEvent[];
    currentMonth: Date;
    today: Date;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Month grid, Monday first. Fills its parent; the drawing canvas sits on top of it. */
const CalendarView: React.FC<CalendarViewProps> = ({ viewStart, viewEnd, events, currentMonth, today }) => {
    const days: Date[] = [];
    for (let day = viewStart; day <= viewEnd; day = addDays(day, 1)) days.push(day);
    const weeks = days.length / 7;

    return (
        <div
            className="grid h-full w-full grid-cols-7 border-t border-l border-black"
            style={{ gridTemplateRows: `auto repeat(${weeks}, minmax(0, 1fr))` }}
        >
            {WEEKDAYS.map((d) => (
                <div
                    key={d}
                    className="border-r border-b border-black bg-neutral-100 py-1 text-center text-xs font-semibold uppercase tracking-widest"
                >
                    {d}
                </div>
            ))}

            {days.map((day) => {
                const isToday = isSameDay(day, today);
                const inMonth = isSameMonth(day, currentMonth);
                const dayEvents = eventsOnDay(events, day);

                return (
                    <div
                        key={day.toISOString()}
                        className={`min-h-0 overflow-hidden border-r border-b border-black p-1.5 ${
                            inMonth ? '' : 'bg-neutral-200 text-neutral-500'
                        }`}
                    >
                        <div
                            className={`mb-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-bold tabular-nums ${
                                isToday ? 'bg-black text-white' : ''
                            }`}
                        >
                            {format(day, 'd')}
                        </div>
                        <div className="space-y-0.5 text-[clamp(10px,1.15vw,15px)] leading-tight">
                            {dayEvents.map((event, idx) =>
                                event.allDay ? (
                                    <div key={idx} className="truncate rounded-sm bg-black px-1 text-white">
                                        {event.summary}
                                    </div>
                                ) : (
                                    <div key={idx} className="truncate">
                                        {showsTimeOn(event, day) && (
                                            <span className="mr-1 font-semibold tabular-nums">
                                                {format(parseISO(event.start), 'HH:mm')}
                                            </span>
                                        )}
                                        {event.summary}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarView;
