"use client";

import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import VideoListContent from "./VideoListContent";

export default function VideosPage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <Sidebar />
          <Suspense fallback={<p className="text-white/60">Loading videos...</p>}>
            <VideoListContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
