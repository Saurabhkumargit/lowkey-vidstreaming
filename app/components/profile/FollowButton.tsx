"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
}

export default function FollowButton({ targetUserId, isFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const previous = following;
    setFollowing(!previous);

    try {
      const response = await fetch(`/api/user/${targetUserId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Not authenticated -> send to login and rollback state
        setFollowing(previous);
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setFollowing(data.following);
    } catch (error) {
      console.error("Follow error:", error);
      // Rollback on failure
      setFollowing(previous);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      aria-pressed={following}
      title={following ? "Unfollow" : "Follow"}
      className={`px-4 py-2 rounded-md font-medium transition-colors transition-shadow duration-300 ease-out ${
        following
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } shadow-none hover:shadow-[0px_0px_194px_2px_rgba(165,_39,_255,_0.48)] ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}