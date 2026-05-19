"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { GoChevronRight } from "react-icons/go";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { useApi } from "@/hooks/useApi";
import ImageUploaderHero from "./ImageUploaderHero";
import ImageUploader from "@/app/admin/slider/add-slider/ImageUploader";
import { ClipLoader } from "react-spinners";
import { TrashIcon } from "lucide-react";

const MAX_GALLERY_FILES = 20;

type ProjectDetail = {
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
};

const createEmptyDetail = (): ProjectDetail => ({
  title_tk: "",
  title_en: "",
  title_ru: "",
  text_tk: "",
  text_en: "",
  text_ru: "",
});

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const AddProject = () => {
  const router = useRouter();
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [titleTk, setTitleTk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [textTk, setTextTk] = useState("");
  const [textEn, setTextEn] = useState("");
  const [textRu, setTextRu] = useState("");
  const [details, setDetails] = useState<ProjectDetail[]>([]);
  const [openDetails, setOpenDetails] = useState<boolean[]>([]);
  const [costumerTk, setCostumerTk] = useState("");
  const [costumerEn, setCostumerEn] = useState("");
  const [costumerRu, setCostumerRu] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imageObjectUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  const galleryObjectUrls = useMemo(
    () => galleryFiles.map((file) => URL.createObjectURL(file)),
    [galleryFiles],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const urls = [...imageObjectUrls, ...galleryObjectUrls];
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageObjectUrls, galleryObjectUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const requiredFields = [
      { label: "Turkmen title", value: titleTk },
      { label: "English title", value: titleEn },
      { label: "Russian title", value: titleRu },
      { label: "Turkmen text", value: textTk },
      { label: "English text", value: textEn },
      { label: "Russian text", value: textRu },
      { label: "Turkmen costumer", value: costumerTk },
      { label: "English costumer", value: costumerEn },
      { label: "Russian costumer", value: costumerRu },
      { label: "Website", value: website },
    ];

    const image = imageFiles[0];

    if (!image) {
      setError("Please select an image.");
      return;
    }

    if (galleryFiles.length === 0) {
      setError("Please select at least one gallery photo.");
      return;
    }

    if (details.length === 0) {
      setError("Please add at least one detail.");
      return;
    }

    const emptyField = requiredFields.find((field) => !hasText(field.value));
    if (emptyField) {
      setError(`Please fill in ${emptyField.label}.`);
      return;
    }

    const emptyDetail = details
      .flatMap((detail, index) => [
        { label: `Detail ${index + 1} Turkmen title`, value: detail.title_tk },
        { label: `Detail ${index + 1} English title`, value: detail.title_en },
        { label: `Detail ${index + 1} Russian title`, value: detail.title_ru },
        { label: `Detail ${index + 1} Turkmen text`, value: detail.text_tk },
        { label: `Detail ${index + 1} English text`, value: detail.text_en },
        { label: `Detail ${index + 1} Russian text`, value: detail.text_ru },
      ])
      .find((field) => !hasText(field.value));

    if (emptyDetail) {
      setError(`Please fill in ${emptyDetail.label}.`);
      return;
    }

    if (galleryFiles.length > MAX_GALLERY_FILES) {
      setError(`You can add up to ${MAX_GALLERY_FILES} gallery photos.`);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    galleryFiles.forEach((file) => {
      formData.append("gallery", file);
    });
    formData.append("title_tk", titleTk);
    formData.append("title_en", titleEn);
    formData.append("title_ru", titleRu);
    formData.append("text_tk", textTk);
    formData.append("text_en", textEn);
    formData.append("text_ru", textRu);
    formData.append("costumer_tk", costumerTk);
    formData.append("costumer_en", costumerEn);
    formData.append("costumer_ru", costumerRu);
    formData.append("website", website);
    formData.append("details", JSON.stringify(details));

    try {
      setSaving(true);
      await api.post("/api/projects", formData);
      router.push("/admin/projects");
    } catch (err) {
      console.error("Ошибка при добавлении проекта:", err);
      setError(
        "Ошибка при добавлении проекта. Проверьте данные и попробуйте снова.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateDetail = (
    index: number,
    field: keyof ProjectDetail,
    value: string,
  ) => {
    setDetails((prev) =>
      prev.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail,
      ),
    );
  };

  const addDetail = () => {
    setDetails((prev) => [...prev, createEmptyDetail()]);
    setOpenDetails((prev) => [...prev, true]);
  };

  const removeDetail = (index: number) => {
    setDetails((prev) =>
      prev.filter((_, detailIndex) => detailIndex !== index),
    );
    setOpenDetails((prev) =>
      prev.filter((_, detailIndex) => detailIndex !== index),
    );
  };

  const toggleDetail = (index: number) => {
    setOpenDetails((prev) =>
      prev.map((isOpen, detailIndex) =>
        detailIndex === index ? !isOpen : isOpen,
      ),
    );
  };

  return (
    <div className="flex min-h-screen">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-2xl font-bold">Add project</h2>

        {error ? (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mb-6 flex flex-col gap-4">
          <Field label="Image:">
            <ImageUploader
              files={imageFiles}
              setFiles={setImageFiles}
              replaceOnDrop
              maxFiles={1}
            />
            {/* {imageObjectUrls.length > 0 ? (
                <PreviewCards
                  files={imageFiles}
                  urls={imageObjectUrls}
                  onPreview={setPreviewUrl}
                  onRemove={(index) =>
                    setImageFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ) : null} */}
          </Field>
          <Field label="Website:">
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="text"
              placeholder="https://example.com"
              className="w-full rounded border border-gray-300 p-2"
            />
          </Field>
        </div>

        {isClient && (
          <Tabs defaultValue="turkmen">
            <TabsList>
              <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="russian">Russian</TabsTrigger>
            </TabsList>

            <TabsContent value="turkmen" className="space-y-4 pt-4">
              <Field label="Title:">
                <TipTapEditor content={titleTk} onChange={setTitleTk} />
              </Field>
              <Field label="Text:">
                <TipTapEditor content={textTk} onChange={setTextTk} />
              </Field>
              <Field label="Costumer:">
                <TipTapEditor content={costumerTk} onChange={setCostumerTk} />
              </Field>
            </TabsContent>

            <TabsContent value="english" className="space-y-4 pt-4">
              <Field label="Title:">
                <TipTapEditor content={titleEn} onChange={setTitleEn} />
              </Field>
              <Field label="Text:">
                <TipTapEditor content={textEn} onChange={setTextEn} />
              </Field>
              <Field label="Costumer:">
                <TipTapEditor content={costumerEn} onChange={setCostumerEn} />
              </Field>
            </TabsContent>

            <TabsContent value="russian" className="space-y-4 pt-4">
              <Field label="Title:">
                <TipTapEditor content={titleRu} onChange={setTitleRu} />
              </Field>
              <Field label="Text:">
                <TipTapEditor content={textRu} onChange={setTextRu} />
              </Field>
              <Field label="Costumer:">
                <TipTapEditor content={costumerRu} onChange={setCostumerRu} />
              </Field>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 rounded-xl border border-[#D9D9D9] p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Details</h3>
            <button
              type="button"
              onClick={addDetail}
              className="rounded bg-[#708DB8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7ba6]"
            >
              Add detail
            </button>
          </div>

          {details.length > 0 ? (
            <div className="space-y-4">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#e5e7eb] bg-white p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleDetail(index)}
                      className="flex items-center gap-2 text-left font-semibold text-[#1f2937]"
                    >
                      <GoChevronRight
                        className={`size-5 text-[#A3C8FF] transition-transform ${
                          openDetails[index] ? "rotate-90" : ""
                        }`}
                        aria-hidden
                      />
                      Detail {index + 1}
                      {/* <span className="ml-2 text-sm font-normal text-gray-500">
                          {openDetails[index] ? "Collapse" : "Expand"}
                        </span> */}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDetail(index)}
                        className="inline-flex items-center gap-2 rounded border border-[#D9D9D9] px-3 py-1.5 text-sm font-semibold transition hover:bg-gray-50"
                      >
                        <GoChevronRight
                          className={`size-4 text-black transition-transform ${
                            openDetails[index] ? "rotate-90" : ""
                          }`}
                          aria-hidden
                        />
                        {/* {openDetails[index] ? "Collapse" : "Expand"} */}
                      </button>
                      {/* <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#708DB8] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="size-5" />
                <span className="text-sm">Delete</span>
              </button> */}
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="rounded flex items-center gap-2 bg-[#708DB8] px-3 py-1.5 text-sm font-semibold text-white transition hover:text-black hover:bg-gray-200"
                      >
                        <TrashIcon className="size-5" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>

                  {isClient && openDetails[index] ? (
                    <Tabs defaultValue="turkmen">
                      <TabsList>
                        <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
                        <TabsTrigger value="english">English</TabsTrigger>
                        <TabsTrigger value="russian">Russian</TabsTrigger>
                      </TabsList>

                      <TabsContent value="turkmen" className="space-y-4 pt-4">
                        <Field label="Title:">
                          <TipTapEditor
                            key={`detail-${index}-title-tk`}
                            content={detail.title_tk}
                            onChange={(value) =>
                              updateDetail(index, "title_tk", value)
                            }
                          />
                        </Field>
                        <Field label="Text:">
                          <TipTapEditor
                            key={`detail-${index}-text-tk`}
                            content={detail.text_tk}
                            onChange={(value) =>
                              updateDetail(index, "text_tk", value)
                            }
                          />
                        </Field>
                      </TabsContent>

                      <TabsContent value="english" className="space-y-4 pt-4">
                        <Field label="Title:">
                          <TipTapEditor
                            key={`detail-${index}-title-en`}
                            content={detail.title_en}
                            onChange={(value) =>
                              updateDetail(index, "title_en", value)
                            }
                          />
                        </Field>
                        <Field label="Text:">
                          <TipTapEditor
                            key={`detail-${index}-text-en`}
                            content={detail.text_en}
                            onChange={(value) =>
                              updateDetail(index, "text_en", value)
                            }
                          />
                        </Field>
                      </TabsContent>

                      <TabsContent value="russian" className="space-y-4 pt-4">
                        <Field label="Title:">
                          <TipTapEditor
                            key={`detail-${index}-title-ru`}
                            content={detail.title_ru}
                            onChange={(value) =>
                              updateDetail(index, "title_ru", value)
                            }
                          />
                        </Field>
                        <Field label="Text:">
                          <TipTapEditor
                            key={`detail-${index}-text-ru`}
                            content={detail.text_ru}
                            onChange={(value) =>
                              updateDetail(index, "text_ru", value)
                            }
                          />
                        </Field>
                      </TabsContent>
                    </Tabs>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No details added yet.</p>
          )}
        </div>

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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
              </div>
            ) : null}
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded bg-[#708DB8] px-4 py-3 font-bold text-white transition hover:bg-[#5f7ba6] disabled:opacity-60"
        >
          {saving ? <ClipLoader color="#fff" size={16} /> : "Add project"}
        </button>
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

export default AddProject;
