// app/api/video/[id]/comment/route.ts
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
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

    const { text } = await req.json();
    if (!text)
      return NextResponse.json(
        { error: "Comment text required" },
        { status: 400 }
      );

    const { id } = await params;
    const videoObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    const updated = await Video.findOneAndUpdate(
      { _id: videoObjectId },
      {
        $push: {
          comments: { userId: userObjectId, text, createdAt: new Date() },
        },
      },
      { new: true, upsert: false }
    )
      .select("comments")
      .populate("comments.userId", "name email")
      .lean<{ comments?: unknown[] } | null>();

    if (!updated) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(updated.comments || []);
  } catch {
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
