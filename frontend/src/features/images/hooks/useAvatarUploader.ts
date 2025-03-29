import { useState } from "react";

export function useAvatarUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
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
    reset
  };
}