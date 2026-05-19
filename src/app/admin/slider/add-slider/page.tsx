"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import ImageUploader from "./ImageUploader";
import { useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const AddSlider = () => {
  const router = useRouter();
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [serviceNameTk, setServiceNameTk] = useState("");
  const [serviceNameEn, setServiceNameEn] = useState("");
  const [serviceNameRu, setServiceNameRu] = useState("");
  const [titleTk, setTitleTk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [textTk, setTextTk] = useState("");
  const [textEn, setTextEn] = useState("");
  const [textRu, setTextRu] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imageObjectUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const urls = [...imageObjectUrls];
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageObjectUrls]);

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
      { label: "Turkmen service name", value: serviceNameTk },
      { label: "English service name", value: serviceNameEn },
      { label: "Russian service name", value: serviceNameRu },
    ];

    const image = imageFiles[0];

    if (!image) {
      setError("Please select an image.");
      return;
    }

    const emptyField = requiredFields.find((field) => !hasText(field.value));
    if (emptyField) {
      setError(`Please fill in ${emptyField.label}.`);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("service_name_tk", serviceNameTk);
    formData.append("service_name_en", serviceNameEn);
    formData.append("service_name_ru", serviceNameRu);
    formData.append("title_tk", titleTk);
    formData.append("title_en", titleEn);
    formData.append("title_ru", titleRu);
    formData.append("text_tk", textTk);
    formData.append("text_en", textEn);
    formData.append("text_ru", textRu);

    try {
      setSaving(true);
      await api.post("/api/services", formData);
      router.push("/admin/slider");
    } catch (err) {
      console.error("Ошибка при добавлении услуги:", err);
      setError(
        "Ошибка при добавлении услуги. Проверьте данные и попробуйте снова.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex">
      <div className="flex-1">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full  rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <h2 className="text-xl font-semibold">New slider</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
            {error ? (
              <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </button>

          {isOpen && (
            <div className="px-6 pb-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Image</label>
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
                  <TabsList className="bg-[#E5ECF6] border border-[#D9D9D9] min-w-xl">
                    <TabsTrigger value="russian" className="text-sm ">
                      Russian
                    </TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="russian" className="pt-4 space-y-4">
                    <Field
                      label="Service name:"
                      className="text-sm font-medium"
                    >
                      <TipTapEditor
                        content={serviceNameRu}
                        onChange={setServiceNameRu}
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor content={titleRu} onChange={setTitleRu} />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor content={textRu} onChange={setTextRu} />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="pt-4 space-y-4">
                    <Field
                      label="Service name:"
                      className="text-sm font-medium"
                    >
                      <TipTapEditor
                        content={serviceNameEn}
                        onChange={setServiceNameEn}
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor content={titleEn} onChange={setTitleEn} />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor content={textEn} onChange={setTextEn} />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="pt-4 space-y-4">
                    <Field
                      label="Service name:"
                      className="text-sm font-medium"
                    >
                      <TipTapEditor
                        content={serviceNameTk}
                        onChange={setServiceNameTk}
                      />
                    </Field>
                    <Field label="Title:" className="text-sm font-medium">
                      <TipTapEditor content={titleTk} onChange={setTitleTk} />
                    </Field>
                    <Field label="Text:" className="text-sm font-medium">
                      <TipTapEditor content={textTk} onChange={setTextTk} />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <button
            type="submit"
            className="text-xl w-full rounded-xl bg-[#708DB8] py-2 font-semibold uppercase tracking-wide text-white transition hover:bg-[#D9D9D9]"
            disabled={saving}
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
    <label className="block font-medium mb-2 text-sm">{label}</label>
    {children}
  </div>
);

export default AddSlider;
