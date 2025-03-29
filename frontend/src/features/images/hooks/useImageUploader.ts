import { useState } from "react";

export function useImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return {
    file,
    previewUrl,
    handleFileChange,
    reset,
  };
}