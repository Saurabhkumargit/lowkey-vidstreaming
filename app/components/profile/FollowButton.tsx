"use client";

import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
}

export default function FollowButton({ targetUserId, isFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${targetUserId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        following
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}