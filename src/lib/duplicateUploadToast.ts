import { toast } from "sonner";

export function notifyDuplicateUploads(duplicateNames: string[]) {
  if (duplicateNames.length === 0) return;

  const unique = [...new Set(duplicateNames)];

  if (unique.length === 1) {
    toast.info(`«${unique[0]}» уже загружен`, {
      description: "Такой файл уже есть в списке.",
    });
    return;
  }

  const preview = unique.slice(0, 4).join(", ");
  const suffix = unique.length > 4 ? "…" : "";
  toast.info(`Пропущено дубликатов: ${unique.length}`, {
    description: `${preview}${suffix}`,
  });
}
