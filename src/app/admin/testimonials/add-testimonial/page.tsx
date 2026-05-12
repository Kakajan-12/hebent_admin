"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import Sidebar from "@/Components/Sidebar";
import TipTapEditor from "@/Components/TipTapEditor";
import { useApi } from "@/hooks/useApi";

const hasText = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;

const AddTestimonialPage = () => {
  const router = useRouter();
  const api = useApi();

  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const requiredFields = [company, text, name, jobTitle];

    if (requiredFields.some((field) => !hasText(field))) {
      setValidationError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/testimonials", {
        company,
        text,
        name,
        job_title: jobTitle,
      });
      router.push("/admin/testimonials");
    } catch (error) {
      console.error("Ошибка при добавлении testimonial:", error);
    } finally {
      setSaving(false);
    }
  };

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
              New testimonial
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

              {isClient && (
                <>
                  <Field label="Company:">
                    <TipTapEditor
                      content={company}
                      onChange={setCompany}
                      placeholder="Enter company name"
                    />
                  </Field>
                  <Field label="Text:">
                    <TipTapEditor content={text} onChange={setText} />
                  </Field>
                  <Field label="Name:">
                    <TipTapEditor content={name} onChange={setName} />
                  </Field>
                  <Field label="Job title:">
                    <TipTapEditor content={jobTitle} onChange={setJobTitle} />
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

export default AddTestimonialPage;
