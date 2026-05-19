"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type PhoneForm = {
  number: string;
};

type PhoneResponse = PhoneForm & {
  id: number;
};

const emptyForm: PhoneForm = {
  number: "",
};

const EditPhonePage = () => {
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
  const [data, setData] = useState<PhoneForm>(emptyForm);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);
  const minDigits = 9;

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/phone");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get<PhoneResponse[] | PhoneResponse>(
          `/api/phone/${id}`,
        );
        const phone = Array.isArray(response) ? response[0] : response;
        if (!phone) {
          throw new Error("Phone not found");
        }
        setData({
          number: phone.number ?? "",
        });
      } catch (error) {
        console.error("Не удалось загрузить phone", error);
        if (getApiErrorStatus(error) === 401) {
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

    if (!data.number.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }
    const digitsCount = data.number.replace(/\D/g, "").length;
    if (digitsCount < minDigits) {
      setValidationError(`Minimum ${minDigits} digits required.`);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/phone/${id}`, {
        number: data.number.trim(),
      });
      router.push("/admin/phone");
    } catch (error) {
      console.error("Не удалось обновить phone", error);
      if (getApiErrorStatus(error) === 401) {
        router.push("/");
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
        <div className="flex-1 flex items-center justify-center">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex">
        <div className="flex-1">
          <p className="text-red-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-xl border border-[#D9D9D9] bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-xl font-semibold text-[#1f2937]">
              Edit phone number
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

              <Field label="Number:">
                <input
                  value={data.number}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, number: e.target.value }))
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

export default EditPhonePage;
