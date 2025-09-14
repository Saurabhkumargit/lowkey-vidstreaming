// app/feed/page.tsx
import VideoGallery from "@/app/components/VideoGallery";

export default function FeedPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <VideoGallery source="feed" />
    </div>
  );
}
