import type { WriteStream } from 'node:tty';
import type { CheckResult, RunProgressEvent } from '../types.js';
import { formatDuration } from './format.js';

const SPINNER_FRAMES = ['-', '\\', '|', '/'];
const BAR_WIDTH = 24;

export interface LiveConsoleOptions {
  stream?: WriteStream;
  enabled?: boolean;
}

export class LiveConsoleProgress {
  private readonly stream: WriteStream;
  private readonly enabled: boolean;
  private readonly startedAt = Date.now();
  private timer: NodeJS.Timeout | undefined;
  private frame = 0;
  private phase = 'Starting';
  private message = 'Starting sireg';
  private total = 0;
  private completed = 0;
  private passed = 0;
  private failed = 0;
  private lastResult: CheckResult | undefined;
  private rendered = false;

  constructor(options: LiveConsoleOptions = {}) {
    this.stream = options.stream || process.stderr;
    this.enabled = options.enabled ?? Boolean(this.stream.isTTY && !process.env.CI);
  }

  start(): void {
    if (!this.enabled || this.timer) return;
    this.timer = setInterval(() => this.render(), 80);
    this.render();
  }

  handle(event: RunProgressEvent): void {
    if (!this.enabled) return;

    if (event.type === 'phase') {
      this.phase = titleCase(event.phase);
      this.message = event.message;
    } else if (event.type === 'loaded') {
      this.message = `Loaded ${event.urls} URL(s) from ${event.sitemaps} sitemap(s)`;
    } else if (event.type === 'selected') {
      this.total = event.total;
      this.completed = 0;
      this.passed = 0;
      this.failed = 0;
      this.message = `Selected ${event.selected}/${event.discovered} URL(s), skipped ${event.skipped}, redirects ${event.redirects}`;
    } else if (event.type === 'check-complete') {
      this.completed = event.completed;
      this.total = event.total;
      this.passed = event.passed;
      this.failed = event.failed;
      this.lastResult = event.result;
      this.message = event.result.targetUrl;
    } else if (event.type === 'done') {
      this.completed = event.report.summary.total;
      this.total = event.report.summary.total;
      this.passed = event.report.summary.passed;
      this.failed = event.report.summary.failed;
      this.message = `${event.report.summary.passed}/${event.report.summary.total} passed`;
    }

    this.render();
  }

  stop(): void {
    if (!this.enabled) return;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.rendered) {
      this.clearLine();
      this.stream.write('\n');
      this.rendered = false;
    }
  }

  private render(): void {
    if (!this.enabled) return;

    const frame = SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length];
    this.frame += 1;
    const percent = this.total ? Math.floor((this.completed / this.total) * 100) : 0;
    const elapsed = formatDuration(Date.now() - this.startedAt);
    const progress = this.total ? `${this.completed}/${this.total} ${renderBar(percent)} ${percent}%` : 'discovering';
    const stats = `ok ${this.passed} fail ${this.failed}`;
    const suffix = this.lastResult && !this.lastResult.passed ? ` | last issue: ${truncate(this.lastResult.targetUrl, 52)}` : '';
    const line = `${frame} ${this.phase}: ${truncate(this.message, 64)} | ${progress} | ${stats} | ${elapsed}${suffix}`;

    this.clearLine();
    this.stream.write(truncate(line, this.stream.columns || 120));
    this.rendered = true;
  }

  private clearLine(): void {
    this.stream.cursorTo(0);
    this.stream.clearLine(0);
  }
}

function renderBar(percent: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((percent / 100) * BAR_WIDTH)));
  return `[${'#'.repeat(filled)}${'.'.repeat(BAR_WIDTH - filled)}]`;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function titleCase(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
