"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { LocaleOfficeFields } from "../../LocaleOfficeFields";
import {
  getOfficeById,
  removeOfficesByIds,
  getOfficeMapPreviewSrc,
  mapLinkIsImageUrl,
  type StoredOffice,
} from "@/lib/addressesLocalStore";
import { ClipLoader } from "react-spinners";
const ViewAddressPage = () => {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [office, setOffice] = useState<StoredOffice | null | undefined>(
    undefined,
  );
  const [isOpen, setIsOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setOffice(null);
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    setOffice(getOfficeById(id) ?? null);
  }, [id, router]);

  const handleDelete = () => {
    if (!Number.isFinite(id)) return;
    setIsDeleting(true);
    try {
      removeOfficesByIds([id]);
      setShowModal(false);
      router.push("/admin/address");
    } finally {
      setIsDeleting(false);
    }
  };

  if (office === undefined) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  if (office === null) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <div className="mt-8 rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm">
            <p className="text-gray-600">Office not found.</p>
            <Link
              href="/admin/address"
              className="mt-4 inline-block text-sm text-[#708DB8] underline"
            >
              ← Offices list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mapSrc = getOfficeMapPreviewSrc(office);
  const anyMapLink = [office.tk, office.en, office.ru]
    .map((l) => l.map_link.trim())
    .find(Boolean);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <Link
          href="/admin/address"
          className="text-sm text-[#708DB8] hover:underline"
        >
          ← Offices list
        </Link>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h1 className="text-xl font-semibold">Office</h1>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#D9D9D9] px-6 py-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <span
                  className={`rounded-full px-3 py-1 ${office.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                >
                  {office.active ? "Active" : "Inactive"}
                </span>
                {office.featured && (
                  <span className="rounded-full bg-[#E5ECF6] px-3 py-1 text-[#708DB8]">
                    Featured
                  </span>
                )}
              </div>

              {(mapSrc || anyMapLink) && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Map</p>
                  {mapSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mapSrc}
                      alt=""
                      className="max-h-48 max-w-full rounded-lg object-contain"
                    />
                  ) : anyMapLink && !mapLinkIsImageUrl(anyMapLink) ? (
                    <a
                      href={anyMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#708DB8] underline break-all"
                    >
                      {anyMapLink}
                    </a>
                  ) : null}
                </div>
              )}

              <Tabs defaultValue="russian">
                <TabsList className="min-w-xl border border-[#D9D9D9] bg-[#E5ECF6]">
                  <TabsTrigger value="russian" className="text-sm">
                    Russian
                  </TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
                </TabsList>
                <TabsContent value="russian" className="pt-4">
                  <LocaleOfficeFields value={office.ru} readOnly />
                </TabsContent>
                <TabsContent value="english" className="pt-4">
                  <LocaleOfficeFields value={office.en} readOnly />
                </TabsContent>
                <TabsContent value="turkmen" className="pt-4">
                  <LocaleOfficeFields value={office.tk} readOnly />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold">Remove office</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this office?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAddressPage;
