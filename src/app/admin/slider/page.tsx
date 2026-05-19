"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { buildApiUrl, getApiErrorStatus, useApi } from "@/hooks/useApi";
import ClipLoader from "react-spinners/ClipLoader";

interface ServiceItem {
  id: number;
  image: string;
  service_name_tk: string;
  service_name_en: string;
  service_name_ru: string;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
}

const getServiceImage = (service: ServiceItem): string | null => {
  const src = service.image;
  if (!src) return null;
  return buildApiUrl(src).replace(/\\/g, "/");
};

const SliderPage = () => {
  const router = useRouter();
  const api = useApi();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await api.get<ServiceItem[]>("/api/services");
        setServices(data);
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

    fetchServices();
  }, [api, router]);

  const allSelected = useMemo(
    () => services.length > 0 && selectedIds.size === services.length,
    [services, selectedIds],
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
      prev.size === services.length
        ? new Set()
        : new Set(services.map((s) => s.id)),
    );
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          api.delete<void>(`/api/services/${id}`),
        ),
      );
      setServices((prev) => prev.filter((s) => !selectedIds.has(s.id)));
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
        <div className="flex items-center justify-between py-4 px-6">
          <h2 className="text-2xl font-semibold">Services</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/slider/add-slider"
              className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
            >
              <PlusIcon className="size-5" />
              <span className="cursor-pointer text-sm">Add</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#708DB8] text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#5f7ba6] cursor-pointer "
            >
              <TrashIcon className="size-5" />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-black">
          <table className="min-w-full">
            <thead className="bg-[#F7F9FC]">
              <tr className="text-left text-sm text-black ">
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
                <th className="text-center px-4 py-3 font-semibold">Actions</th>
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
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                services.map((service) => {
                  const imageSrc = getServiceImage(service);
                  const isChecked = selectedIds.has(service.id);

                  return (
                    <tr
                      key={service.id}
                      className="border-t border-[#D9D9D9] text-sm"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="size-4 cursor-pointer accent-[#708DB8]"
                          checked={isChecked}
                          onChange={() => toggleOne(service.id)}
                        />
                      </td>
                      {/* <td className="px-2 py-4" /> */}
                      <td className="flex justify-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                        {imageSrc &&
                        (imageSrc.startsWith("data:") ||
                          imageSrc.startsWith("blob:")) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc}
                            alt=""
                            className="h-14 w-20 rounded-md object-cover"
                          />
                        ) : imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={`service ${service.id}`}
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
                            __html: service.title_tk,
                          }}
                        />
                      </td>
                      <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: service.title_en,
                          }}
                        />
                      </td>
                      <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: service.title_ru,
                          }}
                        />
                      </td>
                      <td className="text-center px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Link
                            href={`/admin/slider/view-slider/${service.id}`}
                            className="inline-flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-1.5 text-white transition hover:bg-[#5f7ba6]"
                          >
                            <EyeIcon className="size-4" />
                            <span>View</span>
                          </Link>
                          <Link
                            href={`/admin/slider/edit-slider/${service.id}`}
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Remove sliders?</h2>
              <p className="mb-6">
                Are you sure you want to delete {selectedIds.size} slider
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

export default SliderPage;
