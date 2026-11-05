"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { startOfMonth, addMonths, subMonths, format, startOfWeek, endOfWeek, endOfMonth, isSameMonth } from 'date-fns';
import CalendarView from '@/components/CalendarView';
import DrawingLayer from '@/components/DrawingLayer';
import SettingsDialog from '@/components/SettingsDialog';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EraserIcon,
  ExpandIcon,
  GearIcon,
  PenIcon,
  TrashIcon,
  UndoIcon,
} from '@/components/Icons';
import { DEMO, demoEvents, loadDemoDrawing, saveDemoDrawing } from '@/lib/demo';
import type { CalEvent } from '@/lib/events';
import { emptySheet, isBlank, parseSheet, serializeSheet, type Sheet, type Stroke, type Tool } from '@/lib/strokes';

const URL_KEY = 'inky-ical-url';
const REFRESH_MS = 15 * 60 * 1000;
const IDLE_MS = 5 * 60 * 1000;

const monthKey = (m: Date) => format(m, 'yyyy-MM');

export default function Home() {
  const [today, setToday] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [tool, setTool] = useState<Tool>('pen');

  const [events, setEvents] = useState<CalEvent[]>([]);
  const [feedError, setFeedError] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const [sheet, setSheet] = useState<Sheet>(emptySheet);
  const [sheetReady, setSheetReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const sheetRef = useRef(sheet);

  const [feedUrl, setFeedUrl] = useState('');
  const [hasServerUrl, setHasServerUrl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  const viewStart = useMemo(() => startOfWeek(currentMonth, { weekStartsOn: 1 }), [currentMonth]);
  const viewEnd = useMemo(() => endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }), [currentMonth]);
  const month = monthKey(currentMonth);
  const onCurrentMonth = isSameMonth(currentMonth, today);
  const hasFeed = DEMO || !!feedUrl || hasServerUrl;

  // One-time setup: remembered feed URL, whether the server has one, fullscreen support
  useEffect(() => {
    try {
      setFeedUrl(localStorage.getItem(URL_KEY) ?? '');
    } catch {
      // storage blocked: the feed has to be entered again after a reload
    }
    setCanFullscreen(document.fullscreenEnabled);
    if (DEMO) return;
    fetch('/api/config')
      .then((res) => res.json())
      .then((cfg) => setHasServerUrl(!!cfg.hasDefaultUrl))
      .catch(() => {});
  }, []);

  // Events: on month change, on feed change, and every few minutes
  useEffect(() => {
    if (DEMO) {
      setEvents(demoEvents(currentMonth));
      return;
    }
    if (!feedUrl && !hasServerUrl) {
      setEvents([]);
      setFeedError(false);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ date: currentMonth.toISOString() });
    if (feedUrl) params.set('url', feedUrl);
    fetch(`/api/calendar?${params}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.events) throw new Error(data.code ?? 'calendar_fetch_failed');
        if (!cancelled) {
          setEvents(data.events);
          setFeedError(false);
        }
      })
      .catch(() => {
        // keep showing the last events we had
        if (!cancelled) setFeedError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [currentMonth, feedUrl, hasServerUrl, refreshTick]);

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // The drawing for the month being shown
  useEffect(() => {
    let cancelled = false;
    const apply = (raw: string | null) => {
      if (cancelled) return;
      const loaded = parseSheet(raw);
      sheetRef.current = loaded;
      setSheet(loaded);
      setSheetReady(true);
    };
    setSheetReady(false);
    if (DEMO) {
      apply(loadDemoDrawing(currentMonth));
      return;
    }
    const params = new URLSearchParams({ month, legacyMonth: currentMonth.toISOString() });
    if (feedUrl) params.set('url', feedUrl);
    fetch(`/api/drawings?${params}`)
      .then((res) => res.json())
      .then((data) => apply(data.data ?? null))
      .catch(() => apply(null));
    return () => {
      cancelled = true;
    };
    // currentMonth fully determines `month`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, feedUrl]);

  const persist = (forMonth: Date, next: Sheet) => {
    if (DEMO) {
      saveDemoDrawing(forMonth, serializeSheet(next));
      return;
    }
    fetch('/api/drawings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: monthKey(forMonth), data: serializeSheet(next) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('drawing_write_failed');
        setSaveError(false);
      })
      .catch(() => setSaveError(true));
  };

  const commit = (next: Sheet) => {
    sheetRef.current = next;
    setSheet(next);
    persist(currentMonth, next);
  };

  const addStroke = (stroke: Stroke) => {
    const prev = sheetRef.current;
    commit({ ...prev, strokes: [...prev.strokes, stroke] });
  };

  const undo = () => {
    const prev = sheetRef.current;
    if (prev.strokes.length === 0) return;
    commit({ ...prev, strokes: prev.strokes.slice(0, -1) });
  };

  const clear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    commit(emptySheet());
  };

  // A tap on "Clear" only arms it for a few seconds
  useEffect(() => {
    if (!confirmClear) return;
    const id = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(id);
  }, [confirmClear]);

  // Keep "today" right, and move along when the month turns over while it's on screen
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setToday((prev) => {
        if (format(prev, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) return prev;
        setCurrentMonth((shown) => (isSameMonth(shown, prev) ? startOfMonth(now) : shown));
        return now;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Wall use: come back to this month after a while without touches
  const lastTouch = useRef(Date.now());
  useEffect(() => {
    const touch = () => {
      lastTouch.current = Date.now();
    };
    window.addEventListener('pointerdown', touch);
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current > IDLE_MS) {
        setCurrentMonth((shown) => (isSameMonth(shown, new Date()) ? shown : startOfMonth(new Date())));
      }
    }, 30_000);
    return () => {
      window.removeEventListener('pointerdown', touch);
      clearInterval(id);
    };
  }, []);

  // Keep the screen on while the calendar is open
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    };
    const onVisible = () => document.visibilityState === 'visible' && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const saveFeed = (url: string) => {
    setFeedUrl(url);
    try {
      if (url) localStorage.setItem(URL_KEY, url);
      else localStorage.removeItem(URL_KEY);
    } catch {
      // storage blocked: the feed is used until the page reloads
    }
    setSettingsOpen(false);
  };

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-white text-black">
      <header className="z-20 flex flex-wrap items-center gap-2 border-b border-black bg-white px-3 py-2">
        <button className="tool-button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month">
          <ChevronLeftIcon />
        </button>
        <h1 className="min-w-44 text-center text-2xl font-bold tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h1>
        <button className="tool-button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month">
          <ChevronRightIcon />
        </button>
        <button
          className="tool-button px-4"
          onClick={() => setCurrentMonth(startOfMonth(today))}
          disabled={onCurrentMonth}
        >
          Today
        </button>

        <div className="ml-auto flex items-center gap-2">
          {(feedError || saveError) && (
            <button
              className="px-2 text-sm underline"
              onClick={() => {
                setRefreshTick((t) => t + 1);
                if (saveError) persist(currentMonth, sheetRef.current);
              }}
            >
              {saveError ? 'Drawing not saved – retry' : 'Calendar offline – retry'}
            </button>
          )}
          <button
            className={`tool-button ${tool === 'pen' ? 'tool-button-active' : ''}`}
            onClick={() => setTool('pen')}
            aria-label="Pen"
            aria-pressed={tool === 'pen'}
          >
            <PenIcon />
          </button>
          <button
            className={`tool-button ${tool === 'eraser' ? 'tool-button-active' : ''}`}
            onClick={() => setTool('eraser')}
            aria-label="Eraser"
            aria-pressed={tool === 'eraser'}
          >
            <EraserIcon />
          </button>
          <button className="tool-button" onClick={undo} disabled={sheet.strokes.length === 0} aria-label="Undo">
            <UndoIcon />
          </button>
          <button
            className={`tool-button ${confirmClear ? 'tool-button-active px-4' : ''}`}
            onClick={clear}
            disabled={isBlank(sheet)}
            aria-label={confirmClear ? 'Tap again to clear this month' : 'Clear this month'}
          >
            {confirmClear ? 'Clear?' : <TrashIcon />}
          </button>
          {canFullscreen && (
            <button className="tool-button" onClick={toggleFullscreen} aria-label="Fullscreen">
              <ExpandIcon />
            </button>
          )}
          {!DEMO && (
            <button className="tool-button" onClick={() => setSettingsOpen(true)} aria-label="Calendar feed settings">
              <GearIcon />
            </button>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <CalendarView
          viewStart={viewStart}
          viewEnd={viewEnd}
          events={hasFeed ? events : []}
          currentMonth={currentMonth}
          today={today}
        />
        <DrawingLayer sheet={sheet} tool={tool} disabled={!sheetReady} onStroke={addStroke} />
        {settingsOpen && (
          <SettingsDialog
            url={feedUrl}
            hasServerUrl={hasServerUrl}
            onSave={saveFeed}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
