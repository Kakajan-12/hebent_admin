"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import TipTapEditor from "@/Components/TipTapEditor";
import ImageUploader from "@/app/admin/projects/add-project/ImageUploader";

interface ProjectData {
  id: number;
  image: string;
  title_tk: string;
  title_en: string;
  title_ru: string;
  end_date: string;
  area: string;
  client_tk: string;
  client_en: string;
  client_ru: string;
  start_date: string;
  first_section_tk: string;
  first_section_en: string;
  first_section_ru: string;
  second_section_tk: string;
  second_section_en: string;
  second_section_ru: string;
  third_section_tk: string;
  third_section_en: string;
  third_section_ru: string;
  architect_tk: string;
  architect_en: string;
  architect_ru: string;
  lead_designer_tk: string;
  lead_designer_en: string;
  lead_designer_ru: string;
  interior_designer_tk: string;
  interior_designer_en: string;
  interior_designer_ru: string;
  p_manager_tk: string;
  p_manager_en: string;
  p_manager_ru: string;
  location_id: string;
  type_id: string;
  style_id: string;
  location?: {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
  } | null;
  style?: {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
  } | null;
  type?: {
    id: number;
    title_tk: string;
    title_en: string;
    title_ru: string;
  } | null;
  gallery: string[];
  drawings: string[];
}

const EditProject = () => {
  const [isClient, setIsClient] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [title_tk, setTitleTk] = useState("");
  const [title_en, setTitleEn] = useState("");
  const [title_ru, setTitleRu] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [area, setArea] = useState("");
  const [client_tk, setClientTk] = useState("");
  const [client_en, setClientEn] = useState("");
  const [client_ru, setClientRu] = useState("");
  const [first_section_tk, setFirstSectionTk] = useState("");
  const [first_section_en, setFirstSectionEn] = useState("");
  const [first_section_ru, setFirstSectionRu] = useState("");
  const [second_section_tk, setSecondSectionTk] = useState("");
  const [second_section_en, setSecondSectionEn] = useState("");
  const [second_section_ru, setSecondSectionRu] = useState("");
  const [third_section_tk, setThirdSectionTk] = useState("");
  const [third_section_en, setThirdSectionEn] = useState("");
  const [third_section_ru, setThirdSectionRu] = useState("");
  const [architect_tk, setArchitectTk] = useState("");
  const [architect_en, setArchitectEn] = useState("");
  const [architect_ru, setArchitectRu] = useState("");
  const [lead_designer_tk, setLeadDesignerTk] = useState("");
  const [lead_designer_en, setLeadDesignerEn] = useState("");
  const [lead_designer_ru, setLeadDesignerRu] = useState("");
  const [interior_designer_tk, setInteriorDesignerTk] = useState("");
  const [interior_designer_en, setInteriorDesignerEn] = useState("");
  const [interior_designer_ru, setInteriorDesignerRu] = useState("");
  const [p_manager_tk, setPManagerTk] = useState("");
  const [p_manager_en, setPManagerEn] = useState("");
  const [p_manager_ru, setPManagerRu] = useState("");
  const [location_id, setLocationId] = useState("");
  const [type_id, setTypeId] = useState("");
  const [style_id, setStyleId] = useState("");

  const [types, setTypes] = useState<
    { id: number; type_tk: string; type_en: string; type_ru: string }[]
  >([]);
  const [style, setStyle] = useState<
    { id: number; style_tk: string; style_en: string; style_ru: string }[]
  >([]);
  const [location, setLocation] = useState<
    {
      id: number;
      location_tk: string;
      location_en: string;
      location_ru: string;
    }[]
  >([]);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [existingDrawings, setExistingDrawings] = useState<string[]>([]);
  const [galleryToDelete, setGalleryToDelete] = useState<string[]>([]);
  const [drawingsToDelete, setDrawingsToDelete] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    setIsClient(true);

    const fetchProjectData = async () => {
      try {
        const [projectRes, typesRes, styleRes, locationRes] = await Promise.all(
          [
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/project-type`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/project-style`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/project-location`),
          ],
        );

        if (!projectRes.ok) {
          throw new Error("Project not found");
        }

        const [projectData, typesData, styleData, locationData] =
          await Promise.all([
            projectRes.json(),
            typesRes.json(),
            styleRes.json(),
            locationRes.json(),
          ]);

        setTitleTk(projectData.title_tk || "");
        setTitleEn(projectData.title_en || "");
        setTitleRu(projectData.title_ru || "");
        setStartDate(projectData.start_date?.toString() || "");
        setEndDate(projectData.end_date?.toString() || "");
        setArea(projectData.area || "");
        setClientTk(projectData.client_tk || "");
        setClientEn(projectData.client_en || "");
        setClientRu(projectData.client_ru || "");
        setFirstSectionTk(projectData.first_section_tk || "");
        setFirstSectionEn(projectData.first_section_en || "");
        setFirstSectionRu(projectData.first_section_ru || "");
        setSecondSectionTk(projectData.second_section_tk || "");
        setSecondSectionEn(projectData.second_section_en || "");
        setSecondSectionRu(projectData.second_section_ru || "");
        setThirdSectionTk(projectData.third_section_tk || "");
        setThirdSectionEn(projectData.third_section_en || "");
        setThirdSectionRu(projectData.third_section_ru || "");
        setArchitectTk(projectData.architect_tk || "");
        setArchitectEn(projectData.architect_en || "");
        setArchitectRu(projectData.architect_ru || "");
        setLeadDesignerTk(projectData.lead_designer_tk || "");
        setLeadDesignerEn(projectData.lead_designer_en || "");
        setLeadDesignerRu(projectData.lead_designer_ru || "");
        setInteriorDesignerTk(projectData.interior_designer_tk || "");
        setInteriorDesignerEn(projectData.interior_designer_en || "");
        setInteriorDesignerRu(projectData.interior_designer_ru || "");
        setPManagerTk(projectData.p_manager_tk || "");
        setPManagerEn(projectData.p_manager_en || "");
        setPManagerRu(projectData.p_manager_ru || "");
        setLocationId(projectData.location_id?.toString() || "");
        setTypeId(projectData.type_id?.toString() || "");
        setStyleId(projectData.style_id?.toString() || "");

        if (projectData.image) {
          setPreviewImage(
            `${process.env.NEXT_PUBLIC_API_URL}/${projectData.image}`,
          );
        }

        setExistingGallery(projectData.gallery || []);
        setExistingDrawings(projectData.drawings || []);

        setTypes(typesData);
        setStyle(styleData);
        setLocation(locationData);

        setIsLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleImageDelete = () => {
    setImage(null);
    setPreviewImage("");
  };

  const handleGalleryImageDelete = (imageUrl: string) => {
    setExistingGallery((prev) => prev.filter((img) => img !== imageUrl));
    setGalleryToDelete((prev) => [...prev, imageUrl]);
  };

  const handleDrawingImageDelete = (imageUrl: string) => {
    setExistingDrawings((prev) => prev.filter((img) => img !== imageUrl));
    setDrawingsToDelete((prev) => [...prev, imageUrl]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("Нет токена. Пользователь не авторизован.");
      return;
    }

    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    formData.append("title_tk", title_tk ?? "");
    formData.append("title_en", title_en ?? "");
    formData.append("title_ru", title_ru ?? "");
    formData.append("end_date", endDate ?? "");
    formData.append("area", area ?? "");
    formData.append("client_tk", client_tk ?? "");
    formData.append("client_en", client_en ?? "");
    formData.append("client_ru", client_ru ?? "");
    formData.append("start_date", startDate ?? "");
    formData.append("first_section_tk", first_section_tk ?? "");
    formData.append("first_section_en", first_section_en ?? "");
    formData.append("first_section_ru", first_section_ru ?? "");
    formData.append("second_section_tk", second_section_tk ?? "");
    formData.append("second_section_en", second_section_en ?? "");
    formData.append("second_section_ru", second_section_ru ?? "");
    formData.append("third_section_tk", third_section_tk ?? "");
    formData.append("third_section_en", third_section_en ?? "");
    formData.append("third_section_ru", third_section_ru ?? "");
    formData.append("architect_tk", architect_tk ?? "");
    formData.append("architect_en", architect_en ?? "");
    formData.append("architect_ru", architect_ru ?? "");
    formData.append("lead_designer_tk", lead_designer_tk ?? "");
    formData.append("lead_designer_en", lead_designer_en ?? "");
    formData.append("lead_designer_ru", lead_designer_ru ?? "");
    formData.append("interior_designer_tk", interior_designer_tk ?? "");
    formData.append("interior_designer_en", interior_designer_en ?? "");
    formData.append("interior_designer_ru", interior_designer_ru ?? "");
    formData.append("p_manager_tk", p_manager_tk ?? "");
    formData.append("p_manager_en", p_manager_en ?? "");
    formData.append("p_manager_ru", p_manager_ru ?? "");
    formData.append("location_id", location_id ?? "");
    formData.append("type_id", type_id ?? "");
    formData.append("style_id", style_id ?? "");

    for (const file of galleryFiles) {
      formData.append("gallery", file);
    }

    for (const file of drawingFiles) {
      formData.append("drawings", file);
    }

    if (galleryToDelete.length > 0) {
      formData.append("gallery_to_delete", JSON.stringify(galleryToDelete));
    }

    if (drawingsToDelete.length > 0) {
      formData.append("drawings_to_delete", JSON.stringify(drawingsToDelete));
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Проект обновлен!", data);
        router.push("/admin/projects");
      } else {
        const errorText = await response.text();
        console.error("Ошибка при обновлении:", errorText);
      }
    } catch (error) {
      console.error("Ошибка запроса", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-200">
        <Sidebar />
        <div className="flex-1 p-10 ml-62 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка данных проекта...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-200">
      <Sidebar />
      <div className="flex-1 p-10 ml-62">
        <TokenTimer />
        <div className="mt-8">
          <form
            onSubmit={handleSubmit}
            className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
          >
            <h2 className="text-2xl font-bold mb-4 text-left">Edit project</h2>

            <div className="mb-4 flex space-x-4">
              <div className="w-full">
                <label
                  htmlFor="image"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Main Image:
                </label>
                {previewImage && (
                  <div className="mb-4 relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                      setPreviewImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                />
                {!previewImage && (
                  <p className="text-sm text-gray-500 mt-1">
                    Выберите новое изображение или оставьте текущее
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Type:
                </label>
                <select
                  id="project_type"
                  name="type_id"
                  value={type_id}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select style:
                </label>
                <select
                  id="project_style"
                  name="style_id"
                  value={style_id}
                  onChange={(e) => setStyleId(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select category</option>
                  {style.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.style_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Location:
                </label>
                <select
                  id="location_id"
                  name="location_id"
                  value={location_id}
                  onChange={(e) => setLocationId(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                >
                  <option value="">Select location</option>
                  {location.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.location_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 flex space-x-4">
              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  Start year:
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                  placeholder="2020"
                />
              </div>

              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  End year:
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 10}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                  placeholder="2024"
                />
              </div>

              <div className="w-full">
                <label className="block text-gray-700 font-semibold mb-2">
                  Area:
                </label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  type="text"
                  required
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
            </div>

            {isClient && (
              <>
                <div className="tabs tabs-lift">
                  <input
                    type="radio"
                    name="my_tabs_3"
                    className="tab"
                    aria-label="Turkmen"
                    defaultChecked
                  />
                  <div className="tab-content bg-base-100 border-base-300 p-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Title:
                      </label>
                      <TipTapEditor
                        content={title_tk}
                        onChange={(content) => setTitleTk(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Client:
                      </label>
                      <input
                        value={client_tk}
                        onChange={(e) => setClientTk(e.target.value)}
                        type="text"
                        required
                        className="border border-gray-300 rounded p-2 w-full"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        First section:
                      </label>
                      <TipTapEditor
                        content={first_section_tk}
                        onChange={(content) => setFirstSectionTk(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Second section:
                      </label>
                      <TipTapEditor
                        content={second_section_tk}
                        onChange={(content) => setSecondSectionTk(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Third section:
                      </label>
                      <TipTapEditor
                        content={third_section_tk}
                        onChange={(content) => setThirdSectionTk(content)}
                      />
                    </div>
                    <div className="flex w-full space-x-4">
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Architect:
                        </label>
                        <input
                          value={architect_tk}
                          onChange={(e) => setArchitectTk(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Lead designer:
                        </label>
                        <input
                          value={lead_designer_tk}
                          onChange={(e) => setLeadDesignerTk(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Interior designer:
                        </label>
                        <input
                          value={interior_designer_tk}
                          onChange={(e) =>
                            setInteriorDesignerTk(e.target.value)
                          }
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Project manager:
                        </label>
                        <input
                          value={p_manager_tk}
                          onChange={(e) => setPManagerTk(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="my_tabs_3"
                    className="tab"
                    aria-label="English"
                  />
                  <div className="tab-content bg-base-100 border-base-300 p-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Title:
                      </label>
                      <TipTapEditor
                        content={title_en}
                        onChange={(content) => setTitleEn(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Client:
                      </label>
                      <input
                        value={client_en}
                        onChange={(e) => setClientEn(e.target.value)}
                        type="text"
                        required
                        className="border border-gray-300 rounded p-2 w-full"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        First section:
                      </label>
                      <TipTapEditor
                        content={first_section_en}
                        onChange={(content) => setFirstSectionEn(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Second section:
                      </label>
                      <TipTapEditor
                        content={second_section_en}
                        onChange={(content) => setSecondSectionEn(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Third section:
                      </label>
                      <TipTapEditor
                        content={third_section_en}
                        onChange={(content) => setThirdSectionEn(content)}
                      />
                    </div>
                    <div className="flex w-full space-x-4">
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Architect:
                        </label>
                        <input
                          value={architect_en}
                          onChange={(e) => setArchitectEn(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Lead designer:
                        </label>
                        <input
                          value={lead_designer_en}
                          onChange={(e) => setLeadDesignerEn(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Interior designer:
                        </label>
                        <input
                          value={interior_designer_en}
                          onChange={(e) =>
                            setInteriorDesignerEn(e.target.value)
                          }
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Project manager:
                        </label>
                        <input
                          value={p_manager_en}
                          onChange={(e) => setPManagerEn(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="my_tabs_3"
                    className="tab"
                    aria-label="Russian"
                  />
                  <div className="tab-content bg-base-100 border-base-300 p-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Title:
                      </label>
                      <TipTapEditor
                        content={title_ru}
                        onChange={(content) => setTitleRu(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Client:
                      </label>
                      <input
                        value={client_ru}
                        onChange={(e) => setClientRu(e.target.value)}
                        type="text"
                        required
                        className="border border-gray-300 rounded p-2 w-full"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        First section:
                      </label>
                      <TipTapEditor
                        content={first_section_ru}
                        onChange={(content) => setFirstSectionRu(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Second section:
                      </label>
                      <TipTapEditor
                        content={second_section_ru}
                        onChange={(content) => setSecondSectionRu(content)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Third section:
                      </label>
                      <TipTapEditor
                        content={third_section_ru}
                        onChange={(content) => setThirdSectionRu(content)}
                      />
                    </div>
                    <div className="flex w-full space-x-4">
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Architect:
                        </label>
                        <input
                          value={architect_ru}
                          onChange={(e) => setArchitectRu(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Lead designer:
                        </label>
                        <input
                          value={lead_designer_ru}
                          onChange={(e) => setLeadDesignerRu(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Interior designer:
                        </label>
                        <input
                          value={interior_designer_ru}
                          onChange={(e) =>
                            setInteriorDesignerRu(e.target.value)
                          }
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                      <div className="mb-4 w-full">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Project manager:
                        </label>
                        <input
                          value={p_manager_ru}
                          onChange={(e) => setPManagerRu(e.target.value)}
                          type="text"
                          required
                          className="border border-gray-300 rounded p-2 w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="my_tabs_3"
                    className="tab"
                    aria-label="Gallery"
                  />
                  <div className="tab-content bg-base-100 border-base-300 p-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Existing Gallery Images:
                      </label>
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {existingGallery.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleGalleryImageDelete(img)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <label className="block text-gray-700 font-semibold mb-2">
                        Add New Gallery Images:
                      </label>
                      <ImageUploader
                        label="Gallery"
                        files={galleryFiles}
                        setFiles={setGalleryFiles}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Existing Drawing Images:
                      </label>
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {existingDrawings.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                              alt={`Drawing ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleDrawingImageDelete(img)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <label className="block text-gray-700 font-semibold mb-2">
                        Add New Drawing Images:
                      </label>
                      <ImageUploader
                        label="Drawings"
                        files={drawingFiles}
                        setFiles={setDrawingFiles}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-150"
              >
                Update project
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded transition duration-150"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProject;
