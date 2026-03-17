"use client";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Product Image" }: ImageUploadProps) {
  const currentUrl = value[0] || "";

  const handleUrlChange = (url: string) => {
    onChange(url ? [url] : []);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* URL Input */}
      <input
        type="url"
        value={currentUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="Paste image URL here"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
