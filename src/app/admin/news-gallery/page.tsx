"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import Sidebar from "@/Components/Sidebar";
import ImageUploaderHero from "@/app/admin/projects/add-project/ImageUploaderHero";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";
import { getImagePath } from "@/hooks/useApi";

type News = {
  id: number;
  title_en: string;
  title_ru: string;
  title_tk: string;
};

type GalleryItem = {
  id: number;
  image: string;
  news_id: number;
};

const MAX_GALLERY_FILES = 20;

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const getNewsTitle = (news?: News) => {
  if (!news) return "";
  return (
    stripHtml(news.title_en) ||
    stripHtml(news.title_ru) ||
    stripHtml(news.title_tk)
  );
};

const isAuthError = (error: unknown) => {
  const status = getApiErrorStatus(error);
  return status === 401 || status === 403;
};

const NewsGalleryPage = () => {
  const api = useApi();
  const [news, setNews] = useState<News[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedNewsId, setSelectedNewsId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imageStatus, setImageStatus] = useState<
    Record<number, "loading" | "loaded" | "error">
  >({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const newsById = useMemo(
    () => new Map(news.map((item) => [item.id, item])),
    [news],
  );

  const filteredGallery = useMemo(() => {
    if (!selectedNewsId) return gallery;
    return gallery.filter((item) => item.news_id === Number(selectedNewsId));
  }, [gallery, selectedNewsId]);

  const fileUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  const fetchGalleryList = useCallback(async () => {
    const galleryData = await api.get<GalleryItem[]>("/api/news-gallery");
    setGallery(galleryData);
  }, [api]);

  useEffect(() => {
    const urls = fileUrls;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const newsData = await api.get<News[]>("/api/news");
        setNews(newsData);
        await fetchGalleryList();
      } catch (err) {
        console.error("Ошибка при загрузке галереи новостей:", err);
        setError("Ошибка при загрузке данных");

        if (isAuthError(err)) {
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, fetchGalleryList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedNewsId || files.length === 0) {
      setError("Please select news and image files.");
      return;
    }

    try {
      setSaving(true);

      const createdItems = await Promise.all(
        files.map((file) => {
          const formData = new FormData();
          formData.append("news_id", selectedNewsId);
          formData.append("image", file);

          return api.post<GalleryItem>("/api/news-gallery", formData);
        }),
      );

      if (createdItems.length > 0) {
        await fetchGalleryList();
      }
      setFiles([]);
    } catch (err) {
      console.error("Ошибка при добавлении изображений:", err);
      setError("Ошибка при добавлении изображений");

      if (isAuthError(err)) {
        window.location.href = "/";
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError("");
      setDeletingId(id);
      await api.delete<void>(`/api/news-gallery/${id}`);
      await fetchGalleryList();
    } catch (err) {
      console.error("Ошибка при удалении изображения:", err);
      setError("Ошибка при удалении изображения. Проверьте авторизацию.");

      if (isAuthError(err)) {
        window.location.href = "/";
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1 py-10 ml-79 mr-7">
        <div className="mt-8 rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
          <div className="border-b border-[#D9D9D9] px-6 py-4">
            <h2 className="text-2xl font-bold">News Gallery</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            {error ? (
              <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <Field label="News:">
              <select
                value={selectedNewsId}
                onChange={(e) => setSelectedNewsId(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">All news</option>
                {news.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getNewsTitle(item)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Images:">
              <ImageUploaderHero
                files={files}
                setFiles={setFiles}
                maxFiles={MAX_GALLERY_FILES}
              />
              <p className="mt-2 text-xs text-gray-500">
                {files.length}/{MAX_GALLERY_FILES} photos selected
              </p>
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

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#708DB8] px-5 py-2 font-semibold text-white transition hover:bg-[#5f7ba6] disabled:opacity-60"
            >
              {saving ? (
                <div className="flex items-center justify-center w-[125px]">
                  <ClipLoader color="#fff" size={16} />
                </div>
              ) : (
                "Add images"
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
          <div className="border-b border-[#D9D9D9] px-6 py-4">
            <h2 className="text-2xl font-bold">Gallery list</h2>
          </div>

          <table className="min-w-full">
            <thead className="bg-[#E5ECF6]">
              <tr className="text-left text-sm text-gray-600">
                <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                  News name
                </th>
                <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                  Gallery
                </th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    <ClipLoader color="#708DB8" size={28} />
                  </td>
                </tr>
              ) : filteredGallery.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                filteredGallery.map((item) => {
                  const newsItem = newsById.get(item.news_id);
                  const newsTitle =
                    getNewsTitle(newsItem) || `News #${item.news_id}`;
                  const imagePath = getImagePath(item.image);
                  const imageSrc = imagePath ? buildApiUrl(imagePath) : "";

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-[#D9D9D9] text-sm"
                    >
                      <td className="border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center">
                        {newsTitle}
                      </td>
                      <td className="border-r border-dashed border-[#D8D8D8] px-4 py-4">
                        {imageSrc ? (
                          <div className="relative flex min-h-20 justify-center">
                            {imageStatus[item.id] !== "loaded" ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ClipLoader color="#708DB8" size={18} />
                              </div>
                            ) : null}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageSrc}
                              alt={`gallery ${item.id}`}
                              className="h-20 w-32 rounded-md object-cover"
                              loading="lazy"
                              onLoad={() =>
                                setImageStatus((prev) => ({
                                  ...prev,
                                  [item.id]: "loaded",
                                }))
                              }
                              onError={(e) => {
                                setImageStatus((prev) => ({
                                  ...prev,
                                  [item.id]: "error",
                                }));
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            {imageStatus[item.id] === "error" ? (
                              <div className="flex h-20 w-32 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                                Failed to load
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Link
                            href={`/admin/news-gallery/edit-gallery/${item.id}`}
                            className="inline-flex items-center gap-2 rounded-md border border-[#708DB8] px-4 py-1.5 text-[#708DB8] transition hover:bg-[#F7F9FC]"
                          >
                            <PencilIcon className="size-4" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-1.5 text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            {deletingId === item.id ? (
                              <ClipLoader size={80} color="#708DB8" />
                            ) : (
                              <>
                                <TrashIcon className="size-4" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

export default NewsGalleryPage;
