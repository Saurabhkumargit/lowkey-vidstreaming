"use client";

import React from "react";
import Link from "next/link";
import Layout from "./components/Layout";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import Video from "@/models/Video";

type VideoType = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
  views?: number;
  userId?: { name?: string; email?: string } | null;
};

const MIN_FEED_SIZE = 60;

export default async function Home() {
  // Server-side: fetch videos directly from DB so initial render always has data
  await connectToDatabase();
  // Ensure User model is registered on the mongoose instance before populate
  if (!mongoose.models || !mongoose.models.User) {
    await import("@/models/User");
  }

  const docs = await Video.find({}).sort({ createdAt: -1 }).limit(100).populate("userId", "name email").lean();
  const base: VideoType[] = Array.isArray(docs) ? (docs as unknown as VideoType[]) : [];

  const repeated: (VideoType & { __k: string })[] = [];
  if (base.length > 0) {
    const repeat = Math.max(1, Math.ceil(MIN_FEED_SIZE / base.length));
    for (let r = 0; r < repeat; r++) {
      for (let i = 0; i < base.length; i++) {
        const v = base[i];
        repeated.push({ ...v, __k: `${v._id}-${r * base.length + i}` });
      }
    }
    // simple shuffle
    for (let i = repeated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [repeated[i], repeated[j]] = [repeated[j], repeated[i]];
    }
  }

  return (
    <Layout>
      <section className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-white/90">Home</h1>
        </div>

        {base.length === 0 ? (
          <p className="text-white/60">No videos found.</p>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {repeated.map((v, idx) => (
              <Link
                key={v.__k || `${v._id}-${idx}`}
                href={`/video/${v._id}`}
                className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition"
              >
                {v.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-[#181818]" />
                )}
                <div className="p-3">
                  <h2 className="text-sm font-semibold text-white/90 line-clamp-2">{v.title}</h2>
                  <p className="text-xs text-white/60 mt-1">{v.userId?.name || v.userId?.email || "Unknown"}</p>
                  <p className="text-[11px] text-white/40">
                    {(typeof v.views === "number" ? `${v.views} views` : "")}
                    {v.createdAt ? `${typeof v.views === "number" ? " • " : ""}${new Date(v.createdAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
