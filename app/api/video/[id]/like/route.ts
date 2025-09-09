import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
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

    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const userId = session.user.id;

    if (video.likes.some((id: any) => id.toString() === userId)) {
      // Unlike
      video.likes = video.likes.filter((id: any) => id.toString() !== userId);
    } else {
      // Like
      video.likes.push(userId);
    }

    await video.save();

    return NextResponse.json({ likes: video.likes });
  } catch (err) {
    console.error("LIKE error:", err);
    return NextResponse.json(
      { error: "Failed to like/unlike video" },
      { status: 500 }
    );
  }
}
