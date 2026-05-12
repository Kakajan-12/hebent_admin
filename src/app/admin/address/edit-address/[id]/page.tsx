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
  updateOffice,
  type OfficeLocaleFields,
} from "@/lib/addressesLocalStore";
import { ClipLoader } from "react-spinners";

const emptyLocale = (): OfficeLocaleFields => ({
  name: "",
  map_link: "",
  address: "",
  phone: "",
  email: "",
});

const EditAddressPage = () => {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [ru, setRu] = useState(emptyLocale);
  const [en, setEn] = useState(emptyLocale);
  const [tk, setTk] = useState(emptyLocale);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/address");
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    const office = getOfficeById(id);
    if (!office) {
      router.replace("/admin/address");
      return;
    }
    setRu({ ...office.ru });
    setEn({ ...office.en });
    setTk({ ...office.tk });
    setActive(office.active);
    setFeatured(office.featured);
    setLoaded(true);
  }, [id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    if (!Number.isFinite(id)) return;
    setSaving(true);
    try {
      const result = updateOffice(id, {
        active,
        featured,
        ru: { ...ru },
        en: { ...en },
        tk: { ...tk },
      });
      if (result) router.push(`/admin/address/view-address/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <Link
          href="/admin/address"
          className="mb-4 inline-block text-sm text-[#708DB8] hover:underline"
        >
          ← Offices list
        </Link>

        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold">Edit Office</h2>
            <FiChevronDown
              className={`size-5 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 px-6 pb-6">
              <div className="flex flex-wrap gap-6 border-b border-[#D9D9D9] pb-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={active}
                    onChange={() => setActive((v) => !v)}
                  />
                  <span>Active</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={() => setFeatured((v) => !v)}
                    className="size-4 accent-[#708DB8]"
                  />
                  <span>Featured</span>
                </label>
              </div>

              {isClient && (
                <Tabs defaultValue="russian">
                  <TabsList className="min-w-xl border border-[#D9D9D9] bg-[#E5ECF6]">
                    <TabsTrigger value="russian" className="text-sm">
                      Russian
                    </TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="turkmen">Turkmen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="russian" className="pt-4">
                    <LocaleOfficeFields value={ru} onChange={setRu} />
                  </TabsContent>
                  <TabsContent value="english" className="pt-4">
                    <LocaleOfficeFields value={en} onChange={setEn} />
                  </TabsContent>
                  <TabsContent value="turkmen" className="pt-4">
                    <LocaleOfficeFields value={tk} onChange={setTk} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#708DB8] py-3 text-xl font-semibold uppercase tracking-wide text-white transition hover:bg-[#5f7ba6] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAddressPage;
