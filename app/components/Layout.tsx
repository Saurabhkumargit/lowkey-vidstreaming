"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <Sidebar />
          <main className="flex-1 py-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}


