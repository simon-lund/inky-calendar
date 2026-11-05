// A month's drawing is stored as vector strokes in 0-1 coordinates, so it survives resizing,
// rotating the tablet and opening on another screen. Drawings from before this format were
// PNG data URLs; those are kept as a backdrop (`bg`) under the new strokes.

export type Tool = 'pen' | 'eraser';

export interface Stroke {
    tool: Tool;
    /** Line width as a fraction of the canvas's shorter side. */
    w: number;
    /** Points as fractions of canvas width / height. */
    pts: [number, number][];
}

export interface Sheet {
    v: 2;
    bg?: string;
    strokes: Stroke[];
}

export const emptySheet = (): Sheet => ({ v: 2, strokes: [] });

export const isBlank = (s: Sheet) => !s.bg && s.strokes.length === 0;

export function parseSheet(raw: string | null | undefined): Sheet {
    if (!raw) return emptySheet();
    if (raw.startsWith('data:image')) return { v: 2, bg: raw, strokes: [] };
    try {
        const parsed = JSON.parse(raw);
        if (parsed?.v === 2 && Array.isArray(parsed.strokes)) return parsed as Sheet;
    } catch {
        // unreadable: start over with a clean sheet
    }
    return emptySheet();
}

export const serializeSheet = (s: Sheet) => JSON.stringify(s);

export const WIDTH: Record<Tool, number> = { pen: 0.0035, eraser: 0.035 };
