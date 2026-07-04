import type { SiregReport } from '../types.js';
import { failureResults, formatDuration, resultLabel, statusLabel } from './format.js';

export function renderConsoleReport(report: SiregReport): string {
  const lines: string[] = [];
  lines.push(`${report.name}`);
  lines.push('='.repeat(report.name.length));
  lines.push(
    `${report.summary.passed}/${report.summary.total} passed (${report.summary.successRate}%) in ${formatDuration(report.summary.durationMs)}`,
  );
  lines.push(
    `Discovered ${report.summary.discovered} URL(s), selected ${report.summary.selected}, skipped ${report.summary.skipped}, redirect checks ${report.summary.redirects}.`,
  );

  const failures = failureResults(report);
  if (failures.length) {
    lines.push('');
    lines.push('Failures');
    for (const failure of failures) {
      lines.push(
        `- ${resultLabel(failure)} ${statusLabel(failure)} ${failure.targetUrl} (${failure.failureReason || failure.error || 'failed'})`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}
