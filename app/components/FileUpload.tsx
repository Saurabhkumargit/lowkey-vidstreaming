"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { on } from "events";
import { useRef, useState } from "react";

interface FileUploadProps {
  onSuccess?: (response: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optional validation
  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file.");
      }
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds the 50MB limit.");
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
        const authRes = await fetch("/api/auth/imagekit-auth");
        const auth = await authRes.json();

        const res = await upload({
          file,
          fileName: file.name,
          publicKey: process.env.NEXT_PUBLIC_PUBLC_KEY!,
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
        if (onSuccess) {
          onSuccess(res);
        }
    } catch (error) {
        console.error("Upload error:", error);
    } finally {
        setUploading(false);
    }
  }

  return (
    <>
      <input 
      type="file" 
      accept={fileType === "video" ? "video/*" : "image/*"}
      onChange={handleFileChange}
      />
      {
        uploading && <span>Uploading...</span>
      }
    </>
  );
};

export default File;
