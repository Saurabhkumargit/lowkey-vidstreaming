import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const raw = process.env.MONGODB_URI as string | undefined;
    const present = !!raw;
    const masked = raw ? `${raw.slice(0, 20)}...${raw.slice(-10)}` : null;
    return NextResponse.json({ present, masked, nodeEnv: process.env.NODE_ENV || 'undefined' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
