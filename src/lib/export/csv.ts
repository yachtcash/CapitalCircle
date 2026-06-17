// Minimal, dependency-free CSV export. Builds a Blob from rows + columns and
// triggers a browser download. Used by the Analytics Center export buttons.

export type CsvColumn<T> = {
  key: string;
  label: string;
  /** Extract the cell value from a row (defaults to row[key]). */
  get?: (row: T) => string | number | boolean | null | undefined;
};

function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote when the cell contains a comma, quote, or newline. Double up quotes.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows.map((row) =>
    columns
      .map((c) => escapeCell(c.get ? c.get(row) : (row as Record<string, unknown>)[c.key] as never))
      .join(",")
  );
  return [header, ...body].join("\r\n");
}

/** Build CSV and trigger a download. No-op outside the browser. */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const csv = toCsv(rows, columns);
  // Prepend a UTF-8 BOM so Excel reads accents/symbols correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Slug-safe timestamped filename, e.g. analytics-deals-last-30-days. */
export function exportFilename(entity: string, rangeLabel: string): string {
  const slug = rangeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `analytics-${entity}-${slug}`;
}
