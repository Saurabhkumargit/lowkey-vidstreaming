import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const headers: Record<string, string | null> = {};
    // req.headers is an instance of Headers. Use its iterator.
    for (const [k, v] of req.headers) {
      headers[k] = v ?? null;
    }
    return NextResponse.json({ cookie: req.headers.get('cookie'), headers });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
