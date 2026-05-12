"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import Sidebar from "@/Components/Sidebar";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";

type VideoItem = {
  id: number;
  video: string;
};

const VideoPage = () => {
  const router = useRouter();
  const { get, delete: deleteRequest } = useApi();
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await get<VideoItem[]>("/api/videos");
        setItems(data);
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

    fetchData();
  }, [get, router]);

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
      prev.size === items.length ? new Set() : new Set(items.map((item) => item.id)),
    );
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => deleteRequest<void>(`/api/videos/${id}`)),
      );
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Ошибка при удалении");
      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen py-10 ml-79 mr-7">
        <div className="mt-8 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold">Video</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/video/add-video"
                className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
              >
                <PlusIcon className="size-5" />
                <span className="cursor-pointer text-sm">Add</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
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
                  <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                    Video
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      <ClipLoader size={80} color="#708DB8" />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const isChecked = selectedIds.has(row.id);
                    const videoUrl = buildApiUrl(row.video).trim();
                    return (
                      <tr key={row.id} className="border-t border-[#D9D9D9] text-sm">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-[#708DB8]"
                            checked={isChecked}
                            onChange={() => toggleOne(row.id)}
                          />
                        </td>
                        <td className="border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center">
                          {videoUrl ? (
                            <div className="flex justify-center">
                              <video
                                src={videoUrl}
                                className="h-24 w-40 rounded-md bg-black object-cover"
                                controls
                                preload="metadata"
                              />
                            </div>
                          ) : (
                            "No video"
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                              href={`/admin/video/edit-video/${row.id}`}
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Remove videos?</h2>
              <p className="mb-6">
                Are you sure you want to delete {selectedIds.size} video
                {selectedIds.size > 1 ? "s" : ""}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                  className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
