export function fileFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function appendUniqueFilesWithReport(
  existing: File[],
  incoming: File[],
): { next: File[]; duplicateNames: string[] } {
  const keys = new Set(existing.map(fileFingerprint));
  const added: File[] = [];
  const duplicateNames: string[] = [];
  for (const file of incoming) {
    const key = fileFingerprint(file);
    if (keys.has(key)) {
      duplicateNames.push(file.name);
      continue;
    }
    keys.add(key);
    added.push(file);
  }
  return { next: [...existing, ...added], duplicateNames };
}

export function appendUniqueFiles(existing: File[], incoming: File[]): File[] {
  return appendUniqueFilesWithReport(existing, incoming).next;
}
