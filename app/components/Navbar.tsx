import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import { useState } from "react";
import Image from "next/image";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/videos?q=${encodeURIComponent(search)}&filter=recent`);
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#222] bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Menu"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            ☰
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/assets/logo.png"
              alt="Lowkey"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="hidden sm:inline text-white/90">Lowkey</span>
          </Link>
        </div>

        {/* Center: search */}
        <form onSubmit={onSubmit} className="flex-1 max-w-2xl">
          <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 focus-within:border-white/20">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-transparent placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-white/10 px-3 py-1 text-white/80 hover:bg-white/15 transition"
              aria-label="Search"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/upload" aria-label="Upload">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition">
              <Image
                src="/assets/icons/upload.svg"
                alt="Upload"
                width={18}
                height={18}
              />
            </button>
          </Link>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
            aria-label="Notifications"
          >
            <Image
              src="/assets/icons/notification.svg"
              alt="Notifications"
              width={18}
              height={18}
            />
          </button>
          {status === "loading" ? (
            <span className="text-white/60">…</span>
          ) : session?.user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
                aria-label="Profile"
              >
                <Image
                  src="/assets/icons/profile.svg"
                  alt="Profile"
                  width={18}
                  height={18}
                />
              </Link>
              <LogoutButton />
            </>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/profile" })}
              className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
