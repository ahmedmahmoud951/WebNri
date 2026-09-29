import { config } from '../config';
import type { ParkingReceipt } from '../api/types';

const KEY = `${config.tokenKey}.receipts`;

export function readReceipts(): ParkingReceipt[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ParkingReceipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mergeReceipts(
  primary: ParkingReceipt[],
  extra: ParkingReceipt[] = readReceipts(),
): ParkingReceipt[] {
  const map = new Map<number, ParkingReceipt>();
  for (const item of extra) map.set(item.sessionId, item);
  for (const item of primary) {
    const current = map.get(item.sessionId);
    map.set(item.sessionId, current ? { ...item, ...current } : item);
  }
  return [...map.values()].sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt));
}

export function saveReceipt(receipt: ParkingReceipt): ParkingReceipt[] {
  const next = [receipt, ...readReceipts().filter((item) => item.sessionId !== receipt.sessionId)].slice(
    0,
    20,
  );
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
