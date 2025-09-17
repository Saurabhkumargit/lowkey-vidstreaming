"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";

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
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <Sidebar />
          <main className="flex-1 py-6">
            <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-white/90">
              {query ? `Results for "${query}"` : "All Videos"}
            </h1>
            {loading ? (
              <p className="text-white/60">Loading...</p>
            ) : videos.length === 0 ? (
              <p className="text-white/60">No videos found.</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {videos.map((video) => (
                  <div key={video._id} className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      controls
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-3">
                      <h2 className="text-sm font-semibold text-white/90 line-clamp-2">{video.title}</h2>
                      <p className="text-xs text-white/60 line-clamp-2">{video.description}</p>
                      <p className="text-[11px] text-white/40 mt-1">Uploaded by {video.userId?.name || "Unknown"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
