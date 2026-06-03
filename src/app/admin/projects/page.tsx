"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";
interface ProjectsItem {
  id: number;
  image?: string;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk?: string;
  text_en?: string;
  text_ru?: string;
  costumer_tk?: string;
  costumer_en?: string;
  costumer_ru?: string;
  website?: string;
  gallery?: string[];
}

const getProjectImage = (project: ProjectsItem): string | null => {
  const src = project.image;
  if (!src) return null;
  // Бэкенд иногда хранит серверный путь "/app/uploads/...",
  // а файлы публично доступны по "/uploads/...".
  const normalized = src.replace(/\\/g, "/").replace(/^\/?app\/uploads\//, "/uploads/");
  return buildApiUrl(normalized);
};

const Projects = () => {
  const router = useRouter();
  const api = useApi();
  const [projects, setProjects] = useState<ProjectsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.get<ProjectsItem[]>("/api/projects");
        setProjects(data);
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

    fetchProjects();
  }, [api, router]);

  const allSelected = useMemo(
    () => projects.length > 0 && selectedIds.size === projects.length,
    [projects, selectedIds],
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
      prev.size === projects.length
        ? new Set()
        : new Set(projects.map((p) => p.id)),
    );
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          api.delete<void>(`/api/projects/${id}`),
        ),
      );
      setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setShowModal(false);
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      setError("Ошибка при удалении");

      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div className="rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/projects/add-project"
                className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
              >
                <PlusIcon className="size-5" />
                <span>Add</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#708DB8] text-white transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <TrashIcon className="size-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden border-t border-[#D9D9D9]">
            <table className="min-w-full">
              <thead className="bg-[#E5ECF6]">
                <tr className="text-left text-sm text-gray-600">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer accent-[#708DB8]"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="w-12 px-2 py-3">
                    <Cog6ToothIcon className="size-5 text-gray-500" />
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
                      <ClipLoader size={80} color="#708DB8" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      {error}
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const imageSrc = getProjectImage(project);
                    const isChecked = selectedIds.has(project.id);

                    return (
                      <tr
                        key={project.id}
                        className="border-t border-[#D9D9D9] text-sm"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-[#708DB8]"
                            checked={isChecked}
                            onChange={() => toggleOne(project.id)}
                          />
                        </td>
                        <td className="px-2 py-4" />
                        <td className="flex justify-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          {imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageSrc}
                              alt={`project ${project.id}`}
                              className="h-14 w-20 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-14 w-20 rounded-md bg-gray-100" />
                          )}
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: project.title_tk,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: project.title_en,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: project.title_ru,
                            }}
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                              href={`/admin/projects/view-project/${project.id}`}
                              className="inline-flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-1.5 text-white transition hover:bg-[#5f7ba6]"
                            >
                              <EyeIcon className="size-4" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/admin/projects/edit-project/${project.id}`}
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
              <h2 className="mb-4 text-xl font-semibold">Remove projects?</h2>
              <p className="mb-6">
                Are you sure you want to delete {selectedIds.size} project
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

export default Projects;
