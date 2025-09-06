"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: string[];
  comments: {
    _id: string;
    text: string;
    createdAt: string;
    userId: { name?: string };
  }[];
}

export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/video/${id}`);
        if (!res.ok) throw new Error("Failed to fetch video");
        const data = await res.json();
        setVideo(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!video) return <p>No video found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
      <video
        src={video.videoUrl}
        controls
        poster={video.thumbnailUrl}
        className="w-full rounded-lg shadow mb-4"
      />
      <p className="mb-4">{video.description}</p>

      <div className="mb-4">
        <span className="font-semibold">{video.likes?.length || 0}</span> likes
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {video.comments.length === 0 ? (
          <p className="text-gray-500">No comments yet</p>
        ) : (
          <ul className="space-y-2">
            {video.comments.map((comment) => (
              <li key={comment._id} className="p-2 border rounded">
                <p className="font-semibold">
                  {comment.userId?.name || "Anonymous"}
                </p>
                <p>{comment.text}</p>
                <small className="text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
