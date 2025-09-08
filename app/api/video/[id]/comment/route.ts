// app/api/video/[id]/comment/route.ts
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
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

    const { text } = await req.json();
    if (!text)
      return NextResponse.json(
        { error: "Comment text required" },
        { status: 400 }
      );

    const { id } = await params;
    const video = await Video.findById(id);
    if (!video)
      return NextResponse.json({ error: "Video not found" }, { status: 404 });

    video.comments.push({
      userId: session.user.id,
      text,
      createdAt: new Date(),
    });

    await video.save();
    return NextResponse.json(video.comments);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
