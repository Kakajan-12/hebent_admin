"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { FiChevronDown } from "react-icons/fi";
import { CalendarDaysIcon, EyeIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/Components/Sidebar";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { Calendar } from "@/Components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/Components/ui/popover";
import ImageUploader from "@/app/admin/slider/add-slider/ImageUploader";
import {
  filesToDataUrls,
  getBlogById,
  resolveBlogImageSrc,
  updateBlog,
} from "@/lib/blogsLocalStore";
import { isoToDdMmYyyy, parseDdMmYyyyToIso, todayIsoUtc } from "@/lib/blogDate";
import { ClipLoader } from "react-spinners";
const EditBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [storedMainImage, setStoredMainImage] = useState("");
  const [storedGallery, setStoredGallery] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [titleRu, setTitleRu] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleTk, setTitleTk] = useState("");
  const [textRu, setTextRu] = useState("");
  const [textEn, setTextEn] = useState("");
  const [textTk, setTextTk] = useState("");
  const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const galleryObjectUrls = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );

  useEffect(() => {
    const urls = galleryObjectUrls;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [galleryObjectUrls]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    if (!Number.isFinite(id)) {
      setNotFound(true);
      setLoaded(true);
      return;
    }
    const blog = getBlogById(id);
    if (!blog) {
      setNotFound(true);
      setLoaded(true);
      return;
    }
    setStoredMainImage(blog.mainImage);
    setStoredGallery([...blog.gallery]);
    setDateInput(isoToDdMmYyyy(blog.date));
    const cal = new Date(`${blog.date}T12:00:00`);
    if (!Number.isNaN(cal.getTime())) setCalendarDate(cal);
    setTitleRu(blog.title_ru);
    setTitleEn(blog.title_en);
    setTitleTk(blog.title_tk);
    setTextRu(blog.text_ru);
    setTextEn(blog.text_en);
    setTextTk(blog.text_tk);
    setLoaded(true);
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    if (!Number.isFinite(id)) return;

    const parsedDate = dateInput.trim()
      ? parseDdMmYyyyToIso(dateInput)
      : todayIsoUtc();
    if (dateInput.trim() && !parsedDate) {
      window.alert("Введите дату в формате dd.mm.yyyy");
      return;
    }

    setSaving(true);
    try {
      const galleryUrls = await filesToDataUrls(galleryFiles);
      const gallery = galleryUrls.length > 0 ? galleryUrls : [...storedGallery];

      const result = updateBlog(id, {
        mainImage: storedMainImage,
        date: parsedDate ?? todayIsoUtc(),
        title_ru: titleRu || "<p></p>",
        title_en: titleEn || "<p></p>",
        title_tk: titleTk || "<p></p>",
        text_ru: textRu || "<p></p>",
        text_en: textEn || "<p></p>",
        text_tk: textTk || "<p></p>",
        gallery,
      });
      if (result) router.push("/admin/blogs");
    } catch (err) {
      console.error(err);
      window.alert("Не удалось сохранить запись.");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <p className="mt-8 text-gray-600">Запись не найдена.</p>
          <Link
            href="/admin/blogs"
            className="mt-4 inline-block text-sm text-[#708DB8] hover:underline"
          >
            ← Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <Link
          href="/admin/blogs"
          className="mb-4 inline-block text-sm text-[#708DB8] hover:underline"
        >
          ← Blogs
        </Link>

        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">
              Edit blog #{id}
            </h2>
            <FiChevronDown
              className={`size-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#eee] px-6 pb-6 pt-6">
              <div>
                <label
                  htmlFor="blog-date-edit"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Date
                </label>
                <div className="relative max-w-xs">
                  <input
                    id="blog-date-edit"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="dd.mm.yyyy"
                    maxLength={10}
                    value={dateInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const prev = dateInput;

                      if (raw.length < prev.length) {
                        setDateInput(raw.replace(/\.$/, ""));
                        setDateError(null);
                        return;
                      }

                      const digits = raw.replace(/\D/g, "");
                      const dd = digits.slice(0, 2);
                      const mm = digits.slice(2, 4);
                      const yyyy = digits.slice(4, 8);
                      const ddNum = Number(dd);
                      const mmNum = Number(mm);

                      if (dd.length === 2 && (ddNum < 1 || ddNum > 31)) {
                        setDateError("День должен быть от 1 до 31");
                        return;
                      }
                      if (mm.length === 2 && (mmNum < 1 || mmNum > 12)) {
                        setDateError("Месяц должен быть от 1 до 12");
                        return;
                      }

                      setDateError(null);

                      let formatted = dd;
                      if (digits.length > 2) formatted = `${dd}.${mm}`;
                      if (digits.length > 4) formatted = `${dd}.${mm}.${yyyy}`;

                      setDateInput(formatted);

                      if (digits.length === 8) {
                        const iso = parseDdMmYyyyToIso(`${dd}.${mm}.${yyyy}`);
                        if (iso) setCalendarDate(new Date(iso));
                      }
                    }}
                    className={`w-full rounded-lg border py-2.5 pr-10 pl-3 text-sm transition focus:outline-none focus:ring-2 ${
                      dateError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#708DB8] focus:ring-[#708DB8]/20"
                    }`}
                  />
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Открыть календарь"
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-[#708DB8]"
                      >
                        <CalendarDaysIcon className="size-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={calendarDate}
                        defaultMonth={calendarDate}
                        onSelect={(day) => {
                          if (!day) return;
                          setCalendarDate(day);
                          setDateInput(format(day, "dd.MM.yyyy"));
                          setCalendarOpen(false);
                          setDateError(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {dateError && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <span aria-hidden>⚠</span>
                    {dateError}
                  </p>
                )}
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
                      <TipTapEditor
                        key={`title-ru-${id}-${loaded}`}
                        content={titleRu}
                        onChange={setTitleRu}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-ru-${id}-${loaded}`}
                        content={textRu}
                        onChange={setTextRu}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-en-${id}-${loaded}`}
                        content={titleEn}
                        onChange={setTitleEn}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-en-${id}-${loaded}`}
                        content={textEn}
                        onChange={setTextEn}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-tk-${id}-${loaded}`}
                        content={titleTk}
                        onChange={setTitleTk}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-tk-${id}-${loaded}`}
                        content={textTk}
                        onChange={setTextTk}
                      />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Gallery of pictures
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Загрузите новые файлы, чтобы заменить галерею целиком. Без
                  загрузки останутся текущие изображения.
                </p>
                <ImageUploader
                  files={galleryFiles}
                  setFiles={setGalleryFiles}
                />
                {galleryObjectUrls.length > 0 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {galleryObjectUrls.map((url, index) => (
                      <div
                        key={`${galleryFiles[index]?.name}-${index}`}
                        className="shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
                      >
                        <div className="h-48 w-32 rounded-lg bg-[#f3f4f6]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="size-full rounded-lg object-cover"
                          />
                        </div>
                        <div className="pt-5">
                          <button
                            type="button"
                            onClick={() => setGalleryPreviewUrl(url)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#708DB8] py-2 text-sm font-medium text-white transition hover:bg-[#5f7ba6]"
                          >
                            <EyeIcon className="size-4" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : storedGallery.length > 0 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {storedGallery.map((src, index) => {
                      const resolved = resolveBlogImageSrc(src);
                      if (!resolved) return null;
                      return (
                        <div
                          key={`${src}-${index}`}
                          className="shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
                        >
                          <div className="h-48 w-32 rounded-lg bg-[#f3f4f6]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolved}
                              alt=""
                              className="size-full rounded-lg object-cover"
                            />
                          </div>
                          <div className="pt-5">
                            <button
                              type="button"
                              onClick={() => setGalleryPreviewUrl(resolved)}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#708DB8] py-2 text-sm font-medium text-white transition hover:bg-[#5f7ba6]"
                            >
                              <EyeIcon className="size-4" />
                              View
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-b-xl bg-[#708DB8] py-3 text-lg font-semibold tracking-wide text-white uppercase transition hover:bg-[#5f7ba6] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
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
      </div>
    </div>
  );
};

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

export default EditBlogPage;
