export type Source =
  | string
  | { type: 'sitemap'; url?: string; path?: string; maxDepth?: number }
  | { type: 'file'; path: string }
  | { type: 'url'; url: string };

export type UrlTransform =
  | { origin: string }
  | { from: string; to: string; once?: boolean }
  | { pattern: string; replacement?: string; to?: string; flags?: string };

export type SelectionStrategy = 'all' | 'first' | 'random' | 'percent';

export interface SelectionConfig {
  strategy?: SelectionStrategy;
  limit?: number | 'all';
  percent?: number;
  seed?: string;
}

export interface CheckConfig {
  concurrency?: number;
  timeout?: number;
  expectedStatus?: StatusExpectation;
  maxRedirects?: number;
  userAgent?: string;
}

export type StatusExpectation = string | number | Array<string | number>;

export interface RedirectExpectation {
  from: string;
  to?: string;
  toPattern?: string;
  expectedStatus?: StatusExpectation;
  finalStatus?: StatusExpectation;
  maxRedirects?: number;
}

export type ReportType = 'console' | 'json' | 'markdown' | 'html';

export interface ReportConfig {
  type: ReportType;
  path?: string;
  onlyFailures?: boolean;
}

export interface SiregConfig {
  name?: string;
  cwd?: string;
  sources: Source[];
  transforms?: UrlTransform[];
  select?: SelectionConfig;
  checks?: CheckConfig;
  redirects?: RedirectExpectation[];
  reports?: ReportConfig[];
}

export interface NormalizedConfig {
  name: string;
  cwd: string;
  sources: Source[];
  transforms: UrlTransform[];
  select: SelectionConfig & { strategy: SelectionStrategy; seed: string };
  checks: Required<CheckConfig>;
  redirects: RedirectExpectation[];
  reports: ReportConfig[];
}

export interface LoadedUrls {
  urls: string[];
  sitemaps: string[];
}

export interface UrlSelection {
  strategy: SelectionStrategy;
  total: number;
  selected: string[];
  skipped: number;
}

export interface RedirectHop {
  url: string;
  status: number;
  location?: string;
}

export interface CheckResult {
  type: 'url' | 'redirect';
  sourceUrl: string;
  targetUrl: string;
  expectedStatus: string;
  finalUrl?: string;
  finalStatus?: number;
  redirectChain: RedirectHop[];
  durationMs: number;
  passed: boolean;
  failureReason?: string;
  error?: string;
}

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
  durationMs: number;
  selected: number;
  skipped: number;
  discovered: number;
  redirects: number;
}

export interface SiregReport {
  name: string;
  generatedAt: string;
  summary: RunSummary;
  selection: UrlSelection;
  sitemaps: string[];
  results: CheckResult[];
  config: NormalizedConfig;
}
