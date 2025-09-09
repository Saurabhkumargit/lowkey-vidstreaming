"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/video");
        if (!res.ok) throw new Error("Failed to fetch videos");

        const data = await res.json();
        setVideos(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <p className="text-gray-600">Loading videos...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">
          No videos available.
        </p>
      ) : (
        videos.map((video) => (
          <Link
            href={`/video/${video._id}`}
            key={video._id}
            className="border rounded-lg shadow-sm p-4 hover:shadow-md transition"
          >
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              controls
              className="w-full h-48 object-cover rounded mb-3"
            />
            <h2 className="text-lg font-semibold line-clamp-1">
              {video.title}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-2">
              {video.description}
            </p>
            {video.createdAt && (
              <p className="text-xs text-gray-400 mt-2">
                Uploaded {new Date(video.createdAt).toLocaleDateString()}
              </p>
            )}
          </Link>
        ))
      )}
    </div>
  );
}
