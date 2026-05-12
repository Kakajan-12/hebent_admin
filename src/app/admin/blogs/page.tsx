"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "@/Components/Sidebar";
import {
  readBlogs,
  removeBlogsByIds,
  getBlogMainImageSrc,
  type StoredBlog,
} from "@/lib/blogsLocalStore";

const BlogsPage = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<StoredBlog[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reload = useCallback(() => setBlogs(readBlogs()), []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    reload();
    const onStorage = () => reload();
    window.addEventListener("arhea-blogs-changed", onStorage);
    return () => window.removeEventListener("arhea-blogs-changed", onStorage);
  }, [router, reload]);

  const allSelected = useMemo(
    () => blogs.length > 0 && selectedIds.size === blogs.length,
    [blogs, selectedIds],
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
      prev.size === blogs.length ? new Set() : new Set(blogs.map((b) => b.id)),
    );
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      removeBlogsByIds(Array.from(selectedIds));
      reload();
      setSelectedIds(new Set());
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">

        <div className="mt-8 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold">Blogs</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blogs/add-blog"
                className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
              >
                <PlusIcon className="size-5" />
                <span className="cursor-pointer text-sm">Add</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#708DB8] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
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
                    Image
                  </th>
                  <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                    Turkmen
                  </th>
                  <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                    English
                  </th>
                  <th className="border-r border-dashed border-[#D8D8D8] px-4 py-3 text-center font-semibold">
                    Russian
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  blogs.map((row) => {
                    const imageSrc = getBlogMainImageSrc(row);
                    const isChecked = selectedIds.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-[#D9D9D9] text-sm"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-[#708DB8]"
                            checked={isChecked}
                            onChange={() => toggleOne(row.id)}
                          />
                        </td>
                        <td className="border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center align-middle">
                          <div className="flex justify-center">
                            {imageSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageSrc}
                                alt=""
                                className="h-14 w-24 rounded-md object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-14 w-24 rounded-md bg-gray-100" />
                            )}
                          </div>
                        </td>
                        <td className="max-w-xs border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center">
                          <div
                            className="line-clamp-2 text-left [&_p]:my-0"
                            dangerouslySetInnerHTML={{
                              __html: row.title_tk,
                            }}
                          />
                        </td>
                        <td className="max-w-xs border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center">
                          <div
                            className="line-clamp-2 text-left [&_p]:my-0"
                            dangerouslySetInnerHTML={{
                              __html: row.title_en,
                            }}
                          />
                        </td>
                        <td className="max-w-xs border-r border-dashed border-[#D8D8D8] px-4 py-4 text-center">
                          <div
                            className="line-clamp-2 text-left [&_p]:my-0"
                            dangerouslySetInnerHTML={{
                              __html: row.title_ru,
                            }}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                              href={`/admin/blogs/view-blog/${row.id}`}
                              className="inline-flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-1.5 text-white transition hover:bg-[#5f7ba6]"
                            >
                              <EyeIcon className="size-4" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/admin/blogs/edit-blog/${row.id}`}
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
              <h2 className="mb-4 text-xl font-semibold">Remove blogs?</h2>
              <p className="mb-6">
                Are you sure you want to delete {selectedIds.size} blog
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

export default BlogsPage;
