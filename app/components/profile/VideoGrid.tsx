"use client";

import React from "react";

export interface VideoItem {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

type Props = {
  title: string;
  videos: VideoItem[];
};

export default function VideoGrid({ title, videos }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {videos.length === 0 ? (
        <p>No videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((v) => (
            <div key={v._id} className="border rounded p-2">
              <video
                src={v.videoUrl}
                poster={v.thumbnailUrl}
                controls
                className="w-full rounded"
              />
              <h3 className="font-medium mt-2">{v.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


