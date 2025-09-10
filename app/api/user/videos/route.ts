import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let userObjectId: mongoose.Types.ObjectId | null = null;

    if (mongoose.isValidObjectId(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const userDoc = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean<{ _id: mongoose.Types.ObjectId } | null>();
      if (userDoc && userDoc._id) {
        userObjectId = new mongoose.Types.ObjectId(userDoc._id);
      }
    }

    if (!userObjectId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const uploaded = await Video.find({ userId: userObjectId }).lean();
    const liked = await Video.find({ likes: userObjectId }).lean();

    return NextResponse.json({ uploaded, liked });
  } catch (err) {
    console.error("GET /api/user/videos error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user videos" },
      { status: 500 }
    );
  }
}
