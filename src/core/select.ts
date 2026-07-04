import type { SelectionConfig, UrlSelection } from '../types.js';

export function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

export function selectUrls(urls: string[], selection: SelectionConfig = {}): UrlSelection {
  const deduped = uniqueUrls(urls);
  const strategy = selection.strategy || 'all';
  const limit = normalizeLimit(selection.limit, deduped.length);

  let selected: string[];
  if (strategy === 'first') {
    selected = deduped.slice(0, limit);
  } else if (strategy === 'random') {
    selected = shuffle(deduped, selection.seed || 'sireg').slice(0, limit);
  } else if (strategy === 'percent') {
    const percent = Math.max(0, Math.min(100, Number(selection.percent ?? 100)));
    selected = shuffle(deduped, selection.seed || 'sireg').slice(0, Math.ceil(deduped.length * (percent / 100)));
  } else {
    selected = deduped.slice(0, limit);
  }

  return {
    strategy,
    total: deduped.length,
    selected,
    skipped: Math.max(0, deduped.length - selected.length),
  };
}

function normalizeLimit(limit: SelectionConfig['limit'], total: number): number {
  if (limit === undefined || limit === null || limit === 'all') {
    return total;
  }

  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return total;
  }

  return Math.min(total, Math.floor(parsed));
}

function shuffle(values: string[], seed: string): string[] {
  const random = createRandom(seed);
  return values
    .map((value) => ({ value, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.value);
}

function createRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
