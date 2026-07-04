import type { SiregReport } from '../types.js';
import { escapeHtml, formatDuration, resultLabel, resultRows, statusLabel } from './format.js';

export function renderHtmlReport(report: SiregReport, options: { onlyFailures?: boolean } = {}): string {
  const failed = report.summary.failed > 0;
  const rows = resultRows(report, options.onlyFailures)
    .map((result) => {
      const chain = result.redirectChain
        .map((hop) => `${hop.status} ${hop.url}${hop.location ? ` -> ${hop.location}` : ''}`)
        .join('\n');
      return `<tr class="${result.passed ? 'passed' : 'failed'}">
        <td><span class="pill ${result.passed ? 'good' : 'bad'}">${escapeHtml(resultLabel(result))}</span></td>
        <td>${escapeHtml(statusLabel(result))}</td>
        <td>${escapeHtml(result.expectedStatus)}</td>
        <td>${escapeHtml(result.type)}</td>
        <td class="url">${escapeHtml(result.targetUrl)}</td>
        <td class="url">${escapeHtml(result.finalUrl || '')}</td>
        <td>${escapeHtml(result.failureReason || result.error || '')}</td>
        <td><pre>${escapeHtml(chain)}</pre></td>
      </tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(report.name)} - sireg report</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fb;
      --panel: #ffffff;
      --text: #172033;
      --muted: #657086;
      --line: #dce2ec;
      --good: #0f8a4b;
      --good-bg: #e8f7ef;
      --bad: #c02b2b;
      --bad-bg: #fff0f0;
      --accent: #1f5eff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    header {
      padding: 40px 24px 20px;
      background: var(--panel);
      border-bottom: 1px solid var(--line);
    }
    main { max-width: 1180px; margin: 0 auto; padding: 28px 20px 48px; }
    .wrap { max-width: 1180px; margin: 0 auto; }
    .eyebrow { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
    h1 { margin: 0; font-size: 32px; line-height: 1.2; letter-spacing: 0; }
    .status { margin-top: 16px; font-size: 18px; font-weight: 700; color: ${failed ? 'var(--bad)' : 'var(--good)'}; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(140px, 1fr)); gap: 12px; margin: 24px 0; }
    .metric { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px; }
    .metric strong { display: block; font-size: 24px; line-height: 1.2; }
    .metric span { color: var(--muted); font-size: 13px; }
    .table-wrap { overflow-x: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; min-width: 980px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; font-size: 14px; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; background: #fbfcff; }
    tr:last-child td { border-bottom: 0; }
    .url { max-width: 320px; overflow-wrap: anywhere; }
    .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 700; }
    .pill.good { background: var(--good-bg); color: var(--good); }
    .pill.bad { background: var(--bad-bg); color: var(--bad); }
    pre { margin: 0; white-space: pre-wrap; font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--muted); }
    @media (max-width: 760px) {
      header { padding-top: 28px; }
      h1 { font-size: 26px; }
      .metrics { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <p class="eyebrow">sireg report - generated ${escapeHtml(report.generatedAt)}</p>
      <h1>${escapeHtml(report.name)}</h1>
      <div class="status">${escapeHtml(report.summary.passed)}/${escapeHtml(report.summary.total)} checks passed (${escapeHtml(report.summary.successRate)}%)</div>
    </div>
  </header>
  <main>
    <section class="metrics" aria-label="summary">
      <div class="metric"><strong>${escapeHtml(report.summary.passed)}</strong><span>Passed</span></div>
      <div class="metric"><strong>${escapeHtml(report.summary.failed)}</strong><span>Failed</span></div>
      <div class="metric"><strong>${escapeHtml(report.summary.selected)}</strong><span>URLs selected</span></div>
      <div class="metric"><strong>${escapeHtml(report.summary.skipped)}</strong><span>URLs skipped</span></div>
      <div class="metric"><strong>${escapeHtml(formatDuration(report.summary.durationMs))}</strong><span>Duration</span></div>
    </section>
    <section class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Result</th>
            <th>Status</th>
            <th>Expected</th>
            <th>Type</th>
            <th>URL</th>
            <th>Final URL</th>
            <th>Reason</th>
            <th>Redirect chain</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8">No results to show.</td></tr>'}
        </tbody>
      </table>
    </section>
  </main>
</body>
</html>
`;
}
