"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

const AddPhonePage = () => {
  const router = useRouter();
  const api = useApi();

  const minDigits = 9;

  const [isOpen, setIsOpen] = useState(true);
  const [number, setNumber] = useState("+993");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleNumberChange = (value: string) => {
    const sanitized = value.replace(/[^\d+]/g, "");
    const hasLeadingPlus = sanitized.startsWith("+");
    const digitsOnly = sanitized.replace(/\D/g, "");
    setNumber(hasLeadingPlus ? `+${digitsOnly}` : digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSaveError("");

    if (!number.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }
    const digitsCount = number.replace(/\D/g, "").length;
    if (digitsCount < minDigits) {
      setValidationError(`Minimum ${minDigits} digits required.`);
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/phone", {
        number: number.trim(),
      });
      router.push("/admin/phone");
    } catch (error) {
      console.error("Ошибка при добавлении phone:", error);
      if (getApiErrorStatus(error) === 401) {
        router.push("/");
        return;
      }
      setSaveError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

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
              New phone number
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
                  value={number}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  type="tel"
                  className="w-full rounded-lg border border-[#D9D9D9] px-3 py-2 text-sm outline-none focus:border-[#708DB8]"
                  placeholder="+993..."
                  inputMode="numeric"
                  autoComplete="tel"
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

export default AddPhonePage;
