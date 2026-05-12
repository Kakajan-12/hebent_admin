"use client";

import React from "react";
import type { OfficeLocaleFields } from "@/lib/addressesLocalStore";

const inputClass =
  "w-full rounded-lg border border-gray-300 p-2 text-sm transition focus:border-[#708DB8] focus:ring focus:ring-[#E5ECF6] outline-none";
const inputReadOnlyClass =
  "w-full rounded-lg border border-gray-200 bg-[#F7F9FC] p-2 text-sm text-gray-800";

type Props = {
  value: OfficeLocaleFields;
  onChange?: (next: OfficeLocaleFields) => void;
  readOnly?: boolean;
};

export function LocaleOfficeFields({ value, onChange, readOnly }: Props) {
  const set = (key: keyof OfficeLocaleFields, v: string) => {
    if (readOnly || !onChange) return;
    onChange({ ...value, [key]: v });
  };

  const cls = readOnly ? inputReadOnlyClass : inputClass;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Office name
        </label>
        <input
          type="text"
          className={cls}
          value={value.name}
          readOnly={readOnly}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Map link
        </label>
        <input
          type="text"
          className={cls}
          value={value.map_link}
          readOnly={readOnly}
          onChange={(e) => set("map_link", e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Office address
        </label>
        <input
          type="text"
          className={cls}
          value={value.address}
          readOnly={readOnly}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Phone
        </label>
        <input
          type="text"
          className={cls}
          value={value.phone}
          readOnly={readOnly}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          E-mail
        </label>
        <input
          type="email"
          className={cls}
          value={value.email}
          readOnly={readOnly}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
    </div>
  );
}
