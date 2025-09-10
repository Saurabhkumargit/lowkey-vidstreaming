"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md mb-8">
      <div className="text-xl font-bold text-gray-900">Lowkey VidStreaming</div>

      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <span className="text-gray-600">Loading...</span>
        ) : session?.user ? (
          <>
            <span className="text-gray-800 font-medium">
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
