"use client";

import { upload } from "@imagekit/next";
import { useState } from "react";

interface FileUploadProps {
  onSuccess?: (response: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const startUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (!validateFile(file)) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Get auth for ImageKit
      const authRes = await fetch("/api/auth/imagekit-auth");
      const auth = await authRes.json();

      // Step 2: Upload file to ImageKit
      const res = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,

        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
            if (onProgress) onProgress(percent);
          }
        },
      });

      console.log("ImageKit upload response:", res);

      // Step 3: Save metadata in MongoDB via /api/video
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
        console.log("Video saved in DB:", video);

        if (onSuccess) {
          onSuccess(video);
        }
      } else {
        const err = await dbres.json();
        setError("Failed to save video: " + (err.error || "unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // ✅ generate preview
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile)); // ✅ generate preview
      setError(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-[#181818] rounded-lg shadow-lg space-y-5">
      <h2 className="text-xl font-semibold text-white">Upload a {fileType}</h2>

      <input
        type="text"
        placeholder="Enter title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 rounded bg-[#0f0f0f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <textarea
        placeholder="Enter description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="w-full p-3 rounded bg-[#0f0f0f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="w-full rounded-lg overflow-hidden bg-black">
          {fileType === "video" ? (
            <video
              src={previewUrl}
              controls
              muted
              loop
              className="w-full max-h-64 object-contain"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
          )}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded cursor-pointer transition ${
          isDragOver
            ? "border-purple-500 bg-purple-500/10"
            : "border-gray-600 hover:border-purple-500"
        }`}
      >
        {file ? (
          <span className="text-gray-300">{file.name}</span>
        ) : (
          <span className="text-gray-400">
            {isDragOver ? "Drop the file here" : "Click or drag a file here"}
          </span>
        )}
        <input
          type="file"
          accept={fileType === "video" ? "video/*" : "image/*"}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Upload Button */}
      <button
        onClick={startUpload}
        disabled={uploading || !file}
        className="w-full py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default FileUpload;
