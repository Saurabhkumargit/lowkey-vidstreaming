import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userObjectId: mongoose.Types.ObjectId | null = null;
    if (session.user.id && mongoose.isValidObjectId(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const found = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean<{ _id: mongoose.Types.ObjectId } | null>();
      if (found?._id) userObjectId = new mongoose.Types.ObjectId(found._id);
    }

    if (!userObjectId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user with followers and videos
    const user = await User.findById(userObjectId)
      .populate('followers', 'name avatar')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's uploaded videos
    const Video = (await import("@/models/Video")).default;
    const videos = await Video.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      uploaded: videos,
      liked: [], // You can implement liked videos later
      followers: user.followers || [],
    });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function saveFileFromBlob(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userObjectId: mongoose.Types.ObjectId | null = null;
    if (session.user.id && mongoose.isValidObjectId(session.user.id)) {
      userObjectId = new mongoose.Types.ObjectId(session.user.id);
    } else if (session.user.email) {
      const found = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean<{ _id: mongoose.Types.ObjectId } | null>();
      if (found?._id) userObjectId = new mongoose.Types.ObjectId(found._id);
    }

    if (!userObjectId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const name = (form.get("name") as string) || null;
    const email = (form.get("email") as string) || null;
    const password = (form.get("password") as string) || null;
    const avatar = form.get("avatar");

    const updateData: Record<string, unknown> = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (email && email.trim()) updateData.email = email.trim();
    if (password && password.trim()) {
      // Optionally hash here if you support password change; skipping to avoid unintended overwrite
    }

    if (avatar && avatar instanceof File) {
      const avatarUrl = await saveFileFromBlob(avatar);
      updateData.avatar = avatarUrl;
    } else if (typeof avatar === "string" && avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userObjectId,
      { $set: updateData },
      { new: true }
    ).lean<{ name?: string; email: string; avatar?: string } | null>();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: updatedUser?.name,
      email: updatedUser!.email,
      avatar: (updatedUser as any)?.avatar || "",
    });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
