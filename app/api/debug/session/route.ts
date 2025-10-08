import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({ hasSession: !!session, session: session ?? null });
  } catch (err) {
    console.error('GET /api/debug/session error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
