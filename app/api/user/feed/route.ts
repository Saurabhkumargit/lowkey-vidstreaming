// app/api/user/feed/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id).lean<
      { following?: mongoose.Types.ObjectId[] } | null
    >();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followingIds = (user?.following || []).map(
      (id: mongoose.Types.ObjectId) => id.toString()
    );

    const videos = await Video.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    return NextResponse.json(videos);
  } catch (err) {
    console.error("Feed fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
