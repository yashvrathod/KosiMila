"use client";

import { useState } from "react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  label = "Product Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUrl = value?.[0]?.trim() || "";

  const handleUpload = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ""
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();

      if (!data?.secure_url) {
        throw new Error("No URL returned from Cloudinary");
      }

      onChange([data.secure_url]);
    } catch (err) {
      console.error("Upload failed", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange([]);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
          // Reset input so same file can be re-uploaded
          e.target.value = "";
        }}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0 file:text-sm file:font-medium
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Uploading State */}
      {uploading && (
        <p className="text-sm text-blue-500 animate-pulse">Uploading...</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Preview with Remove Button */}
      {currentUrl && !uploading && (
        <div className="relative w-32 h-32">
          <img
            src={currentUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600
              text-white rounded-full w-6 h-6 text-xs font-bold
              flex items-center justify-center shadow-md transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}