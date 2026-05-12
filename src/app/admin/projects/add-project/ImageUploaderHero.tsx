"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { appendUniqueFilesWithReport } from "@/lib/files";
import { notifyDuplicateUploads } from "@/lib/duplicateUploadToast";

type Props = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  replaceOnDrop?: boolean;
  maxFiles?: number;
};

export default function ImageUploaderHero({
  files,
  setFiles,
  replaceOnDrop = false,
  maxFiles,
}: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (replaceOnDrop) {
        setFiles(acceptedFiles.slice(0, maxFiles ?? 1));
        return;
      }

      let duplicateNames: string[] = [];
      setFiles((prev) => {
        const { next, duplicateNames: dupes } = appendUniqueFilesWithReport(
          prev,
          acceptedFiles,
        );
        duplicateNames = dupes;
        return maxFiles != null ? next.slice(0, maxFiles) : next;
      });
      notifyDuplicateUploads(duplicateNames);
    },
    [setFiles, replaceOnDrop, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: !replaceOnDrop,
    maxFiles: replaceOnDrop ? 1 : undefined,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition
                ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop images here…</p>
        ) : (
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              {files.length > 0
                ? "Drag more images here or click this area"
                : "Drag images here or click this area"}
            </p>
            <p className="text-xs text-gray-500">
              {maxFiles === 1
                ? "Only one image"
                : `Several files at once are ok${
                    maxFiles ? `, up to ${maxFiles}` : ""
                  }`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
