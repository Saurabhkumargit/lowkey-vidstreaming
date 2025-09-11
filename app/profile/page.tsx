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
  const { data: session, status, update } = useSession();
  const [uploaded, setUploaded] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  // Keep form fields in sync once the session loads/changes
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

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
        if (res.status === 401) {
          setError("unauthorized");
          return;
        }
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

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (avatar) formData.append("avatar", avatar);

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      await update({ name: data.name, email: data.email, image: data.avatar });
      setEditing(false);
      setPassword("");
      setAvatar(null);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  }

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
          <button
            onClick={() => setEditing(!editing)}
            className="mt-2 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      {editing && (
        <form
          onSubmit={handleProfileUpdate}
          className="p-4 border rounded space-y-3"
        >
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="New password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Changes
          </button>
        </form>
      )}

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
