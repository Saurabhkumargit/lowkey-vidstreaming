"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VideosPage() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "recent";

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const res = await fetch(`/api/video?q=${query}&filter=${filter}`);
        const data = await res.json();
        setVideos(data || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [query, filter]);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Results for "${query}"` : "All Videos"}
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded shadow p-4">
              <video
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                controls
                className="w-full rounded mb-2"
              />
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-gray-600">{video.description}</p>
              <p className="text-xs text-gray-400">
                Uploaded by {video.userId?.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
