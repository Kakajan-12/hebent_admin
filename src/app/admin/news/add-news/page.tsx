"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import ImageUploader from "@/app/admin/slider/add-slider/ImageUploader";
import ImageUploaderHero from "@/app/admin/projects/add-project/ImageUploaderHero";
import { ClipLoader } from "react-spinners";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";

const MAX_GALLERY_FILES = 20;

const AddNews = () => {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(
    null,
  );
  const [title_tk, setTitleTk] = useState("");
  const [title_en, setTitleEn] = useState("");
  const [title_ru, setTitleRu] = useState("");
  const [text_tk, setTextTk] = useState("");
  const [text_en, setTextEn] = useState("");
  const [text_ru, setTextRu] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [cat, setCat] = useState<{ id: number; category_en: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const router = useRouter();
  const api = useApi();

  const imageObjectUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  const galleryObjectUrls = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );

  useEffect(() => {
    const urls = [...imageObjectUrls, ...galleryObjectUrls];
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imageObjectUrls, galleryObjectUrls]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await api.get<{ id: number; category_en: string }[]>(
          "/api/news-category",
          { withAuth: false },
        );
        setCat(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Ошибка при загрузке категорий:", err);
      }
    };

    fetchData();
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (imageFiles.length === 0) {
      setError("Добавьте главное изображение.");
      return;
    }

    if (!category_id) {
      setError("Выберите категорию.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFiles[0]);
      galleryFiles.forEach((file) => formData.append("gallery", file));
      formData.append("title_tk", title_tk ?? "");
      formData.append("title_en", title_en ?? "");
      formData.append("title_ru", title_ru ?? "");
      formData.append("text_tk", text_tk ?? "");
      formData.append("text_en", text_en ?? "");
      formData.append("text_ru", text_ru ?? "");
      formData.append("category_id", category_id);

      await api.post("/api/news", formData);
      router.push("/admin/news");
    } catch (err) {
      console.error(err);
      setError("Не удалось сохранить новость.");
      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">New news</h2>
            <FiChevronDown
              className={`size-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#eee] px-6 pb-6 pt-6">
              {error ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <div>
                <label
                  htmlFor="category_id"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={category_id}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full max-w-xl rounded-lg border border-gray-300 py-2.5 pl-3 pr-3 text-sm transition focus:border-[#708DB8] focus:outline-none focus:ring-2 focus:ring-[#708DB8]/20"
                >
                  <option value="">—</option>
                  {cat.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_en.replace(/<[^>]+>/g, "")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium ">
                  Images
                </label>
                {/* <p className="mb-2 text-xs text-gray-500">
                  Первое изображение — обложка в списке; остальные — галерея.
                </p> */}
                <ImageUploader
                  files={imageFiles}
                  setFiles={setImageFiles}
                  maxFiles={1}
                  replaceOnDrop
                />
                {imageObjectUrls.length > 0 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {imageObjectUrls.map((url, index) => (
                      <div
                        key={`${imageFiles[index]?.name}-${index}`}
                        className="shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
                      >
                        <div className="h-48 w-32 rounded-lg">
                          <Image
                            src={url}
                            alt=""
                            width={128}
                            height={192}
                            className="size-full rounded-lg object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => setGalleryPreviewUrl(url)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#708DB8] py-2 text-sm font-medium text-white transition hover:bg-[#5f7ba6]"
                          >
                            <EyeIcon className="size-4" />
                            View
                          </button>
                        </div>
                        <p className="mt-2 text-center text-xs font-medium text-[#708DB8]">
                          Обложка
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {isClient && (
                <Tabs defaultValue="russian">
                  <TabsList className="min-w-0 border border-[#D9D9D9] bg-[#E5ECF6]">
                    <TabsTrigger value="russian" className="text-sm">
                      Russian
                    </TabsTrigger>
                    <TabsTrigger value="english" className="text-sm">
                      English
                    </TabsTrigger>
                    <TabsTrigger value="turkmen" className="text-sm">
                      Turkmen
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="russian" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor content={title_ru} onChange={setTitleRu} />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor content={text_ru} onChange={setTextRu} />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor content={title_en} onChange={setTitleEn} />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor content={text_en} onChange={setTextEn} />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor content={title_tk} onChange={setTitleTk} />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor content={text_tk} onChange={setTextTk} />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}
              <div className="mt-6">
                <Field label="Gallery:">
                  <ImageUploaderHero
                    files={galleryFiles}
                    setFiles={setGalleryFiles}
                    maxFiles={MAX_GALLERY_FILES}
                  />
                  <p className="mt-5 text-xs text-gray-500">
                    {galleryFiles.length}/{MAX_GALLERY_FILES} photos selected
                  </p>
                  {galleryObjectUrls.length > 0 ? (
                    <PreviewCards
                      files={galleryFiles}
                      urls={galleryObjectUrls}
                      onPreview={setPreviewUrl}
                      onRemove={(index) =>
                        setGalleryFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    />
                  ) : null}
                </Field>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-b-xl bg-[#708DB8] py-3 text-lg font-semibold tracking-wide text-white uppercase transition hover:bg-[#5f7ba6] disabled:opacity-60"
          >
            {saving ? <ClipLoader color="#fff" size={16} /> : "Save"}
          </button>
        </form>

        {galleryPreviewUrl ? (
          <button
            type="button"
            className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-black/60 p-4"
            onClick={() => setGalleryPreviewUrl(null)}
            aria-label="Close preview"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryPreviewUrl}
              alt=""
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </button>
        ) : null}
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
  files,
  urls,
  onPreview,
  onRemove,
}: {
  files: File[];
  urls: string[];
  onPreview: (url: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="mt-4 flex flex-wrap gap-2 pb-1">
    {urls.map((url, index) => (
      <div
        key={`${files[index]?.name}-${index}`}
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

export default AddNews;
