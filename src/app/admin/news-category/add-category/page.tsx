"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

const hasText = (value: string) => value.trim().length > 0;

const AddCategory = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [category_tk, setCategoryTk] = useState("");
  const [category_en, setCategoryEn] = useState("");
  const [category_ru, setCategoryRu] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const router = useRouter();
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const requiredFields = [category_tk, category_en, category_ru];
    if (requiredFields.some((field) => !hasText(field))) {
      setValidationError("Please fill in all fields.");
      return;
    }

    const payload = { category_tk, category_en, category_ru };

    try {
      setSaving(true);
      await api.post("/api/news-category", payload);
      router.push("/admin/news-category");
    } catch (error) {
      console.error("Request error", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-79 mr-7">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <h2 className="text-xl font-semibold">New category</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="px-6 pb-6 space-y-4">
              {validationError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {validationError}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="category_tk"
                  className="mb-2 block text-sm font-medium"
                >
                  Turkmen
                </label>
                <input
                  id="category_tk"
                  value={category_tk}
                  onChange={(e) => setCategoryTk(e.target.value)}
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="category_en"
                  className="mb-2 block text-sm font-medium"
                >
                  English
                </label>
                <input
                  id="category_en"
                  value={category_en}
                  onChange={(e) => setCategoryEn(e.target.value)}
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="category_ru"
                  className="mb-2 block text-sm font-medium"
                >
                  Russian
                </label>
                <input
                  id="category_ru"
                  value={category_ru}
                  onChange={(e) => setCategoryRu(e.target.value)}
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="text-xl w-full rounded-xl bg-[#708DB8] py-2 font-semibold uppercase tracking-wide text-white transition hover:bg-[#5f7ba6] disabled:opacity-60"
          >
            {saving ? <ClipLoader color="#fff" size={16} /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
