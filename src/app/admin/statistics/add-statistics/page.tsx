"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

const AddStatisticsPage = () => {
  const router = useRouter();
  const api = useApi();

  const [isOpen, setIsOpen] = useState(true);
  const [titleTk, setTitleTk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [countInput, setCountInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSaveError("");

    const titles = [titleTk, titleEn, titleRu].map((t) => t.trim());
    if (titles.some((t) => !t)) {
      setValidationError("Please fill in all title fields.");
      return;
    }

    const count = Number(countInput);
    if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
      setValidationError("Count must be a non-negative integer.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/statistics", {
        title_tk: titles[0],
        title_en: titles[1],
        title_ru: titles[2],
        count,
      });
      router.push("/admin/statistics");
    } catch (error) {
      console.error("Ошибка при добавлении statistic:", error);
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
              New statistic
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
              {saveError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {saveError}
                </p>
              ) : null}

              <Field label="Title (TK):">
                <input
                  value={titleTk}
                  onChange={(e) => setTitleTk(e.target.value)}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  placeholder="Turkmen title"
                  autoComplete="off"
                />
              </Field>
              <Field label="Title (EN):">
                <input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  placeholder="English title"
                  autoComplete="off"
                />
              </Field>
              <Field label="Title (RU):">
                <input
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  placeholder="Russian title"
                  autoComplete="off"
                />
              </Field>
              <Field label="Count:">
                <input
                  value={countInput}
                  onChange={(e) => setCountInput(e.target.value)}
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  placeholder="0"
                />
              </Field>
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

export default AddStatisticsPage;
