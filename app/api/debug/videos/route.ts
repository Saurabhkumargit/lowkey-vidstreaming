import { connectToDatabase } from '@/lib/db';
import Video from '@/models/Video';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const count = await Video.countDocuments();
    const sample = await Video.findOne().lean();
    return NextResponse.json({ count, sample });
  } catch (err) {
    console.error('GET /api/debug/videos error:', err);
    return NextResponse.json({ error: 'Failed to query videos' }, { status: 500 });
  }
}
