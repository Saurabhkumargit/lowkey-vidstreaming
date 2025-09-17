"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/video/${video._id}`}
      className="group overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition shadow-sm hover:shadow-[0px_20px_207px_10px_rgba(165,39,255,0.48)]"
    >
      <div className="relative aspect-video w-full bg-black">
        {/* Use video poster if available; show as muted preview on hover */}
        <video
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-white/90 group-hover:text-white">
          {video.title}
        </h3>
        <p className="line-clamp-2 text-xs text-white/60">
          {video.description}
        </p>
        {video.createdAt && (
          <p className="text-[11px] text-white/40">
            {new Date(video.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}


interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
}

export default function VideoGallery({
  source = "all",
}: {
  source?: "all" | "feed";
}) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const endpoint = source === "feed" ? "/api/user/feed" : "/api/video";
        const res = await fetch(endpoint);
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
  }, [source]);

  if (loading) return <p className="text-white/60">Loading videos...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {videos.length === 0 ? (
        <p className="col-span-full text-center text-white/50">
          No videos available.
        </p>
      ) : (
        videos.map((video) => <VideoCard key={video._id} video={video} />)
      )}
    </div>
  );
}
