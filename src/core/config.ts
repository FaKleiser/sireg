import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  NormalizedConfig,
  ReportConfig,
  SelectionStrategy,
  SiregConfig,
  Source,
  UrlTransform,
} from '../types.js';

export const DEFAULT_CONFIG: NormalizedConfig = {
  name: 'sireg website regression',
  cwd: process.cwd(),
  sources: [],
  transforms: [],
  select: {
    strategy: 'all',
    seed: 'sireg',
  },
  checks: {
    concurrency: 6,
    timeout: 10000,
    expectedStatus: '2xx',
    maxRedirects: 8,
    userAgent: 'sireg/1.0',
  },
  redirects: [],
  reports: [{ type: 'console' }],
};

export async function loadConfigFile(configPath: string): Promise<NormalizedConfig> {
  const absolutePath = path.resolve(configPath);
  const raw = await readFile(absolutePath, 'utf8');
  return normalizeConfig(JSON.parse(raw) as SiregConfig, path.dirname(absolutePath));
}

export function normalizeConfig(config: Partial<SiregConfig> = {}, cwd = process.cwd()): NormalizedConfig {
  const normalized: NormalizedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    name: config.name || DEFAULT_CONFIG.name,
    cwd: config.cwd ? path.resolve(cwd, config.cwd) : cwd,
    sources: normalizeSources(config.sources || []),
    transforms: normalizeTransforms(config.transforms || []),
    select: {
      ...DEFAULT_CONFIG.select,
      ...withoutUndefined(config.select || {}),
      strategy: normalizeStrategy(config.select?.strategy),
    },
    checks: {
      ...DEFAULT_CONFIG.checks,
      ...withoutUndefined(config.checks || {}),
    },
    redirects: config.redirects || [],
    reports: normalizeReports(config.reports),
  };

  validateConfig(normalized);
  return normalized;
}

export interface CliOptions {
  name?: string;
  sitemap?: string | string[];
  file?: string | string[];
  url?: string | string[];
  replace?: string | string[];
  replaceFrom?: string;
  replaceTo?: string;
  origin?: string;
  strategy?: SelectionStrategy;
  limit?: string | number;
  percent?: string | number;
  seed?: string;
  concurrency?: string | number;
  timeout?: string | number;
  expectStatus?: string;
  maxRedirects?: string | number;
  report?: string | string[];
  markdown?: string;
  html?: string;
}

export function configFromCliOptions(options: CliOptions = {}): NormalizedConfig {
  const sources: Source[] = [];
  for (const sitemap of asArray(options.sitemap)) sources.push({ type: 'sitemap', url: sitemap });
  for (const file of asArray(options.file)) sources.push({ type: 'file', path: file });
  for (const url of asArray(options.url)) sources.push({ type: 'url', url });

  const transforms: UrlTransform[] = [];
  if (options.origin) transforms.push({ origin: options.origin });
  if (options.replaceFrom !== undefined || options.replaceTo !== undefined) {
    transforms.push({ from: options.replaceFrom || '', to: options.replaceTo || '' });
  }
  for (const replace of asArray(options.replace)) {
    const separator = replace.indexOf('=');
    if (separator === -1) {
      throw new Error(`Expected --replace to use from=to syntax, received "${replace}".`);
    }
    transforms.push({ from: replace.slice(0, separator), to: replace.slice(separator + 1) });
  }

  const reports = asArray(options.report).map(parseReportOption);
  if (options.markdown) reports.push({ type: 'markdown', path: options.markdown });
  if (options.html) reports.push({ type: 'html', path: options.html });

  return normalizeConfig({
    name: options.name,
    sources,
    transforms,
    select: {
      strategy: options.strategy,
      limit: parseLimit(options.limit),
      seed: options.seed,
      percent: asNumber(options.percent),
    },
    checks: {
      concurrency: asNumber(options.concurrency),
      timeout: asNumber(options.timeout),
      expectedStatus: options.expectStatus,
      maxRedirects: asNumber(options.maxRedirects),
    },
    reports,
  });
}

function normalizeSources(sources: Source[]): Source[] {
  return asArray(sources).map((source) => {
    if (typeof source === 'string') return source;
    return source;
  });
}

function normalizeTransforms(transforms: UrlTransform[]): UrlTransform[] {
  return asArray(transforms);
}

function normalizeReports(reports: Array<ReportConfig | string> | undefined): ReportConfig[] {
  if (!reports || reports.length === 0) {
    return DEFAULT_CONFIG.reports;
  }

  return asArray(reports).map((report) => (typeof report === 'string' ? parseReportOption(report) : report));
}

function normalizeStrategy(strategy?: SelectionStrategy): SelectionStrategy {
  return strategy || DEFAULT_CONFIG.select.strategy;
}

function parseReportOption(value: string): ReportConfig {
  const [type, ...rest] = value.split(':');
  const outputPath = rest.join(':');
  if (!['console', 'json', 'markdown', 'html'].includes(type)) {
    throw new Error(`Unknown report type "${type}". Use console, json, markdown, or html.`);
  }
  return outputPath ? { type: type as ReportConfig['type'], path: outputPath } : { type: type as ReportConfig['type'] };
}

function validateConfig(config: NormalizedConfig): void {
  if (!config.sources.length && !config.redirects.length) {
    throw new Error('Configure at least one source or redirect expectation.');
  }

  if (config.checks.concurrency < 1) {
    throw new Error('checks.concurrency must be at least 1.');
  }

  if (config.checks.timeout < 1) {
    throw new Error('checks.timeout must be at least 1 millisecond.');
  }
}

function asArray<T>(value: T | T[] | undefined | null | false): T[] {
  if (value === undefined || value === null || value === false) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function asNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseLimit(value: string | number | undefined): number | 'all' | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'all') return 'all';
  return asNumber(value);
}

function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}
