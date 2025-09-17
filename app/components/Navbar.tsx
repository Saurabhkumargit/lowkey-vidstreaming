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
    <nav className="sticky top-0 z-40 w-full border-b border-[#222] bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white">▶</span>
          <span className="hidden sm:inline text-white/90">Lowkey</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 focus-within:border-white/20">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent placeholder:text-white/40 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-white/10 px-3 py-1 text-white/80 hover:bg-white/15 transition">🔍</button>
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3">
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="Notifications">
            🔔
          </button>
          {status === "loading" ? (
            <span className="text-white/60">…</span>
          ) : session?.user ? (
            <>
              <Link href="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm" aria-label="Profile">
                {(session.user as any).image ? '🧑' : '👤'}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm" aria-label="Profile">
              👤
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
