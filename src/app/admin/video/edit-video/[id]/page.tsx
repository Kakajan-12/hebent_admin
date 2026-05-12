"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import Sidebar from "@/Components/Sidebar";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";

type VideoForm = {
  video: string;
};

type VideoResponse = VideoForm & {
  id: number;
};

const EditVideoPage = () => {
  const params = useParams();
  const router = useRouter();
  const api = useApi();

  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [isOpen, setIsOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<VideoForm>({ video: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(
    () => (files[0] ? URL.createObjectURL(files[0]) : ""),
    [files],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/video");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get<VideoResponse[] | VideoResponse>(
          `/api/videos/${id}`,
        );
        const item = Array.isArray(response) ? response[0] : response;
        if (!item) {
          throw new Error("Video not found");
        }
        setData({
          video: item.video ?? "",
        });
      } catch (error) {
        console.error("Не удалось загрузить video", error);
        if (getApiErrorStatus(error) === 401) {
          router.push("/");
          return;
        }
        setFetchError("Ошибка при загрузке данных");
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [api, id, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFiles(file ? [file] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setValidationError("");

    const file = files[0];
    if (!file) {
      setValidationError("Please select video file.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("video", file);

      await api.put(`/api/videos/${id}`, formData);
      router.push("/admin/video");
    } catch (error) {
      console.error("Не удалось обновить video", error);
      if (getApiErrorStatus(error) === 401) {
        router.push("/");
        return;
      }
      setSaveError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center py-10 ml-79 mr-7">
          <p className="mt-8">
            <ClipLoader size={80} color="#708DB8" />
          </p>
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

  const currentVideoUrl = data.video ? buildApiUrl(data.video).trim() : "";

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen py-10 ml-79 mr-7">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">Edit video</h2>
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
              {saveError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {saveError}
                </p>
              ) : null}

              {currentVideoUrl ? (
                <Field label="Current video:">
                  <video
                    src={currentVideoUrl}
                    className="h-52 w-full rounded-lg bg-black object-contain"
                    controls
                    preload="metadata"
                  />
                </Field>
              ) : null}

              <Field label="New video file:">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                />
              </Field>

              {previewUrl ? (
                <Field label="New video preview:">
                  <video
                    src={previewUrl}
                    className="h-52 w-full rounded-lg bg-black object-contain"
                    controls
                    preload="metadata"
                  />
                </Field>
              ) : null}
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
    <span className="mb-2 block text-sm font-medium text-[#374151]">{label}</span>
    {children}
  </div>
);

export default EditVideoPage;
