"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/videos?q=${encodeURIComponent(search)}&filter=recent`);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md mb-8">
      {/* Logo / Brand */}
      <div className="text-xl font-bold text-gray-900">
        <Link href="/">Lowkey VidStreaming</Link>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex-1 mx-6 max-w-md flex items-center border rounded overflow-hidden"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos..."
          className="w-full px-3 py-2 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          🔍
        </button>
      </form>

      {/* User Actions */}
      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <span className="text-gray-600">Loading...</span>
        ) : session?.user ? (
          <>
            <span className="text-gray-800 font-medium hidden sm:inline">
              👋 {session.user.name || session.user.email}
            </span>
            <Link href="/upload">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                Upload
              </button>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <button
            onClick={() => signIn(undefined, { callbackUrl: "/profile" })}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
