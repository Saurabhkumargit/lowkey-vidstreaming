"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith("/video/") ?? false;
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {!hideSidebar && (
            <div className="hidden md:block">
              <Sidebar />
            </div>
          )}
          <main className="flex-1 py-6 min-w-0">{children}</main>
        </div>
      </div>
      {/* Bottom navigation for mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#222] bg-[#0f0f0f] md:hidden">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-4 py-2 text-xs">
            <Link href="/" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
              <Image src="/assets/icons/home.svg" alt="Home" className="h-5 w-5" width={20} height={20} />
              <span>Home</span>
            </Link>
            <Link href="/feed" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
              <Image src="/assets/icons/following.svg" alt="Subscriptions" className="h-5 w-5" width={20} height={20} />
              <span>Subs</span>
            </Link>
            <Link href="/videos" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
              <Image src="/assets/icons/library.svg" alt="Library" className="h-5 w-5" width={20} height={20} />
              <span>Library</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-white/80 hover:text-white">
              <Image src="/assets/icons/history.svg" alt="History" className="h-5 w-5" width={20} height={20} />
              <span>History</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
