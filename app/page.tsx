
"use client";

import Layout from "./components/Layout";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Video = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt?: string;
  views?: number;
  userId?: { name?: string; email?: string };
};

const PAGE_SIZE = 12;
const MIN_FEED_SIZE = 60; // ensure 50+ items

export default function Home() {
  const [allVideos, setAllVideos] = useState<(Video & { __k: string })[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [useInfinite, setUseInfinite] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchVideos() {
      try {
        setLoading(true);
        const res = await fetch(`/api/video?filter=recent`);
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data: Video[] = await res.json();
        if (!cancelled) {
          const base = Array.isArray(data) ? data : [];
          const len = base.length;
          if (len === 0) {
            setAllVideos([]);
          } else {
            const repeat = Math.max(1, Math.ceil(MIN_FEED_SIZE / len));
            const repeated = Array.from({ length: len * repeat }, (_, i) => {
              const v = base[i % len];
              return { ...v, __k: `${v._id}-${i}` } as Video & { __k: string };
            });
            // shuffle (Fisher-Yates)
            for (let i = repeated.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [repeated[i], repeated[j]] = [repeated[j], repeated[i]];
            }
            setAllVideos(repeated);
          }
        }
      } catch (e: unknown) {
        const error = e as Error;
        setError(error.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasMore = visibleCount < allVideos.length;
  const visibleVideos = useMemo(() => allVideos.slice(0, visibleCount), [allVideos, visibleCount]);

  useEffect(() => {
    if (!useInfinite) return;
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [useInfinite, hasMore]);

  return (
    <Layout>
      <section className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-white/90">Home</h1>
          <button
            className="text-xs rounded-full bg-white/10 px-3 py-1 text-white/80 hover:bg-white/15 transition"
            onClick={() => setUseInfinite((v) => !v)}
          >
            {useInfinite ? "Use Load More" : "Use Infinite Scroll"}
          </button>
        </div>

        {loading ? (
          <p className="text-white/60">Loading videos...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : allVideos.length === 0 ? (
          <p className="text-white/60">No videos found.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visibleVideos.map((v, i) => (
                <Link
                  key={v.__k || `${v._id}-${i}`}
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
                    <p className="text-xs text-white/60 mt-1">
                      {v.userId?.name || v.userId?.email || "Unknown"}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {(typeof v.views === "number" ? `${v.views} views` : "")}
                      {v.createdAt ? `${typeof v.views === "number" ? " • " : ""}${new Date(v.createdAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {useInfinite ? (
              <div ref={loaderRef} />
            ) : hasMore ? (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
                >
                  Load More
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </Layout>
  );
}
