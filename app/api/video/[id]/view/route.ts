// app/api/video/[id]/view/route.ts
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    const { id } = await context.params;
    const videoId = new mongoose.Types.ObjectId(id);

    // increment view count
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // save to user history
    if (session?.user?.id) {
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { history: { videoId } }, // remove old occurrence
      });

      await User.findByIdAndUpdate(session.user.id, {
        $push: {
          history: {
            $each: [{ videoId, watchedAt: new Date() }],
            $sort: { watchedAt: -1 },
            $slice: 10,
          },
        },
      });
    }

    return NextResponse.json({ views: video.views });
  } catch (err) {
    console.error("VIEW error:", err);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
