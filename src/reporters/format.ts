import type { CheckResult, SiregReport } from '../types.js';

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function statusLabel(result: CheckResult): string {
  return result.finalStatus === undefined ? 'ERR' : String(result.finalStatus);
}

export function resultLabel(result: CheckResult): string {
  return result.passed ? 'PASS' : 'FAIL';
}

export function failureResults(report: SiregReport): CheckResult[] {
  return report.results.filter((result) => !result.passed);
}

export function resultRows(report: SiregReport, onlyFailures = false): CheckResult[] {
  return onlyFailures ? failureResults(report) : report.results;
}

export function escapeHtml(value: string | number | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeMarkdown(value: string | number | undefined): string {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
