import { useCallback, useEffect, useRef, useState } from "react";
import { fileToBase64 } from "../utils/fileToBase64";

export default function useFilePreview() {
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");

  const clearFile = useCallback(() => {
    setFileName("");
    setFileBase64("");
    setFileType("");

    setPreviewUrl("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const triggerFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      clearFile();
      return;
    }

    setFileName(file.name);
    setFileType(file.type || "");
    setFileBase64(await fileToBase64(file));

    if (file.type?.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
  }, [clearFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    inputRef,
    fileName,
    fileBase64,
    previewUrl,
    fileType,
    handleFileChange,
    triggerFilePicker,
    clearFile,
  };
}