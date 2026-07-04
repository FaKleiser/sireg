import { performance } from 'node:perf_hooks';
import type { CheckResult, NormalizedConfig, RunOptions, RunProgressEvent, SiregConfig, SiregReport } from './types.js';
import { normalizeConfig } from './core/config.js';
import { loadSources } from './core/sources.js';
import { selectUrls } from './core/select.js';
import { applyTransforms } from './core/transforms.js';
import { checkRedirect, checkUrl } from './core/http.js';
import { mapLimit } from './core/pool.js';
import { writeReports } from './reporters/index.js';

export async function runSireg(config: SiregConfig | NormalizedConfig, options: RunOptions = {}): Promise<SiregReport> {
  const startedAt = performance.now();
  const normalized = 'cwd' in config && 'reports' in config ? normalizeConfig(config, config.cwd) : normalizeConfig(config);
  emitProgress(options, { type: 'phase', phase: 'loading', message: 'Loading URL sources' });
  const loaded = await loadSources(normalized);
  emitProgress(options, { type: 'loaded', urls: loaded.urls.length, sitemaps: loaded.sitemaps.length });
  emitProgress(options, { type: 'phase', phase: 'selecting', message: 'Selecting URLs to check' });
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
  const totalChecks = selectedUrlChecks.length + normalized.redirects.length;
  emitProgress(options, {
    type: 'selected',
    discovered: selection.total,
    selected: selection.selected.length,
    skipped: selection.skipped,
    redirects: normalized.redirects.length,
    total: totalChecks,
  });

  emitProgress(options, { type: 'phase', phase: 'checking', message: `Checking ${totalChecks} URL(s)` });
  let completed = 0;
  let passed = 0;
  let failed = 0;
  const checkJobs: Array<() => Promise<CheckResult>> = [
    ...selectedUrlChecks.map((entry) => () => checkUrl(entry.sourceUrl, entry.targetUrl, normalized.checks)),
    ...normalized.redirects.map((redirect) => () => checkRedirect(redirect, normalized.checks)),
  ];
  const results = await mapLimit(checkJobs, normalized.checks.concurrency, (job) => job(), (result) => {
    completed += 1;
    if (result.passed) {
      passed += 1;
    } else {
      failed += 1;
    }
    emitProgress(options, { type: 'check-complete', result, completed, total: totalChecks, passed, failed });
  });
  const redirectResults = results.filter((result) => result.type === 'redirect');
  const finalPassed = results.filter((result) => result.passed).length;
  const finalFailed = results.length - finalPassed;
  const durationMs = Math.round(performance.now() - startedAt);

  const report: SiregReport = {
    name: normalized.name,
    generatedAt: new Date().toISOString(),
    selection,
    sitemaps: loaded.sitemaps,
    results,
    summary: {
      total: results.length,
      passed: finalPassed,
      failed: finalFailed,
      successRate: results.length ? Math.round((finalPassed / results.length) * 10000) / 100 : 100,
      durationMs,
      selected: selection.selected.length,
      skipped: selection.skipped,
      discovered: selection.total,
      redirects: redirectResults.length,
    },
    config: normalized,
  };
  emitProgress(options, { type: 'done', report });

  return report;
}

export async function runAndReport(config: SiregConfig | NormalizedConfig, options: RunOptions = {}): Promise<SiregReport> {
  const report = await runSireg(config, options);
  emitProgress(options, { type: 'phase', phase: 'reporting', message: 'Writing reports' });
  await writeReports(report, report.config.reports);
  return report;
}

function emitProgress(options: RunOptions, event: RunProgressEvent): void {
  options.onProgress?.(event);
}
