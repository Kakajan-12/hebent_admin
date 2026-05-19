"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Image from "next/image";
import TipTapEditor from "@/Components/TipTapEditor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import {
  buildApiUrl,
  getApiErrorStatus,
  getImagePath,
  useApi,
} from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";
type Data = {
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
  image: unknown;
  category_id: number;
};

const EditNews = () => {
  const { id } = useParams();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState<Data>({
    title_tk: "",
    title_en: "",
    title_ru: "",
    text_tk: "",
    text_en: "",
    text_ru: "",
    image: "",
    category_id: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [category, setCategory] = useState<
    { id: number; category_en: string }[]
  >([]);
  const api = useApi();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await api.get<{ id: number; category_en: string }[]>(
          "/api/news-category",
          { withAuth: false },
        );
        setCategory(Array.isArray(categories) ? categories : []);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      }
    };

    fetchCategories();
  }, [api]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await api.get<Data[] | Data>(`/api/news/${id}`);
        const news = Array.isArray(response) ? response[0] : response;

        if (news) {
          setData({ ...news });
        } else {
          throw new Error("Данные не найдены");
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

  const handleEditorChange = (name: keyof Data, content: string) => {
    setData((prev) => ({ ...prev, [name]: content }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append("title_tk", data.title_tk);
      formData.append("title_en", data.title_en);
      formData.append("title_ru", data.title_ru);
      formData.append("text_tk", data.text_tk);
      formData.append("text_en", data.text_en);
      formData.append("text_ru", data.text_ru);
      formData.append("category_id", String(data.category_id));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.put(`/api/news/${id}`, formData);

      router.push(`/admin/news`);
    } catch (err) {
      console.error(err);
      setSaveError("Ошибка при сохранении");

      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <div className="flex-1 py-10">
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
        <div className="flex-1 py-10">
          <p className="mt-8 text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  const imagePath = getImagePath(data.image);
  const imageSrc = imagePath ? buildApiUrl(imagePath) : "";

  return (
    <div className="flex">
      <div className="flex-1">
        {saveError ? (
          <p className="mt-4 text-sm text-red-600">{saveError}</p>
        ) : null}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <h2 className="text-xl font-semibold">Edit news</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 px-6 pb-6">
              {imageSrc ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    Current image
                  </p>
                  <Image
                    src={imageSrc}
                    alt="News"
                    width={200}
                    height={200}
                    className="max-h-48 max-w-xs rounded-lg object-cover"
                    unoptimized
                  />
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="image"
                    className="mb-2 block text-sm font-medium"
                  >
                    News cover image
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category_id"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={data.category_id || ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        category_id: Number(e.target.value),
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="">Select category</option>
                    {category.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_en}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-ru-${id}`}
                        content={data.title_ru}
                        onChange={(c) => handleEditorChange("title_ru", c)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-ru-${id}`}
                        content={data.text_ru}
                        onChange={(c) => handleEditorChange("text_ru", c)}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="english" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-en-${id}`}
                        content={data.title_en}
                        onChange={(c) => handleEditorChange("title_en", c)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-en-${id}`}
                        content={data.text_en}
                        onChange={(c) => handleEditorChange("text_en", c)}
                      />
                    </Field>
                  </TabsContent>

                  <TabsContent value="turkmen" className="space-y-4 pt-4">
                    <Field label="Title:">
                      <TipTapEditor
                        key={`title-tk-${id}`}
                        content={data.title_tk}
                        onChange={(c) => handleEditorChange("title_tk", c)}
                      />
                    </Field>
                    <Field label="Text:">
                      <TipTapEditor
                        key={`text-tk-${id}`}
                        content={data.text_tk}
                        onChange={(c) => handleEditorChange("text_tk", c)}
                      />
                    </Field>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <button
            type="submit"
            className="text-xl w-full rounded-xl bg-[#708DB8] py-2 font-semibold uppercase tracking-wide text-white transition hover:bg-[#D9D9D9]"
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
    <label className="mb-2 block text-sm font-medium">{label}</label>
    {children}
  </div>
);

export default EditNews;
