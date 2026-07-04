import type { StatusExpectation } from '../types.js';

const STATUS_ALIASES = new Map<string, string>([
  ['ok', '2xx'],
  ['success', '2xx'],
  ['redirect', '30x'],
  ['redirects', '30x'],
]);

export function normalizeStatusExpectation(expectation: StatusExpectation = '2xx'): string {
  if (Array.isArray(expectation)) {
    return expectation.map((item) => normalizeStatusExpectation(item)).join(',');
  }

  if (typeof expectation === 'number') {
    return String(expectation);
  }

  const value = String(expectation || '2xx').trim().toLowerCase();
  return STATUS_ALIASES.get(value) || value;
}

export function statusMatches(status: number | undefined, expectation: StatusExpectation = '2xx'): boolean {
  if (!Number.isInteger(status)) {
    return false;
  }

  const normalized = normalizeStatusExpectation(expectation);
  const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean);

  return parts.some((part) => {
    if (/^[1-5]xx$/.test(part)) {
      const start = Number(part[0]) * 100;
      return status! >= start && status! <= start + 99;
    }

    if (/^[1-5]0x$/.test(part)) {
      const start = Number(part[0]) * 100;
      return status! >= start && status! <= start + 9;
    }

    const range = part.match(/^(\d{3})-(\d{3})$/);
    if (range) {
      return status! >= Number(range[1]) && status! <= Number(range[2]);
    }

    const exact = Number(part);
    return Number.isInteger(exact) && status === exact;
  });
}

export function isRedirectStatus(status: number | undefined): boolean {
  return Number.isInteger(status) && status! >= 300 && status! <= 399;
}
