import { NextResponse } from 'next/server';
import { getDrawing, saveDrawing } from '@/lib/db';
import { v5 as uuidv5 } from 'uuid';

// Use a constant namespace for UUID v5
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Drawings belong to this installation, not to a calendar feed, so changing the feed keeps them.
const LOCAL = 'local';

function getUrlHash(url: string) {
    return uuidv5(url, NAMESPACE);
}

// `month` is `yyyy-MM`. Drawings saved before that key (an ISO timestamp, filed under the
// feed URL's hash) are still found through `legacyMonth` + `url`.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const legacyMonth = searchParams.get('legacyMonth');
    const url = searchParams.get('url');

    if (!month) {
        return NextResponse.json({ error: 'Missing month parameter', code: 'missing_month' }, { status: 400 });
    }

    try {
        const urlHash = url ? getUrlHash(url) : null;
        const drawing =
            getDrawing(month, LOCAL) ??
            (urlHash ? getDrawing(month, urlHash) : undefined) ??
            (urlHash && legacyMonth ? getDrawing(legacyMonth, urlHash) : undefined);
        return NextResponse.json({ data: drawing ? drawing.data_json : null });
    } catch (error) {
        console.error('Error fetching drawing:', error);
        return NextResponse.json({ error: 'Failed to fetch drawing', code: 'drawing_read_failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { month, data } = await request.json();

        if (!month || !data) {
            return NextResponse.json({ error: 'Missing month or data', code: 'missing_fields' }, { status: 400 });
        }

        saveDrawing(month, LOCAL, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving drawing:', error);
        return NextResponse.json({ error: 'Failed to save drawing', code: 'drawing_write_failed' }, { status: 500 });
    }
}
