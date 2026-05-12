"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { ClipLoader } from "react-spinners";

const EditCategory = () => {
  const { id } = useParams();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState({
    category_tk: "",
    category_en: "",
    category_ru: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/news-category/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setData(response.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Ошибка при загрузке");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/news-category/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      router.push("/admin/news-category");
    } catch (err) {
      console.error("Error saving:", err);
      setError("Ошибка при сохранении");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <p className="mt-8 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-72 mr-7">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <h2 className="text-xl font-semibold">Edit category</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label
                  htmlFor="category_tk"
                  className="mb-2 block text-sm font-medium"
                >
                  Turkmen
                </label>
                <input
                  id="category_tk"
                  name="category_tk"
                  value={data.category_tk}
                  onChange={handleChange}
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
                  name="category_en"
                  value={data.category_en}
                  onChange={handleChange}
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
                  name="category_ru"
                  value={data.category_ru}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
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

export default EditCategory;
