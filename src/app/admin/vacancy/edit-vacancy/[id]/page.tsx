"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type VacancyFormData = {
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
};

type VacancyResponse = VacancyFormData & {
  id: number;
};

const EditVacancy = () => {
  const { id } = useParams();
  const router = useRouter();
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState<VacancyFormData>({
    title_tk: "",
    title_en: "",
    title_ru: "",
    text_tk: "",
    text_en: "",
    text_ru: "",
  });
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await api.get<VacancyResponse[] | VacancyResponse>(
          `/api/vacancy/${id}`,
        );
        const vacancy = Array.isArray(response) ? response[0] : response;
        if (!vacancy) throw new Error("Vacancy not found");

        setData({
          title_tk: vacancy.title_tk ?? "",
          title_en: vacancy.title_en ?? "",
          title_ru: vacancy.title_ru ?? "",
          text_tk: vacancy.text_tk ?? "",
          text_en: vacancy.text_en ?? "",
          text_ru: vacancy.text_ru ?? "",
        });
      } catch (err) {
        console.error(err);
        setFetchError("Ошибка при загрузке данных");
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [api, id]);

  const handleEditorChange = (field: keyof VacancyFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    try {
      await api.put(`/api/vacancy/${id}`, data);
      router.push(`/admin/vacancy/view-vacancy/${id}`);
    } catch (err) {
      console.error(err);
      setSaveError("Ошибка при сохранении");
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <div className="flex-1 py-10 flex items-center justify-center">
          <p className="mt-8 text-gray-500">
            <ClipLoader size={80} color="#708DB8" />
          </p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex">
        <div className="flex-1 py-10 flex items-center justify-center">
          <p className="mt-8 text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1">
        {saveError ? (
          <p className="mt-4 text-sm text-red-600">{saveError}</p>
        ) : null}
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
              Edit vacancy
            </h2>
            <FiChevronDown
              className={`size-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#eee] px-6 pb-6 pt-6">
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
                        key={`title-ru-${id}`}
                        content={data.title_ru}
                        onChange={(v) => handleEditorChange("title_ru", v)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-ru-${id}`}
                        content={data.text_ru}
                        onChange={(v) => handleEditorChange("text_ru", v)}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-en-${id}`}
                        content={data.title_en}
                        onChange={(v) => handleEditorChange("title_en", v)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-en-${id}`}
                        content={data.text_en}
                        onChange={(v) => handleEditorChange("text_en", v)}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-tk-${id}`}
                        content={data.title_tk}
                        onChange={(v) => handleEditorChange("title_tk", v)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-tk-${id}`}
                        content={data.text_tk}
                        onChange={(v) => handleEditorChange("text_tk", v)}
                      />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-b-xl bg-[#708DB8] py-3 text-lg font-semibold tracking-wide text-white uppercase transition hover:bg-[#5f7ba6]"
          >
            Save
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

export default EditVacancy;
