"use client";

import { upload } from "@imagekit/next";
import { on } from "events";
import { useState } from "react";

interface FileUploadProps {
  onSuccess?: (response: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // optional validation
  const validateFile = (file: File) => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file.");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds the 50MB limit.");
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      //  Step 1: Get auth for ImageKit
      const authRes = await fetch("/api/auth/imagekit-auth");
      const auth = await authRes.json();

      // 🔹 Step 2: Upload file to ImageKit
      const res = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,

        onProgress: (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(Math.round(percent));
          }
        },
      });

      console.log("ImageKit upload response:", res);

      //  Step 3: Save metadata in MongoDB via /api/videos
      const dbres = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl: res.url,
          thumbnailUrl: res.thumbnailUrl || res.url,
        }),
      });

      if (dbres.ok) {
        const video = await dbres.json();
        console.log("Video saved  in DB:", video);

        if (onSuccess) {
          onSuccess(video);
        }
      } else {
        const err = await dbres.json();
        setError("Failed to save video: " + err.error || "unknown error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="file"
          accept={fileType === "video" ? "video/*" : "image/*"}
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p>Uploading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </>
  );
};

export default FileUpload;
