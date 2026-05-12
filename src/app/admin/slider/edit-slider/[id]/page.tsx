"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Image from "next/image";
import Sidebar from "@/Components/Sidebar";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import ImageUploader from "../../add-slider/ImageUploader";
import {
  buildApiUrl,
  getApiErrorStatus,
  getImagePath,
  useApi,
} from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type SliderData = {
  service_name_tk: string;
  service_name_en: string;
  service_name_ru: string;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
  image: unknown;
};

type SliderResponse = SliderData & {
  id: number;
};

const emptyForm: SliderData = {
  service_name_tk: "",
  service_name_en: "",
  service_name_ru: "",
  title_tk: "",
  title_en: "",
  title_ru: "",
  text_tk: "",
  text_en: "",
  text_ru: "",
  image: "",
};

const EditSliderPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState<SliderData>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const imageObjectUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  useEffect(() => {
    const urls = [...imageObjectUrls];
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageObjectUrls]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await api.get<SliderResponse[] | SliderResponse>(
          `/api/services/${id}`,
        );
        const slider = Array.isArray(response) ? response[0] : response;

        if (slider) {
          setData({
            service_name_tk: slider.service_name_tk ?? "",
            service_name_en: slider.service_name_en ?? "",
            service_name_ru: slider.service_name_ru ?? "",
            title_tk: slider.title_tk ?? "",
            title_en: slider.title_en ?? "",
            title_ru: slider.title_ru ?? "",
            text_tk: slider.text_tk ?? "",
            text_en: slider.text_en ?? "",
            text_ru: slider.text_ru ?? "",
            image: slider.image ?? "",
          });
        } else {
          throw new Error("Data not found");
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setFetchError("Ошибка при загрузке");
        if (getApiErrorStatus(err) === 401) {
          router.push("/");
        }
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [api, id, router]);

  const handleEditorChange = (name: keyof SliderData, content: string) => {
    setData((prev) => ({ ...prev, [name]: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("service_name_tk", data.service_name_tk);
      formData.append("service_name_en", data.service_name_en);
      formData.append("service_name_ru", data.service_name_ru);
      formData.append("title_tk", data.title_tk);
      formData.append("title_en", data.title_en);
      formData.append("title_ru", data.title_ru);
      formData.append("text_tk", data.text_tk);
      formData.append("text_en", data.text_en);
      formData.append("text_ru", data.text_ru);

      if (imageFiles[0]) {
        formData.append("image", imageFiles[0]);
      }

      await api.put(`/api/services/${id}`, formData);
      router.push("/admin/slider");
    } catch (err) {
      console.error(err);
      setSaveError("Ошибка при сохранении");
      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center py-10 ml-79 mr-7">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7">
          <p className="mt-8 text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  const currentImagePath = getImagePath(data.image);
  const currentImageSrc = currentImagePath ? buildApiUrl(currentImagePath) : "";
  const uploadedImageSrc = imageObjectUrls[0] ?? "";

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-79 mr-7">
        {saveError ? (
          <p className="mt-4 text-sm text-red-600">{saveError}</p>
        ) : null}
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <h2 className="text-xl font-semibold">Edit slider</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 px-6 pb-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Image</label>
                {uploadedImageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadedImageSrc}
                    alt=""
                    className="mb-3 h-24 max-w-xs rounded-lg object-cover"
                  />
                ) : currentImageSrc ? (
                  <Image
                    src={currentImageSrc}
                    alt=""
                    width={160}
                    height={96}
                    className="mb-3 h-24 max-w-xs rounded-lg object-cover"
                    unoptimized
                  />
                ) : null}
                <p className="mb-2 text-xs text-gray-500">
                  Загрузите изображение, чтобы заменить текущее.
                </p>
                <ImageUploader
                  files={imageFiles}
                  setFiles={setImageFiles}
                  replaceOnDrop
                  maxFiles={1}
                  imagesOnly
                />
              </div>

              {isClient && (
                <Tabs defaultValue="russian">
                  <TabsList className="min-w-xl border border-[#D9D9D9] bg-[#E5ECF6]">
                    <TabsTrigger value="russian" className="text-sm">
                      Russian
                    </TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="russian" className="space-y-4 pt-4">
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`service-name-ru-${id}`}
                        content={data.service_name_ru}
                        onChange={(content) =>
                          handleEditorChange("service_name_ru", content)
                        }
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`title-ru-${id}`}
                        content={data.title_ru}
                        onChange={(content) =>
                          handleEditorChange("title_ru", content)
                        }
                      />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`text-ru-${id}`}
                        content={data.text_ru}
                        onChange={(content) =>
                          handleEditorChange("text_ru", content)
                        }
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4 pt-4">
                    <Field label="Service name:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`service-name-en-${id}`}
                        content={data.service_name_en}
                        onChange={(content) =>
                          handleEditorChange("service_name_en", content)
                        }
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`title-en-${id}`}
                        content={data.title_en}
                        onChange={(content) =>
                          handleEditorChange("title_en", content)
                        }
                      />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`text-en-${id}`}
                        content={data.text_en}
                        onChange={(content) =>
                          handleEditorChange("text_en", content)
                        }
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="space-y-4 pt-4">
                    <Field label="Service name:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`service-name-tk-${id}`}
                        content={data.service_name_tk}
                        onChange={(content) =>
                          handleEditorChange("service_name_tk", content)
                        }
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`title-tk-${id}`}
                        content={data.title_tk}
                        onChange={(content) =>
                          handleEditorChange("title_tk", content)
                        }
                      />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor
                        key={`text-tk-${id}`}
                        content={data.text_tk}
                        onChange={(content) =>
                          handleEditorChange("text_tk", content)
                        }
                      />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#708DB8] py-2 text-xl font-semibold uppercase tracking-wide text-white transition hover:bg-[#D9D9D9] disabled:opacity-60"
          >
            {saving ? <ClipLoader color="#fff" size={16} /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-medium">{label}</label>
    {children}
  </div>
);

export default EditSliderPage;
