"use client";
import FileUpload from "../components/FileUpload";

export default function UploadPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload a Video</h1>
      <FileUpload fileType="video" />
    </div>
  );
}
