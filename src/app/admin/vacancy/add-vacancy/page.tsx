"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import TipTapEditor from "@/Components/TipTapEditor";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/Components/ui/tabs";
import { useApi } from "@/hooks/useApi";

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const AddVacancy = () => {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [title_tk, setTitleTk] = useState("");
  const [title_en, setTitleEn] = useState("");
  const [title_ru, setTitleRu] = useState("");
  const [text_tk, setTextTk] = useState("");
  const [text_en, setTextEn] = useState("");
  const [text_ru, setTextRu] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const requiredFields = [
      title_tk,
      title_en,
      title_ru,
      text_tk,
      text_en,
      text_ru,
    ];

    if (requiredFields.some((field) => !hasText(field))) {
      setValidationError("Please fill in all fields in all languages.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/vacancy", {
        title_tk,
        title_en,
        title_ru,
        text_tk,
        text_en,
        text_ru,
      });
      router.push("/admin/vacancy");
    } catch (error) {
      console.error("Ошибка при добавлении вакансии:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">
              New vacancy
            </h2>
            <FiChevronDown
              className={`size-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#eee] px-6 pb-6 pt-6">
              {validationError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {validationError}
                </p>
              ) : null}

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

export default AddVacancy;
