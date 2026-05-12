"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type SocialLinkForm = {
  icon: string;
  url: string;
};

type SocialLinkResponse = SocialLinkForm & {
  id: number;
};

const SOCIAL_ICONS = [
  "instagram",
  "telegram",
  "facebook",
  "twitter",
  "linkedin",
  "tiktok",
  "whatsapp",
];

const emptyForm: SocialLinkForm = {
  icon: "",
  url: "",
};

const EditSocialLinkPage = () => {
  const params = useParams();
  const router = useRouter();
  const api = useApi();

  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [isOpen, setIsOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<SocialLinkForm>(emptyForm);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/social-links");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get<
          SocialLinkResponse[] | SocialLinkResponse
        >(`/api/social-links/${id}`);
        const socialLink = Array.isArray(response) ? response[0] : response;
        if (!socialLink) {
          throw new Error("Social link not found");
        }

        setData({
          icon: socialLink.icon ?? "",
          url: socialLink.url ?? "",
        });
      } catch (error) {
        console.error("Не удалось загрузить social link", error);
        const status = getApiErrorStatus(error);
        if (status === 401 || status === 403) {
          router.push("/");
          return;
        }
        setFetchError("Ошибка при загрузке данных");
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [api, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setValidationError("");

    if (!data.icon.trim() || !data.url.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/social-links/${id}`, {
        icon: data.icon.trim().toLowerCase(),
        url: data.url.trim(),
      });
      router.push("/admin/social-links");
    } catch (error) {
      console.error("Не удалось обновить social link", error);
      const status = getApiErrorStatus(error);
      if (status === 401 || status === 403) {
        router.push("/");
        return;
      }
      if (status === 404) {
        setSaveError("Endpoint не найден (404)");
        return;
      }
      setSaveError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-79 mr-7 py-10 flex items-center justify-center">
          <p className="mt-8">
            <ClipLoader size={80} color="#708DB8" />
          </p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-79 mr-7 py-10">
          <p className="mt-8 text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="my-8 w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">
              Edit social link
            </h2>
            <FiChevronDown
              className={`size-5 shrink-0 text-gray-500 transition-transform ${isOpen ? "" : "-rotate-90"}`}
            />
          </button>

          {isOpen && (
            <div className="space-y-6 border-t border-[#eee] px-6 pb-6 pt-6">
              {validationError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {validationError}
                </p>
              ) : null}

              {saveError ? (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                  {saveError}
                </p>
              ) : null}

              <Field label="Icon:">
                <select
                  value={data.icon}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8] bg-white"
                >
                  <option value="">Select icon</option>
                  {SOCIAL_ICONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="URL:">
                <input
                  value={data.url}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  autoComplete="off"
                />
              </Field>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-b-xl bg-[#708DB8] py-3 text-lg font-semibold tracking-wide text-white uppercase transition hover:bg-[#5f7ba6] disabled:opacity-60"
          >
            {saving ? <ClipLoader color="#fff" size={16} /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <span className="mb-2 block text-sm font-medium text-[#374151]">
      {label}
    </span>
    {children}
  </div>
);

export default EditSocialLinkPage;
