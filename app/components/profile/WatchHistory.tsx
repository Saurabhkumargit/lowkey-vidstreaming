"use client";

import { useEffect, useState } from "react";
import WatchHistoryItem from "./WatchHistoryItem";

interface HistoryItem {
  _id: string;
  videoId: {
    _id: string;
    title: string;
    thumbnailUrl: string;
  };
  watchedAt: string;
}

export default function WatchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/user/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Watch History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No videos watched yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <WatchHistoryItem
              key={item._id}
              id={item.videoId._id}
              title={item.videoId.title}
              thumbnailUrl={item.videoId.thumbnailUrl}
              watchedAt={item.watchedAt}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
