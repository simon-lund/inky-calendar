import { NextResponse } from 'next/server';

// Lets the page know whether the server already has a feed (ICAL_URL) without revealing it.
export async function GET() {
    return NextResponse.json({ hasDefaultUrl: !!process.env.ICAL_URL });
}
