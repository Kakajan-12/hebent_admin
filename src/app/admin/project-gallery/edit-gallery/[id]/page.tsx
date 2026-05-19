"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import ImageUploaderHero from "@/app/admin/projects/add-project/ImageUploaderHero";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";

type GalleryItem = {
  id: number;
  images: string;
  project_id: number;
};

const EditProjectGalleryPage = () => {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const galleryId = params.id as string;

  const [item, setItem] = useState<GalleryItem | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    const urls = fileUrls;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await api.get<GalleryItem[] | GalleryItem>(
          `/api/project-gallery/${galleryId}`,
        );
        const galleryItem = Array.isArray(response) ? response[0] : response;

        if (!galleryItem) {
          setError("Gallery item not found");
          return;
        }

        setItem(galleryItem);
      } catch (err) {
        console.error("Ошибка при загрузке изображения:", err);
        setError("Ошибка при загрузке изображения");

        if (getApiErrorStatus(err) === 401) {
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [api, galleryId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const file = files[0];
    if (!file) {
      setError("Please select an image.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("images", file);
      if (item?.project_id) {
        formData.append("project_id", String(item.project_id));
      }

      await api.put(`/api/project-gallery/${galleryId}`, formData);
      router.push("/admin/project-gallery");
    } catch (err) {
      console.error("Ошибка при сохранении изображения:", err);
      setError("Ошибка при сохранении изображения");

      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setSaving(false);
    }
  };

  const currentImageUrl = item?.images ? buildApiUrl(item.images) : "";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#708DB8" size={28} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex-1">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <div className="border-b border-[#D9D9D9] px-6 py-4">
            <h2 className="text-2xl font-bold">Edit project gallery</h2>
          </div>

          <div className="space-y-6 px-6 py-6">
            {error ? (
              <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {currentImageUrl ? (
              <Field label="Current image:">
                <PreviewCards
                  urls={[currentImageUrl]}
                  onPreview={setPreviewUrl}
                  onRemove={() => setItem(null)}
                />
              </Field>
            ) : null}

            <Field label="New image:">
              <ImageUploaderHero
                files={files}
                setFiles={setFiles}
                replaceOnDrop
                maxFiles={1}
              />
              {fileUrls.length > 0 ? (
                <PreviewCards
                  urls={fileUrls}
                  onPreview={setPreviewUrl}
                  onRemove={(index) =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ) : null}
            </Field>
          </div>

          <div className="flex gap-3 px-6 pb-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded bg-[#708DB8] px-4 py-3 font-bold text-white transition hover:bg-[#5f7ba6] disabled:opacity-60"
            >
              {saving ? <ClipLoader color="#fff" size={16} /> : "Save"}
            </button>
            <Link
              href="/admin/project-gallery"
              className="flex-1 rounded bg-gray-300 px-4 py-3 text-center font-bold text-gray-800 transition hover:bg-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>

        {previewUrl ? (
          <button
            type="button"
            className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-black/60 p-4"
            onClick={() => setPreviewUrl(null)}
            aria-label="Close preview"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
};

const PreviewCards = ({
  urls,
  onPreview,
  onRemove,
}: {
  urls: string[];
  onPreview: (url: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="mt-4 flex flex-wrap gap-2 pb-1">
    {urls.map((url, index) => (
      <div
        key={`${url}-${index}`}
        className="relative shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
      >
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white"
          aria-label="Remove image"
        >
          ×
        </button>
        <div className="h-48 w-32 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full rounded-lg object-cover" />
        </div>
        <div className="pt-5">
          <button
            type="button"
            onClick={() => onPreview(url)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#708DB8] py-2 text-sm font-medium text-white transition hover:bg-[#5f7ba6]"
          >
            <EyeIcon className="size-4" />
            View
          </button>
        </div>
      </div>
    ))}
  </div>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <span className="mb-2 block text-sm font-medium text-[#374151]">
      {label}
    </span>
    {children}
  </div>
);

export default EditProjectGalleryPage;
