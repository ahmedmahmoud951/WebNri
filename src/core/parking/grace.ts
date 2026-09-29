import { useEffect, useState } from 'react';

export type GraceState =
  | { kind: 'none' }
  | { kind: 'active'; remainingMs: number; until: number }
  | { kind: 'expired'; until: number };

export function parseUtcMillis(raw: string | number | null | undefined): number {
  if (raw == null || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  let str = String(raw).trim();
  if (!str) return NaN;
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str += 'Z';
  }
  return new Date(str).getTime();
}

export function graceState(graceUntil: string | null | undefined, now = Date.now()): GraceState {
  if (!graceUntil) return { kind: 'none' };
  const until = parseUtcMillis(graceUntil);
  if (Number.isNaN(until)) return { kind: 'none' };
  const remainingMs = until - now;
  if (remainingMs <= 0) return { kind: 'expired', until };
  return { kind: 'active', remainingMs, until };
}

export function remainingParts(ms: number): { minutes: number; seconds: number } {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return { minutes: Math.floor(totalSec / 60), seconds: totalSec % 60 };
}

export function durationParts(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

export function useNow(enabled = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return now;
}

export function useGraceClock(graceUntil: string | null | undefined): GraceState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!graceUntil) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [graceUntil]);

  return graceState(graceUntil, now);
}
