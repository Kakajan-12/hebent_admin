const STORAGE_KEY = "arhea_admin_offices_v1";

export type OfficeLocaleFields = {
  name: string;
  map_link: string;
  address: string;
  phone: string;
  email: string;
};

export type StoredOffice = {
  id: number;
  active: boolean;
  featured: boolean;
  ru: OfficeLocaleFields;
  en: OfficeLocaleFields;
  tk: OfficeLocaleFields;
};

const seedText = "Text for Title";

const emptyLocale = (): OfficeLocaleFields => ({
  name: seedText,
  map_link: "",
  address: "",
  phone: "",
  email: "",
});

const seedOffices: StoredOffice[] = [
  {
    id: 1,
    active: true,
    featured: false,
    ru: emptyLocale(),
    en: emptyLocale(),
    tk: emptyLocale(),
  },
  {
    id: 2,
    active: true,
    featured: true,
    ru: emptyLocale(),
    en: emptyLocale(),
    tk: emptyLocale(),
  },
];

function parseStored(raw: string): StoredOffice[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (row): row is StoredOffice =>
      row != null &&
      typeof row === "object" &&
      typeof (row as StoredOffice).id === "number",
  );
}

export function readOffices(): StoredOffice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const initial = seedOffices.map((o) => ({ ...o, ru: { ...o.ru }, en: { ...o.en }, tk: { ...o.tk } }));
      writeOffices(initial);
      return initial;
    }
    return parseStored(raw);
  } catch {
    return [];
  }
}

export function writeOffices(offices: StoredOffice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offices));
  window.dispatchEvent(new CustomEvent("arhea-offices-changed"));
}

export function appendOffice(
  item: Omit<StoredOffice, "id">,
): StoredOffice {
  const list = readOffices();
  const nextId = list.reduce((m, o) => Math.max(m, o.id), 0) + 1;
  const created: StoredOffice = { ...item, id: nextId };
  writeOffices([...list, created]);
  return created;
}

export function removeOfficesByIds(ids: number[]): void {
  const list = readOffices();
  writeOffices(list.filter((o) => !ids.includes(o.id)));
}

export function getOfficeById(id: number): StoredOffice | undefined {
  return readOffices().find((o) => o.id === id);
}

export function updateOffice(
  id: number,
  patch: Omit<StoredOffice, "id">,
): StoredOffice | null {
  const list = readOffices();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated: StoredOffice = { ...patch, id };
  const next = [...list];
  next[idx] = updated;
  writeOffices(next);
  return updated;
}

export function updateOfficeFlags(
  id: number,
  flags: Partial<Pick<StoredOffice, "active" | "featured">>,
): void {
  const list = readOffices();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return;
  const next = [...list];
  next[idx] = { ...next[idx], ...flags };
  writeOffices(next);
}

const imageExt = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

export function mapLinkIsImageUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return imageExt.test(u.pathname);
  } catch {
    return imageExt.test(t);
  }
}

export function getOfficeMapPreviewSrc(office: StoredOffice): string | null {
  for (const loc of [office.tk, office.en, office.ru]) {
    const link = loc.map_link.trim();
    if (link && mapLinkIsImageUrl(link)) return link;
  }
  return null;
}
