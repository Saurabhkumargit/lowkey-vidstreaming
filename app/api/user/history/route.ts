// app/api/user/history/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

interface PopulatedHistory {
  videoId: {
    _id: string;
    title: string;
    thumbnailUrl: string;
  };
  watchedAt: Date;
}

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .populate("history.videoId")
      .lean<{ history?: PopulatedHistory[] } | null>();

    const history = (user?.history || [])
      .filter((h) => h.videoId) // ✅ skip missing videos
      .sort(
        (a, b) =>
          new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
      )
      .slice(0, 10);

    return NextResponse.json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
