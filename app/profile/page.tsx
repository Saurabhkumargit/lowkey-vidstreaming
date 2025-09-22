"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/app/components/Layout";

type Video = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
};

interface Follower {
  _id: string;
  name: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [uploaded, setUploaded] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Video[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"videos" | "playlists" | "liked">("videos");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  // Keep form fields in sync
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
        const res = await fetch("/api/user/profile");
        if (res.status === 401) {
          setError("unauthorized");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile data");

        const data = await res.json();
        setUploaded(data.uploaded);
        setLiked(data.liked);
        setFollowers(Array.isArray(data.followers) ? data.followers : []);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Unknown error");
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
    return <p className="p-4 text-white/60">Loading profile...</p>;
  if (error === "unauthorized") {
    return (
      <div className="p-6 text-center text-white/80">
        <p className="mb-4">You must sign in to view your profile.</p>
        <Link
          href="/api/auth/signin"
          className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }
  if (error) return <p className="text-red-400 p-4">Error: {error}</p>;

  const handle = session?.user?.email?.split("@")[0] || "user";

  return (
    <Layout>
      <div className="max-w-5xl py-6 space-y-6">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Image
            src={(session?.user?.image as string) || "/default-avatar.png"}
            alt={session?.user?.name || handle}
            width={96}
            height={96}
            className="rounded-full ring-1 ring-white/10"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white/95">{session?.user?.name || "Username"}</h1>
            <p className="text-white/60">@{handle}</p>
            <p className="text-white/50 text-sm mt-1">{followers.length} Followers</p>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
          >
            Edit Profile
          </button>
        </div>

        {editing && (
          <form onSubmit={handleProfileUpdate} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="rounded-md bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-md bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="rounded-md bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
                placeholder="New password (optional)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="rounded-md bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-white/20"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition">Cancel</button>
            </div>
          </form>
        )}

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="-mb-px flex gap-4">
            {[
              { key: "videos", label: "Videos" },
              { key: "playlists", label: "Playlists" },
              { key: "liked", label: "Liked" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as "videos" | "playlists" | "liked")}
                className={`px-3 py-2 text-sm transition border-b-2 ${
                  activeTab === t.key
                    ? "border-red-600 text-white"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "videos" && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {uploaded.length === 0 ? (
              <p className="text-white/60">No videos uploaded.</p>
            ) : (
              uploaded.map((video) => (
                <Link
                  key={video._id}
                  href={`/video/${video._id}`}
                  className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition"
                >
                  <div className="w-full aspect-video bg-[#181818]" />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white/90 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-white/60 line-clamp-2">{video.description}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="text-white/60">Playlists coming soon.</div>
        )}

        {activeTab === "liked" && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {liked.length === 0 ? (
              <p className="text-white/60">No liked videos.</p>
            ) : (
              liked.map((video) => (
                <Link
                  key={video._id}
                  href={`/video/${video._id}`}
                  className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition"
                >
                  <div className="w-full aspect-video bg-[#181818]" />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white/90 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-white/60 line-clamp-2">{video.description}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
