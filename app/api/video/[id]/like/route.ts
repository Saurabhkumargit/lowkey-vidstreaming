import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

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

    const { id: videoId } = await params;
    const userId = session.user.id;

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    let isLiked = false;

    if (video.likes.some((id: any) => id.toString() === userId)) {
      // 🔹 Unlike video
      video.likes = video.likes.filter((id: any) => id.toString() !== userId);

      await User.findByIdAndUpdate(userId, {
        $pull: { liked: videoId },
      });
    } else {
      // 🔹 Like video
      video.likes.push(userId);

      await User.findByIdAndUpdate(userId, {
        $addToSet: { liked: videoId }, // avoid duplicates
      });
      isLiked = true;
    }

    await video.save();

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: video.likes.length,
    });
  } catch (err) {
    console.error("LIKE error:", err);
    return NextResponse.json(
      { error: "Failed to like/unlike video" },
      { status: 500 }
    );
  }
}
