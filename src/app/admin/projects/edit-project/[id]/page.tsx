"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EyeIcon } from "@heroicons/react/24/outline";
import { GoChevronRight } from "react-icons/go";
import { TrashIcon } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Sidebar from "@/Components/Sidebar";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  buildApiUrl,
  getApiErrorStatus,
  getImagePath,
  useApi,
} from "@/hooks/useApi";
import ImageUploader from "@/app/admin/slider/add-slider/ImageUploader";
import ImageUploaderHero from "../../add-project/ImageUploaderHero";

const MAX_GALLERY_FILES = 20;

type ProjectDetail = {
  id?: number;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
};

type ProjectFormData = {
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
  costumer_tk: string;
  costumer_en: string;
  costumer_ru: string;
  website: string;
};

type ProjectResponse = ProjectFormData & {
  id: number;
  image?: unknown;
  gallery?: unknown[];
  details?: ProjectDetail[];
};

const emptyForm: ProjectFormData = {
  title_tk: "",
  title_en: "",
  title_ru: "",
  text_tk: "",
  text_en: "",
  text_ru: "",
  costumer_tk: "",
  costumer_en: "",
  costumer_ru: "",
  website: "",
};

const createEmptyDetail = (): ProjectDetail => ({
  title_tk: "",
  title_en: "",
  title_ru: "",
  text_tk: "",
  text_en: "",
  text_ru: "",
});

const normalizeDetails = (details: ProjectResponse["details"] = []) =>
  details.map((detail) => ({
    ...(typeof detail.id === "number" ? { id: detail.id } : {}),
    title_tk: detail.title_tk ?? "",
    title_en: detail.title_en ?? "",
    title_ru: detail.title_ru ?? "",
    text_tk: detail.text_tk ?? "",
    text_en: detail.text_en ?? "",
    text_ru: detail.text_ru ?? "",
  }));

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const EditProject = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [details, setDetails] = useState<ProjectDetail[]>([]);
  const [originalDetailIds, setOriginalDetailIds] = useState<number[]>([]);
  const [openDetails, setOpenDetails] = useState<boolean[]>([]);
  const [data, setData] = useState<ProjectFormData>(emptyForm);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get<ProjectResponse[] | ProjectResponse>(
          `/api/projects/${projectId}`,
        );
        const project = Array.isArray(response) ? response[0] : response;

        if (!project) {
          setFetchError("Project not found");
          return;
        }

        setData({
          title_tk: project.title_tk ?? "",
          title_en: project.title_en ?? "",
          title_ru: project.title_ru ?? "",
          text_tk: project.text_tk ?? "",
          text_en: project.text_en ?? "",
          text_ru: project.text_ru ?? "",
          costumer_tk: project.costumer_tk ?? "",
          costumer_en: project.costumer_en ?? "",
          costumer_ru: project.costumer_ru ?? "",
          website: project.website ?? "",
        });

        const imagePath = getImagePath(project.image);
        setExistingImageUrl(imagePath ? buildApiUrl(imagePath) : null);

        setExistingGalleryUrls(
          (project.gallery ?? [])
            .map((galleryItem) => getImagePath(galleryItem))
            .filter((imagePath): imagePath is string => imagePath !== null)
            .map((imagePath) => buildApiUrl(imagePath)),
        );

        const projectDetails = normalizeDetails(project.details);
        setDetails(projectDetails);
        setOriginalDetailIds(
          projectDetails
            .map((detail) => detail.id)
            .filter((id): id is number => typeof id === "number"),
        );
        setOpenDetails(projectDetails.map(() => true));
      } catch (err) {
        console.error("Ошибка при загрузке проекта:", err);
        setFetchError("Ошибка при загрузке проекта");

        if (getApiErrorStatus(err) === 401) {
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [api, projectId, router]);

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    const requiredFields = [
      { label: "Turkmen title", value: data.title_tk },
      { label: "English title", value: data.title_en },
      { label: "Russian title", value: data.title_ru },
      { label: "Turkmen text", value: data.text_tk },
      { label: "English text", value: data.text_en },
      { label: "Russian text", value: data.text_ru },
      { label: "Turkmen costumer", value: data.costumer_tk },
      { label: "English costumer", value: data.costumer_en },
      { label: "Russian costumer", value: data.costumer_ru },
      { label: "Website", value: data.website },
    ];

    if (!existingImageUrl && imageFiles.length === 0) {
      setSaveError("Please select an image.");
      return;
    }

    if (existingGalleryUrls.length + galleryFiles.length === 0) {
      setSaveError("Please select at least one gallery photo.");
      return;
    }

    if (details.length === 0) {
      setSaveError("Please add at least one detail.");
      return;
    }

    const emptyField = requiredFields.find((field) => !hasText(field.value));
    if (emptyField) {
      setSaveError(`Please fill in ${emptyField.label}.`);
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
      setSaveError(`Please fill in ${emptyDetail.label}.`);
      return;
    }

    if (existingGalleryUrls.length + galleryFiles.length > MAX_GALLERY_FILES) {
      setSaveError(`You can add up to ${MAX_GALLERY_FILES} gallery photos.`);
      return;
    }

    const formData = new FormData();
    const image = imageFiles[0];
    if (image) formData.append("image", image);
    galleryFiles.forEach((file) => {
      formData.append("gallery", file);
    });
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      setSaving(true);
      await api.put(`/api/projects/${projectId}`, formData);

      const currentIds = new Set(
        details
          .map((detail) => detail.id)
          .filter((id): id is number => typeof id === "number"),
      );
      const removedIds = originalDetailIds.filter(
        (id) => !currentIds.has(id),
      );

      await Promise.all([
        ...removedIds.map((id) => api.delete(`/api/project-details/${id}`)),
        ...details.map((detail) => {
          const payload = {
            title_tk: detail.title_tk,
            title_en: detail.title_en,
            title_ru: detail.title_ru,
            text_tk: detail.text_tk,
            text_en: detail.text_en,
            text_ru: detail.text_ru,
          };
          if (typeof detail.id === "number") {
            return api.put(`/api/project-details/${detail.id}`, payload);
          }
          return api.post(`/api/project-details`, {
            project_id: Number(projectId),
            ...payload,
          });
        }),
      ]);

      router.push(`/admin/projects`);
    } catch (err) {
      console.error("Ошибка при сохранении проекта:", err);
      setSaveError(
        "Ошибка при сохранении проекта. Проверьте данные и попробуйте снова.",
      );

      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }
  if (fetchError) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <p className="mt-8 text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-10 ml-72">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 w-full rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-2xl font-bold">Edit project</h2>

          {saveError ? (
            <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {saveError}
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
              {imageObjectUrls.length > 0 ? (
                <PreviewCards
                  urls={imageObjectUrls}
                  onPreview={setPreviewUrl}
                  onRemove={(index) =>
                    setImageFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                />
              ) : existingImageUrl ? (
                <PreviewCards
                  urls={[existingImageUrl]}
                  onPreview={setPreviewUrl}
                  onRemove={() => setExistingImageUrl(null)}
                />
              ) : null}
            </Field>
            <Field label="Website:">
              <input
                value={data.website}
                onChange={(e) => handleChange("website", e.target.value)}
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
                  <TipTapEditor
                    key={`title-tk-${projectId}`}
                    content={data.title_tk}
                    onChange={(value) => handleChange("title_tk", value)}
                  />
                </Field>
                <Field label="Text:">
                  <TipTapEditor
                    key={`text-tk-${projectId}`}
                    content={data.text_tk}
                    onChange={(value) => handleChange("text_tk", value)}
                  />
                </Field>
                <Field label="Costumer:">
                  <TipTapEditor
                    key={`costumer-tk-${projectId}`}
                    content={data.costumer_tk}
                    onChange={(value) => handleChange("costumer_tk", value)}
                  />
                </Field>
              </TabsContent>

              <TabsContent value="english" className="space-y-4 pt-4">
                <Field label="Title:">
                  <TipTapEditor
                    key={`title-en-${projectId}`}
                    content={data.title_en}
                    onChange={(value) => handleChange("title_en", value)}
                  />
                </Field>
                <Field label="Text:">
                  <TipTapEditor
                    key={`text-en-${projectId}`}
                    content={data.text_en}
                    onChange={(value) => handleChange("text_en", value)}
                  />
                </Field>
                <Field label="Costumer:">
                  <TipTapEditor
                    key={`costumer-en-${projectId}`}
                    content={data.costumer_en}
                    onChange={(value) => handleChange("costumer_en", value)}
                  />
                </Field>
              </TabsContent>

              <TabsContent value="russian" className="space-y-4 pt-4">
                <Field label="Title:">
                  <TipTapEditor
                    key={`title-ru-${projectId}`}
                    content={data.title_ru}
                    onChange={(value) => handleChange("title_ru", value)}
                  />
                </Field>
                <Field label="Text:">
                  <TipTapEditor
                    key={`text-ru-${projectId}`}
                    content={data.text_ru}
                    onChange={(value) => handleChange("text_ru", value)}
                  />
                </Field>
                <Field label="Costumer:">
                  <TipTapEditor
                    key={`costumer-ru-${projectId}`}
                    content={data.costumer_ru}
                    onChange={(value) => handleChange("costumer_ru", value)}
                  />
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
                    key={`${projectId}-${detail.id ?? index}`}
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
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="flex items-center gap-2 rounded bg-[#708DB8] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-200 hover:text-black"
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
                              key={`detail-${projectId}-${detail.id ?? index}-title-tk`}
                              content={detail.title_tk}
                              onChange={(value) =>
                                updateDetail(index, "title_tk", value)
                              }
                            />
                          </Field>
                          <Field label="Text:">
                            <TipTapEditor
                              key={`detail-${projectId}-${detail.id ?? index}-text-tk`}
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
                              key={`detail-${projectId}-${detail.id ?? index}-title-en`}
                              content={detail.title_en}
                              onChange={(value) =>
                                updateDetail(index, "title_en", value)
                              }
                            />
                          </Field>
                          <Field label="Text:">
                            <TipTapEditor
                              key={`detail-${projectId}-${detail.id ?? index}-text-en`}
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
                              key={`detail-${projectId}-${detail.id ?? index}-title-ru`}
                              content={detail.title_ru}
                              onChange={(value) =>
                                updateDetail(index, "title_ru", value)
                              }
                            />
                          </Field>
                          <Field label="Text:">
                            <TipTapEditor
                              key={`detail-${projectId}-${detail.id ?? index}-text-ru`}
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
                {existingGalleryUrls.length + galleryFiles.length}/
                {MAX_GALLERY_FILES} photos selected
              </p>
              {existingGalleryUrls.length > 0 ? (
                <PreviewCards
                  urls={existingGalleryUrls}
                  onPreview={setPreviewUrl}
                  onRemove={(index) =>
                    setExistingGalleryUrls((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                />
              ) : null}
              {galleryObjectUrls.length > 0 ? (
                <PreviewCards
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

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded bg-[#708DB8] px-4 py-3 font-bold text-white transition hover:bg-[#5f7ba6] disabled:opacity-60"
            >
              {saving ? (
                <ClipLoader color="#fff" size={16} />
              ) : (
                "Update project"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/projects")}
              className="flex-1 rounded bg-gray-300 px-4 py-3 font-bold text-gray-800 transition hover:bg-gray-400"
            >
              Cancel
            </button>
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

export default EditProject;
