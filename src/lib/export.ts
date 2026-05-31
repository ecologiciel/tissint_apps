import type { CollectionItem } from "./tissint-types";

export function exportCollectionJSON(items: CollectionItem[]): string {
  return JSON.stringify(
    {
      app: "Tissint",
      exportedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  );
}

export function exportCollectionCSV(items: CollectionItem[]): string {
  const headers = [
    "id",
    "scanId",
    "name",
    "classification",
    "score",
    "verdict",
    "weightG",
    "origin",
    "notes",
    "createdAt",
  ];
  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const rows = items.map((it) => headers.map((h) => escape((it as any)[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
