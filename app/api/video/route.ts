import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// ✅ GET all videos (with search & filter)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || ""; // search text
    const filter = searchParams.get("filter") || "recent"; // "recent" | "liked"

    type MongoQuery = Record<string, unknown>;

    let mongoQuery: MongoQuery = {};
    if (query) {
      mongoQuery = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };
    }

    // Use a concrete sort type compatible with Mongoose
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (filter === "liked") {
      sort = { likes: -1 };
    }

    // Ensure User model is available for populate
    if (!(mongoose.models && mongoose.models.User)) {
      await import('@/models/User');
    }

    const videos = await Video.find(mongoQuery)
      .sort(sort)
      .populate("userId", "name email") // uploader info
      .populate("comments.userId", "name email") // comments enriched
      .lean();

    const count = (videos ?? []).length;
    console.info(`GET /api/video -> found ${count} videos (filter=${filter}, q="${query}")`);

    return NextResponse.json(videos ?? [], {
      status: 200,
      headers: { "X-Total-Count": String(count) },
    });
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

    // Link video to user’s uploaded list
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
