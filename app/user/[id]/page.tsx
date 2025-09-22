// app/user/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/components/Layout";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  followers: { _id: string; name: string; avatar?: string }[];
  following: string[];
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
        setVideos(data.videos);

        if (session?.user?.id) {
          const followers = data.user.followers as Array<{ _id: string }>;
          setIsFollowing(followers.some((f) => f._id === session.user.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, session]);

  const toggleFollow = async () => {
    try {
      const res = await fetch(`/api/user/${id}/follow`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to follow/unfollow");
      const data = await res.json();
      setIsFollowing(data.following);

      // Optimistically update followers count
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers: data.following
                ? [
                    ...prev.followers,
                    {
                      _id: session?.user?.id || "",
                      name: session?.user?.name || "",
                      avatar: session?.user?.image || undefined,
                    },
                  ]
                : prev.followers.filter((f) => f._id !== session?.user?.id),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4 text-white/60">Loading profile...</p>;
  if (!user) return <p className="p-4 text-red-400">User not found</p>;

  return (
    <Layout>
      <div className="max-w-5xl py-6 space-y-6">
        {/* Banner */}
        <div className="h-40 sm:h-56 w-full rounded-xl bg-[#181818] ring-1 ring-white/10" />

        {/* Profile Info */}
        <div className="flex items-center gap-4 -mt-8 px-2">
        <Image
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          width={80}
          height={80}
          className="rounded-full ring-1 ring-white/10"
        />
        <div>
          <h1 className="text-2xl font-bold text-white/95">{user.name}</h1>
          <p className="text-white/60">{user.email}</p>
          <p className="text-sm text-white/50">
            {user.followers.length} follower{user.followers.length !== 1 && "s"}
          </p>
        </div>
        {session?.user?.id !== user._id && (
          <button
            onClick={toggleFollow}
            className={`ml-auto px-4 py-2 rounded-full transition ${
              isFollowing ? "bg-white/10 text-white" : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {isFollowing ? "UnFollow" : "Follow"}
          </button>
        )}
        </div>

      {/* Followers List (only visible to self) */}
      {session?.user?.id === user._id && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-white/90">👥 My Followers</h2>
          {user.followers.length === 0 ? (
            <p className="text-white/60">No followers yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.followers.map((follower) => (
                <Link
                  href={`/user/${follower._id}`}
                  key={follower._id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  <Image
                    src={follower.avatar || "/default-avatar.png"}
                    alt={follower.name}
                    width={40}
                    height={40}
                    className="rounded-full ring-1 ring-white/10"
                  />
                  <span>{follower.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Uploaded Videos */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-white/90">Videos</h2>
        {videos.length === 0 ? (
          <p className="text-white/60">No videos uploaded.</p>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {videos.map((video) => (
              <Link
                href={`/video/${video._id}`}
                key={video._id}
                className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition"
              >
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  className="w-full aspect-video object-cover"
                />
                <h2 className="text-sm font-semibold text-white/90 line-clamp-2 px-3 mt-2">
                  {video.title}
                </h2>
                <p className="text-white/60 text-xs line-clamp-2 px-3 pb-3">
                  {video.description}
                </p>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
