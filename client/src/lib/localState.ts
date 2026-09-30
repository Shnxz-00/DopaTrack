import { useEffect, useState } from "react";

export type UrgeCheckIn = {
  id: string;
  urge: number;
  activity: string;
  duration: string;
  createdAt: number;
};

export type PersonalActivity = {
  id: string;
  name: string;
  duration: "quick" | "medium" | "long";
};

export type AuditEntry = {
  id: string;
  name: string;
  score: number;
  tip: string;
  createdAt: number;
};

function resolveFallback<T>(fallback: T | (() => T)): T {
  return typeof fallback === "function" ? (fallback as () => T)() : fallback;
}

export function readLocal<T>(key: string, fallback: T | (() => T)): T {
  const defaultValue = resolveFallback(fallback);
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useLocalState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => readLocal(key, fallback));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private browsing or quota restrictions keep the experience in memory for this visit.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function newLocalId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function readableDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp);
}
