"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
type DataItem = {
  id: string;
  category_tk: string;
  category_en: string;
  category_ru: string;
};

const NewsCategory = () => {
  const [categories, setCategories] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/news-category`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setCategories(response.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error(axiosError);
        setError("Ошибка при получении данных");

        if (
          axios.isAxiosError(axiosError) &&
          axiosError.response?.status === 401
        ) {
          router.push("/");
        }
      }
    };

    fetchCategories();
  }, [router]);

  const allSelected = useMemo(
    () => categories.length > 0 && selectedIds.size === categories.length,
    [categories, selectedIds],
  );

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === categories.length
        ? new Set()
        : new Set(categories.map((c) => c.id)),
    );
  };

  const openDeleteModal = (ids: string[]) => {
    if (ids.length === 0) return;
    setIdsToDelete(ids);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (deleteLoading) return;
    setIsModalOpen(false);
    setIdsToDelete([]);
  };

  const handleDelete = async () => {
    if (idsToDelete.length === 0) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("auth_token");

      await Promise.all(
        idsToDelete.map((delId) =>
          axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/news-category/${delId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      );

      setCategories((prev) =>
        prev.filter((item) => !idsToDelete.includes(item.id)),
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      console.error(err);
      setError("Ошибка при удалении");
    } finally {
      setDeleteLoading(false);
      setIsModalOpen(false);
      setIdsToDelete([]);
    }
  };

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const deleteCount = idsToDelete.length;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-semibold">News categories</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/news-category/add-category"
              className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
            >
              <PlusIcon className="size-5" />
              <span className="text-sm">Add</span>
            </Link>
            <button
              type="button"
              onClick={() => openDeleteModal(Array.from(selectedIds))}
              disabled={selectedIds.size === 0}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashIcon className="size-5" />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-black">
          <table className="min-w-full">
            <thead className="bg-[#F7F9FC]">
              <tr className="text-left text-sm text-black">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer accent-[#708DB8]"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th className="text-center px-4 py-3 font-semibold border-r border-[#D8D8D8] border-dashed">
                  Turkmen
                </th>
                <th className="text-center px-4 py-3 font-semibold border-r border-[#D8D8D8] border-dashed">
                  English
                </th>
                <th className="text-center px-4 py-3 font-semibold border-r border-[#D8D8D8] border-dashed">
                  Russian
                </th>
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-[#D9D9D9] text-sm"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-[#708DB8]"
                        checked={selectedIds.has(category.id)}
                        onChange={() => toggleOne(category.id)}
                      />
                    </td>
                    <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: category.category_tk,
                        }}
                      />
                    </td>
                    <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: category.category_en,
                        }}
                      />
                    </td>
                    <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: category.category_ru,
                        }}
                      />
                    </td>
                    <td className="text-center px-4 py-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Link
                          href={`/admin/news-category/edit-category/${category.id}`}
                          className="inline-flex items-center gap-2 rounded-md border border-[#708DB8] px-4 py-1.5 text-[#708DB8] transition hover:bg-[#F7F9FC]"
                        >
                          <PencilIcon className="size-4" />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">
              {deleteCount === 1
                ? "Delete category?"
                : `Delete ${deleteCount} categories?`}
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={deleteLoading}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <ClipLoader size={80} color="#708DB8" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCategory;
