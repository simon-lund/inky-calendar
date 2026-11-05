import { NextResponse } from 'next/server';

// Lets the page know whether the server already has a feed (INKY_ICAL_URL) without revealing it.
export async function GET() {
    return NextResponse.json({ hasDefaultUrl: !!process.env.INKY_ICAL_URL });
}
