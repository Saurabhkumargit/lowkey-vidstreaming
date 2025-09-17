// app/video/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/components/Layout";

interface Comment {
  _id: string;
  text: string;
  userId: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  views?: number; // ✅ include views
}

export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/video/${id}`);
        if (!res.ok) throw new Error("Failed to fetch video");
        const data = await res.json();
        setVideo({
          ...data,
          likes: Array.isArray((data as any).likes) ? (data as any).likes : [],
          comments: Array.isArray((data as any).comments)
            ? (data as any).comments
            : [],
          views: (data as any).views ?? 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  // ✅ Record a view when video starts playing
  async function recordView() {
    try {
      const res = await fetch(`/api/video/${id}/view`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setVideo((prev) =>
          prev ? { ...prev, views: data.views ?? prev.views } : prev
        );
      }
    } catch (err) {
      console.error("View recording failed", err);
    }
  }

  async function toggleLike() {
    if (!video) return;
    try {
      const res = await fetch(`/api/video/${video._id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        let nextLikes: string[] = [];
        if (Array.isArray((data as any).likes)) {
          nextLikes = (data as any).likes as string[];
        } else if (typeof (data as any).likesCount === "number") {
          nextLikes = new Array((data as any).likesCount).fill("");
        } else if (typeof (data as any).isLiked === "boolean") {
          const delta = (data as any).isLiked ? 1 : -1;
          const count = Math.max(0, (video.likes?.length || 0) + delta);
          nextLikes = new Array(count).fill("");
        } else {
          nextLikes = video.likes || [];
        }
        setVideo({ ...video, likes: nextLikes });
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!video || !commentText.trim()) return;
    try {
      const res = await fetch(`/api/video/${video._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const data = await res.json();
        setVideo({ ...video, comments: data });
        setCommentText("");
      }
    } catch (err) {
      console.error("Comment failed", err);
    }
  }

  if (loading) return <p className="p-4 text-white/60">Loading...</p>;
  if (!video) return <p className="p-4 text-red-400">Video not found.</p>;

  return (
    <Layout>
      <div className="max-w-3xl py-6 space-y-4">
        {/* Video player placeholder (16:9) */}
        <div className="w-full aspect-video rounded-xl bg-black ring-1 ring-white/10 shadow overflow-hidden">
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            controls
            className="h-full w-full object-cover"
            onPlay={recordView}
          />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white/95">{video.title}</h1>
          <p className="text-sm text-white/50 mt-1">👁 {video.views ?? 0} views</p>
        </div>

        {/* Channel row + actions */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/10" />
          <div className="mr-auto">
            <p className="text-sm font-medium text-white/90">Channel Name</p>
            <p className="text-xs text-white/50">1.2M subscribers</p>
          </div>
          <button className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition">Subscribe</button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/15 transition"
            >
              👍 {video.likes?.length ?? 0}
            </button>
            <button className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/15 transition">👎</button>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
          <p className="text-white/80">{video.description}</p>
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-white/90">Comments</h2>
          <form onSubmit={addComment} className="flex gap-2 mb-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
            >
              Post
            </button>
          </form>

          {(video.comments?.length || 0) === 0 ? (
            <p className="text-white/60">No comments yet.</p>
          ) : (
            <ul className="space-y-2">
              {video.comments.map((c) => (
                <li key={c._id} className="p-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                  <p className="text-sm text-white/90">{c.text}</p>
                  <p className="text-xs text-white/50">
                    by {c.userId?.name || c.userId?.email} on{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
