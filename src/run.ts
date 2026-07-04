import { performance } from 'node:perf_hooks';
import type { CheckResult, NormalizedConfig, SiregConfig, SiregReport } from './types.js';
import { normalizeConfig } from './core/config.js';
import { loadSources } from './core/sources.js';
import { selectUrls } from './core/select.js';
import { applyTransforms } from './core/transforms.js';
import { checkRedirect, checkUrl } from './core/http.js';
import { mapLimit } from './core/pool.js';
import { writeReports } from './reporters/index.js';

export async function runSireg(config: SiregConfig | NormalizedConfig): Promise<SiregReport> {
  const startedAt = performance.now();
  const normalized = 'cwd' in config && 'reports' in config ? normalizeConfig(config, config.cwd) : normalizeConfig(config);
  const loaded = await loadSources(normalized);
  const transformedUrls = new Map<string, { sourceUrl: string; targetUrl: string }>();
  for (const url of loaded.urls) {
    const targetUrl = applyTransforms(url, normalized.transforms);
    if (!transformedUrls.has(targetUrl)) {
      transformedUrls.set(targetUrl, { sourceUrl: url, targetUrl });
    }
  }
  const selection = selectUrls([...transformedUrls.keys()], normalized.select);
  const selectedUrlChecks = selection.selected
    .map((targetUrl) => transformedUrls.get(targetUrl))
    .filter((entry): entry is { sourceUrl: string; targetUrl: string } => Boolean(entry));

  const urlResults = await mapLimit(selectedUrlChecks, normalized.checks.concurrency, (entry) =>
    checkUrl(entry.sourceUrl, entry.targetUrl, normalized.checks),
  );
  const redirectResults = await mapLimit(normalized.redirects, normalized.checks.concurrency, (redirect) =>
    checkRedirect(redirect, normalized.checks),
  );
  const results: CheckResult[] = [...urlResults, ...redirectResults];
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  const durationMs = Math.round(performance.now() - startedAt);

  return {
    name: normalized.name,
    generatedAt: new Date().toISOString(),
    selection,
    sitemaps: loaded.sitemaps,
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      successRate: results.length ? Math.round((passed / results.length) * 10000) / 100 : 100,
      durationMs,
      selected: selection.selected.length,
      skipped: selection.skipped,
      discovered: selection.total,
      redirects: redirectResults.length,
    },
    config: normalized,
  };
}

export async function runAndReport(config: SiregConfig | NormalizedConfig): Promise<SiregReport> {
  const report = await runSireg(config);
  await writeReports(report, report.config.reports);
  return report;
}
