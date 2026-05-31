import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";

const CACHE_KEY = "tissint_offline_cache_v1";

export interface OfflineCache {
  lastScans: any[];
  collection: any[];
  listings: any[];
  cachedAt: string;
}

/**
 * Caches the latest critical app data to localStorage so users can still
 * browse their collection / last scans / market when offline.
 */
export function useOfflineCache() {
  const { collection, listings, lastScan } = useApp();
  const [hasCache, setHasCache] = useState(false);

  // Write cache periodically
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const lastScans = lastScan
        ? [
            lastScan,
            ...(existing.lastScans || []).filter((s: any) => s.scanId !== lastScan.scanId),
          ].slice(0, 10)
        : existing.lastScans || [];
      const payload: OfflineCache = {
        lastScans,
        collection,
        listings: listings.slice(0, 50),
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      setHasCache(true);
    } catch {
      /* quota exceeded — skip */
    }
  }, [collection, listings, lastScan]);

  return { hasCache };
}

export function readOfflineCache(): OfflineCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
