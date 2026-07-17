"use client";

import { useCallback, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";

export function FileUpload({
  onUploaded,
  label = "Drop files here, or click to browse",
  accept = "image/*",
  maxFiles = 10,
}: {
  onUploaded: (urls: string[]) => void;
  label?: string;
  accept?: string;
  maxFiles?: number;
}) {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setPending(true);
      setError(null);
      try {
        const urls: string[] = [];
        for (const file of Array.from(fileList).slice(0, maxFiles)) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!result.ok) throw new Error("Upload failed");
          const { storageId } = await result.json();
          const url = await convex.query(api.files.getFileUrl, { storageId });
          if (url) urls.push(url);
        }
        onUploaded(urls);
      } catch {
        setError("Upload failed. Try again.");
      } finally {
        setPending(false);
      }
    },
    [convex, generateUploadUrl, onUploaded, maxFiles],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors",
        isDragging ? "border-brass bg-brass-soft/20" : "border-line hover:border-ink-faint",
      )}
    >
      <input
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {pending ? "Uploading…" : label}
      </span>
      {error && <span className="text-xs text-rust">{error}</span>}
    </label>
  );
}