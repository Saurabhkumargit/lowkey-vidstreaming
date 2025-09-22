import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoIdParam } = await params;
    const videoObjectId = new mongoose.Types.ObjectId(videoIdParam);
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    const video = await Video.findById(videoObjectId).select("_id likes");
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const alreadyLiked = (video.likes as mongoose.Types.ObjectId[]).some(
      (likeUserId) => likeUserId.equals(userObjectId)
    );

    const isLiked = !alreadyLiked;

    if (alreadyLiked) {
      await Promise.all([
        Video.updateOne(
          { _id: videoObjectId },
          { $pull: { likes: userObjectId } },
          { timestamps: false }
        ),
        User.findByIdAndUpdate(userObjectId, { $pull: { liked: videoObjectId } }),
      ]);
    } else {
      await Promise.all([
        Video.updateOne(
          { _id: videoObjectId },
          { $addToSet: { likes: userObjectId } },
          { timestamps: false }
        ),
        User.findByIdAndUpdate(userObjectId, { $addToSet: { liked: videoObjectId } }),
      ]);
    }

    const updated = await Video.findById(videoObjectId).select("likes").lean<{ likes?: unknown[] } | null>();
    const likesCount = Array.isArray(updated?.likes) ? updated!.likes!.length : 0;

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
    });
  } catch (err) {
    console.error("LIKE error:", err);
    return NextResponse.json(
      { error: "Failed to like/unlike video" },
      { status: 500 }
    );
  }
}
