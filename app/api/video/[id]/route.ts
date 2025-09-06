import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { NextResponse } from "next/server";

// ✅ GET single video
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const video = await Video.findById(id).populate(
      "comments.userId",
      "name email"
    );

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    return NextResponse.json(video);
  } catch (err) {
    console.error("GET /api/video/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// ✅ PATCH update video
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await req.json();

    const updated = await Video.findByIdAndUpdate(id, data, { new: true });

    if (!updated) {
      return new NextResponse("Video not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/video/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

// ✅ DELETE video
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Video.findByIdAndDelete(id);

    if (!deleted) {
      return new NextResponse("Video not found", { status: 404 });
    }

    return new NextResponse("Video deleted", { status: 204 });
  } catch (err) {
    console.error("DELETE /api/video/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
