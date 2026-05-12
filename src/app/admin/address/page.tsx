"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Sidebar from "@/Components/Sidebar";
import {
  readOffices,
  removeOfficesByIds,
  getOfficeMapPreviewSrc,
  mapLinkIsImageUrl,
  updateOfficeFlags,
  type StoredOffice,
} from "@/lib/addressesLocalStore";
import {
  extractLatLonFromMapUrl,
  osmStaticMapThumbUrl,
} from "@/lib/mapLinkPreview";
import { ClipLoader } from "react-spinners";

function OfficeMapThumb({
  mapSrc,
  fallbackLink,
}: {
  mapSrc: string | null;
  fallbackLink: string | undefined;
}) {
  const [staticFailed, setStaticFailed] = useState(false);
  const coords =
    fallbackLink && !mapSrc ? extractLatLonFromMapUrl(fallbackLink) : null;
  const staticUrl =
    coords && !staticFailed
      ? osmStaticMapThumbUrl(coords.lat, coords.lon)
      : null;

  if (mapSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mapSrc} alt="" className="h-14 w-20 rounded-md object-cover" />
    );
  }

  if (staticUrl && fallbackLink) {
    return (
      <a
        href={fallbackLink}
        target="_blank"
        rel="noopener noreferrer"
        title="Open map"
        className="block overflow-hidden rounded-md ring-1 ring-[#D8D8D8] hover:opacity-90"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={staticUrl}
          alt=""
          width={80}
          height={56}
          className="h-14 w-20 object-cover"
          onError={() => setStaticFailed(true)}
        />
      </a>
    );
  }

  if (fallbackLink && !mapLinkIsImageUrl(fallbackLink)) {
    return (
      <a
        href={fallbackLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-20 items-center justify-center rounded-md bg-[#E5ECF6] text-[10px] font-medium text-[#708DB8] underline"
      >
        Map
      </a>
    );
  }

  return <div className="h-14 w-20 rounded-md bg-gray-100" />;
}

const OfficesListPage = () => {
  const router = useRouter();
  const [offices, setOffices] = useState<StoredOffice[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const reload = () => setOffices(readOffices());

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    reload();
  }, [router]);

  const allSelected = useMemo(
    () => offices.length > 0 && selectedIds.size === offices.length,
    [offices, selectedIds],
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
      prev.size === offices.length
        ? new Set()
        : new Set(offices.map((o) => o.id)),
    );
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      removeOfficesByIds(Array.from(selectedIds));
      reload();
      setSelectedIds(new Set());
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const patchOffice = (
    id: number,
    flags: Partial<Pick<StoredOffice, "active" | "featured">>,
  ) => {
    updateOfficeFlags(id, flags);
    reload();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <div className="mt-8 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold">Offices list</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/address/add-address"
                className="flex items-center gap-2 rounded-md bg-[#708DB8] px-4 py-2 text-white transition hover:bg-[#5f7ba6]"
              >
                <PlusIcon className="size-5" />
                <span className="cursor-pointer text-sm">Add</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 rounded-md px-4 py-2 bg-[#708DB8] text-white transition hover:bg-[#5f7ba6] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer "
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
                  <th className="w-14 px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer accent-[#708DB8]"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="w-36 px-2 py-3 text-center font-semibold border-r border-[#D8D8D8] border-dashed">
                    Map
                  </th>
                  <th className="px-4 py-3 text-center font-semibold border-r border-[#D8D8D8] border-dashed">
                    Turkmen
                  </th>
                  <th className="px-4 py-3 text-center font-semibold border-r border-[#D8D8D8] border-dashed">
                    English
                  </th>
                  <th className="px-4 py-3 text-center font-semibold border-r border-[#D8D8D8] border-dashed">
                    Russian
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">View</th>
                </tr>
              </thead>
              <tbody>
                {offices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  offices.map((office) => {
                    const mapSrc = getOfficeMapPreviewSrc(office);
                    const fallbackLink = [office.tk, office.en, office.ru]
                      .map((l) => l.map_link.trim())
                      .find(Boolean);
                    const isChecked = selectedIds.has(office.id);

                    return (
                      <tr
                        key={office.id}
                        className="border-t border-[#D9D9D9] text-sm"
                      >
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 cursor-pointer accent-[#708DB8]"
                              checked={isChecked}
                              onChange={() => toggleOne(office.id)}
                            />
                            <button
                              type="button"
                              title={
                                office.featured ? "Featured" : "Mark featured"
                              }
                              onClick={() =>
                                patchOffice(office.id, {
                                  featured: !office.featured,
                                })
                              }
                              className="shrink-0 text-[#708DB8] hover:opacity-80"
                            >
                              {office.featured ? (
                                <StarIconSolid className="size-5" />
                              ) : (
                                <StarIcon className="size-5" />
                              )}
                            </button>
                            <input
                              type="checkbox"
                              className="toggle toggle-success toggle-sm shrink-0"
                              checked={office.active}
                              onChange={() =>
                                patchOffice(office.id, {
                                  active: !office.active,
                                })
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-[#D8D8D8] border-dashed">
                          <div className="flex justify-center">
                            <OfficeMapThumb
                              mapSrc={mapSrc}
                              fallbackLink={fallbackLink || undefined}
                            />
                          </div>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-4 text-center border-r border-[#D8D8D8] border-dashed">
                          {office.tk.name || "—"}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-4 text-center border-r border-[#D8D8D8] border-dashed">
                          {office.en.name || "—"}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-4 text-center border-r border-[#D8D8D8] border-dashed">
                          {office.ru.name || "—"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                              href={`/admin/address/view-address/${office.id}`}
                              className="inline-flex h-[27px] w-20 min-w-[80px] items-center justify-center gap-1 rounded-md bg-[#708DB8] px-2 text-xs font-medium text-white transition hover:bg-[#5f7ba6]"
                            >
                              <EyeIcon className="size-4" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/admin/address/edit-address/${office.id}`}
                              className="inline-flex items-center gap-2 rounded-md border border-[#708DB8] px-3 py-1.5 text-xs text-[#708DB8] transition hover:bg-[#F7F9FC]"
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
              <h2 className="mb-4 text-xl font-semibold">Remove offices?</h2>
              <p className="mb-6">
                Are you sure you want to delete {selectedIds.size} office
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
                  {isDeleting ? (
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
    </div>
  );
};

export default OfficesListPage;
