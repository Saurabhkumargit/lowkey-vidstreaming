// app/video/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  if (loading) return <p className="p-4">Loading...</p>;
  if (!video) return <p className="p-4">Video not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Video player */}
      <video
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        controls
        className="w-full rounded-lg shadow"
        onPlay={recordView} // ✅ triggers when playback starts
      />

      {/* Title + Description */}
      <div>
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <p className="text-gray-600">{video.description}</p>
        <p className="text-sm text-gray-500 mt-1">👁 {video.views ?? 0} views</p>
      </div>

      {/* Likes */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLike}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ❤️ Like ({video.likes?.length ?? 0})
        </button>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Comments</h2>
        <form onSubmit={addComment} className="flex gap-2 mb-4">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Add a comment..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Post
          </button>
        </form>

        {(video.comments?.length || 0) === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {video.comments.map((c) => (
              <li key={c._id} className="p-2 border rounded">
                <p className="text-sm">{c.text}</p>
                <p className="text-xs text-gray-500">
                  by {c.userId?.name || c.userId?.email} on{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
