// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [uploaded, setUploaded] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setError("unauthorized");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/videos");
        if (!res.ok) throw new Error("Failed to fetch profile data");

        const data = await res.json();
        setUploaded(data.uploaded);
        setLiked(data.liked);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (loading || status === "loading")
    return <p className="p-4">Loading profile...</p>;
  if (error === "unauthorized") {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">You must sign in to view your profile.</p>
        <a
          href="/api/auth/signin"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In
        </a>
      </div>
    );
  }
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-4">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-16 h-16 rounded-full border"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
          <p className="text-gray-600">{session?.user?.email}</p>
        </div>
      </div>

      {/* Uploaded Videos */}
      <div>
        <h2 className="text-xl font-semibold mb-2">📹 My Videos</h2>
        {uploaded.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploaded.map((v) => (
              <div key={v._id} className="border rounded p-2">
                <video
                  src={v.videoUrl}
                  poster={v.thumbnailUrl}
                  controls
                  className="w-full rounded"
                />
                <h3 className="font-medium mt-2">{v.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liked Videos */}
      <div>
        <h2 className="text-xl font-semibold mb-2">❤️ Liked Videos</h2>
        {liked.length === 0 ? (
          <p>No liked videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liked.map((v) => (
              <div key={v._id} className="border rounded p-2">
                <video
                  src={v.videoUrl}
                  poster={v.thumbnailUrl}
                  controls
                  className="w-full rounded"
                />
                <h3 className="font-medium mt-2">{v.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
