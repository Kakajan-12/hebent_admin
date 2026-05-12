"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type StatisticForm = {
  title_tk: string;
  title_en: string;
  title_ru: string;
};

type StatisticResponse = StatisticForm & {
  id: number;
  count: number;
};

const emptyForm: StatisticForm = {
  title_tk: "",
  title_en: "",
  title_ru: "",
};

const EditStatisticsPage = () => {
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
  const [data, setData] = useState<StatisticForm>(emptyForm);
  const [countInput, setCountInput] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/statistics");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get<StatisticResponse[] | StatisticResponse>(
          `/api/statistics/${id}`,
        );
        const row = Array.isArray(response) ? response[0] : response;

        if (!row) {
          throw new Error("Statistic not found");
        }

        setData({
          title_tk: row.title_tk ?? "",
          title_en: row.title_en ?? "",
          title_ru: row.title_ru ?? "",
        });
        setCountInput(String(typeof row.count === "number" ? row.count : 0));
      } catch (error) {
        console.error("Не удалось загрузить statistic", error);
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

    const titles = [data.title_tk, data.title_en, data.title_ru].map((t) =>
      t.trim(),
    );
    if (titles.some((t) => !t)) {
      setValidationError("Please fill in all title fields.");
      return;
    }

    const count = Number(countInput);
    if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
      setValidationError("Count must be a non-negative integer.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/statistics/${id}`, {
        title_tk: titles[0],
        title_en: titles[1],
        title_ru: titles[2],
        count,
      });
      router.push("/admin/statistics");
    } catch (error) {
      console.error("Не удалось обновить statistic", error);
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
              Edit statistic
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

              <Field label="Title (TK):">
                <input
                  value={data.title_tk}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title_tk: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  autoComplete="off"
                />
              </Field>
              <Field label="Title (EN):">
                <input
                  value={data.title_en}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title_en: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  autoComplete="off"
                />
              </Field>
              <Field label="Title (RU):">
                <input
                  value={data.title_ru}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title_ru: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  autoComplete="off"
                />
              </Field>
              <Field label="Count:">
                <input
                  value={countInput}
                  onChange={(e) => setCountInput(e.target.value)}
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
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

export default EditStatisticsPage;
