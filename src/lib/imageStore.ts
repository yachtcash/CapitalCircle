// Local-only image persistence backed by IndexedDB.
//
// Uploaded image binaries are stored in IndexedDB and referenced from the
// rest of the app via opaque tokens of the form `idb://img-<id><ext>`.
// Tokens are safe to:
//  - persist to localStorage (they're plain strings),
//  - place in `Opportunity.images[]` and serialize as JSON,
//  - copy across reordering, cover changes, replace operations.
//
// At render time, callers convert tokens back to browser-renderable URLs
// via `useResolvedImage(s)` (a React hook) or `resolveImageUrlSync(token)`
// (a synchronous accessor that returns a cached object URL or null).
//
// This is intentionally a single-browser, single-origin prototype. No
// network access, no cross-device sync, no upload backend.

"use client";

import { useEffect, useMemo, useState } from "react";

const DB_NAME = "cc-images";
const STORE = "blobs";
const DB_VERSION = 1;

export const TOKEN_PREFIX = "idb://";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  );
}

/** Return true iff the string looks like an IDB-backed image token. */
export function isStoredImageToken(s: string | undefined | null): s is string {
  return typeof s === "string" && s.startsWith(TOKEN_PREFIX);
}

/**
 * Store a blob and return a token like `idb://img-<id><ext>`.
 * The extension is recovered from the source filename when possible.
 */
export async function putImage(
  blob: Blob,
  filename?: string
): Promise<string> {
  const id = randomId();
  const extMatch = (filename ?? "").toLowerCase().match(/\.(jpe?g|png|webp|gif|svg)$/);
  const ext = extMatch ? extMatch[0] : "";
  const token = `${TOKEN_PREFIX}img-${id}${ext}`;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(blob, token);
  });
  return token;
}

/** Retrieve a stored blob by its token. Returns null if not found. */
export async function getImageBlob(token: string): Promise<Blob | null> {
  if (!isStoredImageToken(token)) return null;
  try {
    const db = await openDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(token);
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Delete a stored blob. No-op for non-token strings or absent blobs.
 * Also evicts any cached object URL so subsequent reads don't return a
 * dangling URL pointing at a freed blob.
 */
export async function deleteImage(token: string): Promise<void> {
  if (!isStoredImageToken(token)) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(token);
    });
  } catch {
    /* swallow */
  }
  const cached = urlCache.get(token);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(token);
  }
}

// ---- Object-URL cache ----
//
// Object URLs are created lazily on first resolution and cached for the
// document's lifetime. We don't proactively revoke them — the browser
// releases them when the document unloads, and components elsewhere may
// still be holding the URL. The cache IS evicted when `deleteImage` runs
// so we never hand out a dangling URL for a freed blob.

const urlCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

/**
 * Resolve a token to a renderable URL, populating the sync cache on the
 * way back. Non-token strings pass through (returned as-is). Returns null
 * if the token has no underlying blob (e.g. cleared IDB).
 */
export async function resolveImageUrlAsync(
  token: string
): Promise<string | null> {
  if (!isStoredImageToken(token)) return token;
  const cached = urlCache.get(token);
  if (cached) return cached;
  const pending = inFlight.get(token);
  if (pending) return pending;
  const p = (async () => {
    const blob = await getImageBlob(token);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(token, url);
    return url;
  })().finally(() => inFlight.delete(token));
  inFlight.set(token, p);
  return p;
}

/**
 * Synchronous read-through. Returns the cached URL if the token has been
 * resolved before, or null otherwise. Non-token strings pass through.
 */
export function resolveImageUrlSync(
  token: string | undefined | null
): string | null {
  if (!token) return null;
  if (!isStoredImageToken(token)) return token;
  return urlCache.get(token) ?? null;
}

/**
 * Eagerly resolve a batch of tokens so subsequent sync reads hit cache.
 * Used by the provider on hydration to prewarm everything before the
 * first card / hero render happens.
 */
export async function prewarmTokens(tokens: readonly string[]): Promise<void> {
  const pending = tokens.filter(
    (t) => isStoredImageToken(t) && !urlCache.has(t)
  );
  if (pending.length === 0) return;
  await Promise.all(pending.map((t) => resolveImageUrlAsync(t)));
}

// ---- React hooks ----

/**
 * Resolve a single image source to a renderable URL. Tokens become object
 * URLs; non-tokens pass through. Returns "" during SSR for token inputs so
 * SSR / hydration don't render a broken Image.
 */
export function useResolvedImage(
  src: string | undefined | null
): string {
  const initial = typeof window === "undefined"
    ? (isStoredImageToken(src) ? "" : (src ?? ""))
    : (resolveImageUrlSync(src) ?? "");
  const [resolved, setResolved] = useState<string>(initial);

  useEffect(() => {
    if (!src) {
      setResolved("");
      return;
    }
    if (!isStoredImageToken(src)) {
      setResolved(src);
      return;
    }
    const cached = resolveImageUrlSync(src);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    resolveImageUrlAsync(src).then((url) => {
      if (!cancelled) setResolved(url ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}

/**
 * Resolve a list of image sources. Re-runs whenever the comma-joined
 * input string changes. Mirrors the semantics of useResolvedImage for
 * each entry.
 */
export function useResolvedImages(
  sources: readonly string[] | undefined | null
): string[] {
  const list = sources ?? [];
  // Memoize a stable cache key so the effect only re-runs when the list
  // genuinely changes (not on every parent render).
  const key = useMemo(() => list.join("|"), [list]);

  const initial = useMemo<string[]>(() => {
    if (typeof window === "undefined") {
      return list.map((s) => (isStoredImageToken(s) ? "" : s));
    }
    return list.map((s) => resolveImageUrlSync(s) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [resolved, setResolved] = useState<string[]>(initial);

  useEffect(() => {
    // Fast-path: every source either passes through or is already cached.
    const fast = list.map((s) => {
      if (!isStoredImageToken(s)) return s;
      return resolveImageUrlSync(s);
    });
    if (fast.every((v) => typeof v === "string")) {
      setResolved(fast as string[]);
      return;
    }
    let cancelled = false;
    Promise.all(
      list.map(async (s) => {
        if (!isStoredImageToken(s)) return s;
        const cached = resolveImageUrlSync(s);
        if (cached) return cached;
        const url = await resolveImageUrlAsync(s);
        return url ?? "";
      })
    ).then((urls) => {
      if (!cancelled) setResolved(urls);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return resolved;
}
