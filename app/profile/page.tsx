"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileEditForm from "@/app/components/profile/ProfileEditForm";
import VideoGrid, {
  VideoItem as ProfileVideoItem,
} from "@/app/components/profile/VideoGrid";
import WatchHistory from "@/app/components/profile/WatchHistory"; // ✅ import

type Video = ProfileVideoItem;

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
      <ProfileHeader
        userName={session?.user?.name || null}
        userEmail={session?.user?.email || null}
        userImage={session?.user?.image || null}
        editing={editing}
        onToggleEditing={() => setEditing(!editing)}
      />
      {editing && (
        <ProfileEditForm
          name={name}
          email={email}
          password={password}
          onChangeName={setName}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onChangeAvatar={setAvatar}
          onSubmit={handleProfileUpdate}
        />
      )}
      <VideoGrid title="📹 My Videos" videos={uploaded} />
      <VideoGrid title="❤️ Liked Videos" videos={liked} />
      <WatchHistory /> {/* ✅ Watch history section */}
    </div>
  );
}
