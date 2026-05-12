"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import Link from "next/link";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";
interface NewsRow {
  id: number;
  image: string;
  title_tk: string;
  title_en: string;
  title_ru: string;
}

function rowImageSrc(row: NewsRow): string {
  const raw = row.image?.trim() ?? "";
  if (!raw) return "";
  return buildApiUrl(raw);
}

const News = () => {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await api.get<NewsRow[]>("/api/news");
        setItems(response);
      } catch (err) {
        console.error(err);
        setError("Ошибка при получении данных");

        if (getApiErrorStatus(err) === 401) {
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [api, router]);

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.size === items.length,
    [items, selectedIds],
  );

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)),
    );
  };

  const openDeleteModal = (ids: number[]) => {
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
      await Promise.all(
        idsToDelete.map((delId) => api.delete(`/api/news/${delId}`)),
      );
      setItems((prev) => prev.filter((row) => !idsToDelete.includes(row.id)));

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

  // if (error) {
  //   return (
  //     <div className="flex min-h-screen">
  //       <Sidebar />
  //       <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
  //         <p className="mt-8 text-red-600">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  const deleteCount = idsToDelete.length;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <div className="mt-8 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold">News</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/news/add-news"
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
                    Image
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
                  <th className="text-center px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      <ClipLoader size={30} color="#708DB8" />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const src = rowImageSrc(row);
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-[#D9D9D9] text-sm"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-[#708DB8]"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleOne(row.id)}
                          />
                        </td>
                        <td className="flex justify-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          {src ? (
                            <Image
                              src={src}
                              alt={`news ${row.id}`}
                              width={80}
                              height={56}
                              className="h-14 w-20 rounded-md object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-14 w-20 rounded-md bg-gray-100" />
                          )}
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: row.title_tk,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: row.title_en,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: row.title_ru,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                              href={`/admin/news/view-news/${row.id}`}
                              className="inline-flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-1.5 text-white transition hover:bg-[#5f7ba6]"
                            >
                              <EyeIcon className="size-4" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/admin/news/edit-news/${row.id}`}
                              className="inline-flex items-center gap-2 rounded-md border border-[#708DB8] px-4 py-1.5 text-[#708DB8] transition hover:bg-[#F7F9FC]"
                            >
                              <PencilIcon className="size-4" />
                              <span>Edit</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">
              {deleteCount === 1
                ? "Delete news?"
                : `Delete ${deleteCount} news items?`}
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
                  <ClipLoader size={30} color="#708DB8" />
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

export default News;
