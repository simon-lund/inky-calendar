"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Sheet, Stroke, Tool, WIDTH } from '@/lib/strokes';

interface DrawingLayerProps {
    sheet: Sheet;
    tool: Tool;
    /** Ignore input, e.g. while the month's drawing is still loading. */
    disabled?: boolean;
    onStroke: (stroke: Stroke) => void;
}

function paintSegment(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    from: [number, number],
    to: [number, number],
    w: number,
    h: number,
) {
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.5, stroke.w * Math.min(w, h));
    ctx.beginPath();
    ctx.moveTo(from[0] * w, from[1] * h);
    ctx.lineTo(to[0] * w, to[1] * h);
    ctx.stroke();
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, w: number, h: number) {
    const { pts } = stroke;
    if (pts.length === 0) return;
    if (pts.length === 1) {
        paintSegment(ctx, stroke, pts[0], pts[0], w, h);
        return;
    }
    for (let i = 1; i < pts.length; i++) paintSegment(ctx, stroke, pts[i - 1], pts[i], w, h);
}

/** Transparent canvas over the calendar grid. Fills its (relatively positioned) parent. */
const DrawingLayer: React.FC<DrawingLayerProps> = ({ sheet, tool, disabled, onStroke }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 });
    const [loadedBg, setLoadedBg] = useState<{ src: string; img: HTMLImageElement } | null>(null);
    const bgImage = sheet.bg && loadedBg?.src === sheet.bg ? loadedBg.img : null;
    const live = useRef<{ id: number; stroke: Stroke } | null>(null);

    // Follow the parent's size (window resize, rotation, header wrapping).
    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;
        if (!parent) return;
        const measure = () => {
            const rect = parent.getBoundingClientRect();
            setSize({ w: rect.width, h: rect.height, dpr: window.devicePixelRatio || 1 });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(parent);
        return () => observer.disconnect();
    }, []);

    // Older drawings are a PNG backdrop.
    useEffect(() => {
        const src = sheet.bg;
        if (!src) return;
        let cancelled = false;
        const img = new Image();
        img.onload = () => {
            if (!cancelled) setLoadedBg({ src, img });
        };
        img.src = src;
        return () => {
            cancelled = true;
        };
    }, [sheet.bg]);

    // Repaint everything whenever the strokes, backdrop or size change.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || size.w === 0) return;
        const pw = Math.round(size.w * size.dpr);
        const ph = Math.round(size.h * size.dpr);
        if (canvas.width !== pw) canvas.width = pw;
        if (canvas.height !== ph) canvas.height = ph;
        ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
        ctx.clearRect(0, 0, size.w, size.h);
        if (bgImage && sheet.bg) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(bgImage, 0, 0, size.w, size.h);
        }
        for (const stroke of sheet.strokes) paintStroke(ctx, stroke, size.w, size.h);
        ctx.globalCompositeOperation = 'source-over';
    }, [sheet, bgImage, size]);

    const norm = (e: { clientX: number; clientY: number }): [number, number] => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const round = (n: number) => Math.round(n * 10000) / 10000;
        return [round((e.clientX - rect.left) / rect.width), round((e.clientY - rect.top) / rect.height)];
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled || live.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const stroke: Stroke = { tool, w: WIDTH[tool], pts: [norm(e)] };
        live.current = { id: e.pointerId, stroke };
        paintStroke(ctx, stroke, size.w, size.h);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const current = live.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!current || current.id !== e.pointerId || !ctx) return;
        const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
        for (const ev of events.length ? events : [e.nativeEvent]) {
            const from = current.stroke.pts[current.stroke.pts.length - 1];
            const to = norm(ev);
            if (from[0] === to[0] && from[1] === to[1]) continue;
            current.stroke.pts.push(to);
            paintSegment(ctx, current.stroke, from, to, size.w, size.h);
        }
    };

    const finish = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const current = live.current;
        if (!current || current.id !== e.pointerId) return;
        live.current = null;
        onStroke(current.stroke);
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none select-none"
            style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finish}
            onPointerCancel={finish}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};

export default DrawingLayer;
