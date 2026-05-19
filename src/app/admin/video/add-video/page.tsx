"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";

const AddVideoPage = () => {
  const router = useRouter();
  const api = useApi();
  const [isOpen, setIsOpen] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState("");

  const previewUrl = useMemo(
    () => (files[0] ? URL.createObjectURL(files[0]) : ""),
    [files],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFiles(file ? [file] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSaveError("");

    const file = files[0];
    if (!file) {
      setValidationError("Please select video file.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      await api.post("/api/videos", formData);
      router.push("/admin/video");
    } catch (error) {
      console.error("Ошибка при добавлении video:", error);
      if (getApiErrorStatus(error) === 401) {
        router.push("/");
        return;
      }
      setSaveError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">New video</h2>
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

              <Field label="Video file:">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                />
              </Field>

              {previewUrl ? (
                <div className="overflow-hidden rounded-lg border border-[#D9D9D9] p-3">
                  <video
                    src={previewUrl}
                    className="h-52 w-full rounded bg-black object-contain"
                    controls
                    preload="metadata"
                  />
                </div>
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
    <span className="mb-2 block text-sm font-medium text-[#374151]">
      {label}
    </span>
    {children}
  </div>
);

export default AddVideoPage;
