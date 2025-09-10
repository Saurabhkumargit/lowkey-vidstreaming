import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

// ✅ GET all videos
export async function GET() {
  try {
    await connectToDatabase();

    const videos = await Video.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email") // show uploader info
      .populate("comments.userId", "name email") // enrich comments
      .lean();

    return NextResponse.json(videos ?? []);
  } catch (error) {
    console.error("GET /api/video error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// ✅ POST a new video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body: IVideo = await request.json();
    const { title, description, videoUrl, thumbnailUrl } = body;

    // Basic validation
    if (!title || !description || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Ensure MongoDB ObjectId format
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const videoData = {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      controls: body.controls ?? true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: body.transformation?.quality ?? 80, // sensible default
      },
      userId,
    };

    const newVideo = await Video.create(videoData);

    await User.findByIdAndUpdate(userId, { $push: { uploaded: newVideo._id } });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("POST /api/video error:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
