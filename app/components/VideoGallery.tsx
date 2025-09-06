"use client";

import { use, useEffect, useState } from "react";

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
}

export default function VideoGallery() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchvideos = async () => {
            try {
                const res = await fetch("/api/video");
                if(!res.ok) {
                    throw new Error("Failed to fetch videos");
                }

                const data = await res.json();
                setVideos(data);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchvideos();
    }, []);

    if (loading) return <p>Loading videos...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="space-y-4">
            {videos.length === 0? (
                <p>No videos available.</p>
            ) : (
                videos.map((video) => (
                    <div key={video._id} className="border p-4 rounded"> 
                    <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
                    <p className="text-gray-600 mb-2">{video.description}</p>
                    <video
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    controls
                    className="w-full h-auto rounded"
                    />
                    </div>
                ))
            )}
        </div>
    )
}