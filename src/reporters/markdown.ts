import type { SiregReport } from '../types.js';
import { escapeMarkdown, formatDuration, resultLabel, resultRows, statusLabel } from './format.js';

export function renderMarkdownReport(report: SiregReport, options: { onlyFailures?: boolean } = {}): string {
  const lines: string[] = [];
  lines.push(`# ${report.name}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Result: **${report.summary.passed}/${report.summary.total} passed (${report.summary.successRate}%)**`);
  lines.push(`- Duration: ${formatDuration(report.summary.durationMs)}`);
  lines.push(`- URLs discovered: ${report.summary.discovered}`);
  lines.push(`- URLs selected: ${report.summary.selected}`);
  lines.push(`- URLs skipped: ${report.summary.skipped}`);
  lines.push(`- Redirect checks: ${report.summary.redirects}`);
  lines.push('');
  lines.push(options.onlyFailures ? '## Failures' : '## Results');
  lines.push('');
  lines.push('| Result | Status | Expected | Type | URL | Final URL | Reason |');
  lines.push('| --- | ---: | --- | --- | --- | --- | --- |');

  for (const result of resultRows(report, options.onlyFailures)) {
    lines.push(
      [
        resultLabel(result),
        statusLabel(result),
        escapeMarkdown(result.expectedStatus),
        result.type,
        escapeMarkdown(result.targetUrl),
        escapeMarkdown(result.finalUrl || ''),
        escapeMarkdown(result.failureReason || result.error || ''),
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'),
    );
  }

  return `${lines.join('\n')}\n`;
}
