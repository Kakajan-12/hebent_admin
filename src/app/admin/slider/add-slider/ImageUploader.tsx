"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { LuUpload } from "react-icons/lu";
import { appendUniqueFilesWithReport } from "@/lib/files";
import { notifyDuplicateUploads } from "@/lib/duplicateUploadToast";

type Props = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  /** Each drop replaces the file list (e.g. single image on edit). */
  replaceOnDrop?: boolean;
  /** After drop, keep at most this many files (e.g. 1 for testimonial). */
  maxFiles?: number;
  /** If true, only image/* (no video). */
  imagesOnly?: boolean;
};

export default function ImageUploader({
  files,
  setFiles,
  replaceOnDrop = false,
  maxFiles,
  imagesOnly = false,
}: Props) {
  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    const urls = previewUrls;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (replaceOnDrop) {
        const capped =
          maxFiles != null
            ? acceptedFiles.slice(0, maxFiles)
            : [...acceptedFiles];
        setFiles(capped);
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

  const singleSlot = Boolean(replaceOnDrop && maxFiles === 1);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: imagesOnly ? { "image/*": [] } : { "image/*": [], "video/*": [] },
    multiple: !singleSlot,
    maxFiles: singleSlot ? 1 : undefined,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex items-center gap-4 rounded border-2 border-dashed p-4 cursor-pointer transition
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
      >
        <input {...getInputProps()} />

        <div className="min-w-0 text-left flex flex-col gap-2">
          {files.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="relative overflow-hidden rounded-lg border bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={previewUrls[index]}
                        alt={file.name}
                        width={40}
                        height={70}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <video
                        src={previewUrls[index]}
                        className="h-28 w-full object-cover"
                        muted
                        playsInline
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFiles((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white cursor-pointer"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                    <p className="truncate px-1 py-1 text-xs text-gray-600">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
                <LuUpload className="size-6" />{" "}
              </div>
              <p className="font-medium text-gray-800 text-sm">
                Upload one file
              </p>
            </div>
          )}
        </div>
      </div>

      {/* <button
        type="button"
        onClick={() => open()}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        {files.length > 0 ? "Add more files" : "Add files"}
      </button> */}

      {/* {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="relative overflow-hidden rounded-lg border bg-white"
            >
              {file.type.startsWith("image/") ? (
                <Image
                  src={previewUrls[index]}
                  alt={file.name}
                  width={50}
                  height={50}
                  className="w-12 h-auto object-cover"
                />
              ) : (
                <video
                  src={previewUrls[index]}
                  className="h-28 w-full object-cover"
                  muted
                  playsInline
                />
              )}
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white"
                aria-label="Remove"
              >
                ×
              </button>
              <p className="truncate px-1 py-1 text-xs text-gray-600">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
