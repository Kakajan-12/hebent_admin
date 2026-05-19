"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import TipTapEditor from "@/Components/TipTapEditor";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type TestimonialFormData = {
  company: string;
  text: string;
  name: string;
  job_title: string;
};

type TestimonialResponse = TestimonialFormData & {
  id: number;
};

const emptyForm: TestimonialFormData = {
  company: "",
  text: "",
  name: "",
  job_title: "",
};

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const EditTestimonialPage = () => {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? Number(idParam)
      : Number(Array.isArray(idParam) ? idParam[0] : NaN);

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<TestimonialFormData>(emptyForm);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/testimonials");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get<
          TestimonialResponse[] | TestimonialResponse
        >(`/api/testimonials/${id}`);
        const testimonial = Array.isArray(response) ? response[0] : response;

        if (!testimonial) {
          throw new Error("Testimonial not found");
        }

        setData({
          company: testimonial.company ?? "",
          text: testimonial.text ?? "",
          name: testimonial.name ?? "",
          job_title: testimonial.job_title ?? "",
        });
      } catch (error) {
        console.error("Не удалось загрузить testimonial", error);
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

  const handleChange = (field: keyof TestimonialFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setValidationError("");

    if (Object.values(data).some((value) => !hasText(value))) {
      setValidationError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/testimonials/${id}`, data);
      router.push("/admin/testimonials");
    } catch (error) {
      console.error("Не удалось обновить отзыв", error);
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
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={80} color="#708DB8" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">{fetchError}</p>
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
              Edit testimonial
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

              {isClient && (
                <>
                  <Field label="Company:">
                    <TipTapEditor
                      key={`company-${id}-${loaded}`}
                      content={data.company}
                      onChange={(value) => handleChange("company", value)}
                    />
                  </Field>
                  <Field label="Text:">
                    <TipTapEditor
                      key={`text-${id}-${loaded}`}
                      content={data.text}
                      onChange={(value) => handleChange("text", value)}
                    />
                  </Field>
                  <Field label="Name:">
                    <TipTapEditor
                      key={`name-${id}-${loaded}`}
                      content={data.name}
                      onChange={(value) => handleChange("name", value)}
                    />
                  </Field>
                  <Field label="Job title:">
                    <TipTapEditor
                      key={`job-title-${id}-${loaded}`}
                      content={data.job_title}
                      onChange={(value) => handleChange("job_title", value)}
                    />
                  </Field>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-b-xl bg-[#708DB8] py-3 text-lg font-semibold tracking-wide text-white uppercase transition hover:bg-[#5f7ba6] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
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

export default EditTestimonialPage;
