import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReportConfig, SiregReport } from '../types.js';
import { renderConsoleReport } from './console.js';
import { renderHtmlReport } from './html.js';
import { renderMarkdownReport } from './markdown.js';

export async function writeReports(report: SiregReport, reports: ReportConfig[]): Promise<void> {
  for (const reportConfig of reports) {
    const rendered = renderReport(report, reportConfig);

    if (reportConfig.type === 'console' && !reportConfig.path) {
      process.stdout.write(rendered);
      continue;
    }

    if (!reportConfig.path) {
      throw new Error(`Report "${reportConfig.type}" requires a path.`);
    }

    await mkdir(path.dirname(path.resolve(report.config.cwd, reportConfig.path)), { recursive: true });
    await writeFile(path.resolve(report.config.cwd, reportConfig.path), rendered, 'utf8');
  }
}

export function renderReport(report: SiregReport, reportConfig: ReportConfig): string {
  if (reportConfig.type === 'console') {
    return renderConsoleReport(report);
  }

  if (reportConfig.type === 'markdown') {
    return renderMarkdownReport(report, reportConfig);
  }

  if (reportConfig.type === 'html') {
    return renderHtmlReport(report, reportConfig);
  }

  if (reportConfig.type === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  throw new Error(`Unknown report type: ${reportConfig.type}`);
}
