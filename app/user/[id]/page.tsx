// app/user/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
          setIsFollowing(
            data.user.followers.some((f: any) => f._id === session.user.id)
          );
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
                      _id: session?.user?.id!,
                      name: session?.user?.name!,
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

  if (loading) return <p className="p-4">Loading profile...</p>;
  if (!user) return <p className="p-4 text-red-500">User not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Info */}
      <div className="flex items-center space-x-4">
        <Image
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-600">
            {user.followers.length} follower{user.followers.length !== 1 && "s"}
          </p>
        </div>
        {session?.user?.id !== user._id && (
          <button
            onClick={toggleFollow}
            className={`ml-auto px-4 py-2 rounded ${
              isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Followers List (only visible to self) */}
      {session?.user?.id === user._id && (
        <div>
          <h2 className="text-lg font-semibold mb-2">👥 My Followers</h2>
          {user.followers.length === 0 ? (
            <p className="text-gray-500">No followers yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {user.followers.map((follower) => (
                <Link
                  href={`/user/${follower._id}`}
                  key={follower._id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                >
                  <Image
                    src={follower.avatar || "/default-avatar.png"}
                    alt={follower.name}
                    width={40}
                    height={40}
                    className="rounded-full"
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
        <h2 className="text-lg font-semibold mb-2">📹 Uploaded Videos</h2>
        {videos.length === 0 ? (
          <p className="text-gray-500">No videos uploaded.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Link
                href={`/video/${video._id}`}
                key={video._id}
                className="border rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h2 className="text-lg font-semibold line-clamp-1">
                  {video.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {video.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
