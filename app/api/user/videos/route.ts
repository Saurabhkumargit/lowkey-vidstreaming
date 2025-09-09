import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if(!session?.user?.id) {
            return NextResponse.json({ error: "unauthorized"}, {status: 401});
        }

        await connectToDatabase();

        const uploaded = await Video.find({userId: session.user.id}).lean();

        const liked = await Video.find({likes: session.user.id}).lean();

        return NextResponse.json({uploaded, liked});
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch user videos"},
            { status: 500}
        );
    }
}