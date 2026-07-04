export { runAndReport, runSireg } from './run.js';
export { loadConfigFile, normalizeConfig, configFromCliOptions } from './core/config.js';
export { loadSitemap } from './core/sitemap.js';
export { loadSources } from './core/sources.js';
export { selectUrls } from './core/select.js';
export { applyTransform, applyTransforms } from './core/transforms.js';
export { statusMatches, normalizeStatusExpectation } from './core/status.js';
export { renderReport } from './reporters/index.js';
export { LiveConsoleProgress } from './reporters/live-console.js';
export type {
  CheckConfig,
  CheckResult,
  LoadedUrls,
  NormalizedConfig,
  RedirectExpectation,
  ReportConfig,
  RunSummary,
  RunOptions,
  RunProgressEvent,
  SelectionConfig,
  SiregConfig,
  SiregReport,
  Source,
  StatusExpectation,
  UrlSelection,
  UrlTransform,
} from './types.js';
