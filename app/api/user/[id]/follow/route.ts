// app/api/user/[id]/follow/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const targetUserId = new mongoose.Types.ObjectId(params.id);

    if (currentUserId.equals(targetUserId)) {
      return NextResponse.json(
        { error: "You can’t follow yourself" },
        { status: 400 }
      );
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following.some((id: any) =>
      id.equals(targetUserId)
    );

    if (isFollowing) {
      // ✅ Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // ✅ Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({
      success: true,
      following: !isFollowing,
    });
  } catch (err) {
    console.error("Follow error:", err);
    return NextResponse.json(
      { error: "Failed to follow/unfollow" },
      { status: 500 }
    );
  }
}
