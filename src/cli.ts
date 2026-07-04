#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { configFromCliOptions, loadConfigFile } from './core/config.js';
import { runSireg } from './run.js';
import { LiveConsoleProgress } from './reporters/live-console.js';
import { writeReports } from './reporters/index.js';

const HELP = `sireg - website regression checks from sitemaps and URL lists

Usage:
  sireg check --sitemap <url-or-file> [options]
  sireg check --config <path>
  sireg test <config>

Sources:
  --sitemap <value>        Load URLs from a sitemap.xml, sitemap index, or .xml.gz file
  --file <path>            Load URLs from a newline-delimited file
  --url <url>              Check one URL directly

Transforms:
  --origin <origin>        Replace every discovered URL origin, e.g. http://localhost:3000
  --replace <from=to>      Replace text in every URL. Can be used multiple times

Selection:
  --strategy <all|first|random|percent>
  --limit <number|all>     Limit selected URLs for first/random strategies
  --percent <number>       Percent of URLs to select for percent strategy
  --seed <value>           Stable seed for random selection

Checks:
  --expect-status <rule>   Expected final status, e.g. 2xx, 200, 200-204 (default: 2xx)
  --concurrency <number>   Parallel requests (default: 6)
  --timeout <ms>           Request timeout in milliseconds (default: 10000)
  --max-redirects <count>  Maximum redirect hops to follow (default: 8)

Reports:
  --report <type:path>     Write json, markdown, html, or console report
  --markdown <path>        Shortcut for --report markdown:path
  --html <path>            Shortcut for --report html:path
  --no-progress            Disable the interactive TTY progress UI

Examples:
  sireg check --sitemap https://example.com/sitemap.xml
  sireg check --sitemap https://example.com/sitemap.xml --origin http://localhost:3000
  sireg check --config sireg.config.json --html reports/sireg.html
`;

export async function main(argv = process.argv.slice(2)): Promise<void> {
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    return;
  }

  const command = argv[0];
  const args = command === 'check' || command === 'test' ? argv.slice(1) : argv;
  const progress = new LiveConsoleProgress({ enabled: !args.includes('--no-progress') });

  try {
    const config = await resolveConfig(command, args);
    progress.start();
    const report = await runSireg(config, { onProgress: (event) => progress.handle(event) });
    progress.stop();
    await writeReports(report, report.config.reports);
    process.exitCode = report.summary.failed > 0 ? 1 : 0;
  } catch (error) {
    progress.stop();
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`sireg failed: ${message}\n`);
    process.exitCode = 1;
  }
}

async function resolveConfig(command: string, args: string[]) {
  if (command === 'test') {
    const configPath = args[0];
    if (!configPath) throw new Error('Usage: sireg test <config>');
    return loadConfigFile(configPath);
  }

  const parsed = parseArgs({
    args,
    allowPositionals: true,
    options: {
      config: { type: 'string' },
      name: { type: 'string' },
      sitemap: { type: 'string', multiple: true },
      file: { type: 'string', multiple: true },
      url: { type: 'string', multiple: true },
      origin: { type: 'string' },
      replace: { type: 'string', multiple: true },
      strategy: { type: 'string' },
      limit: { type: 'string' },
      percent: { type: 'string' },
      seed: { type: 'string' },
      concurrency: { type: 'string' },
      timeout: { type: 'string' },
      'expect-status': { type: 'string' },
      'max-redirects': { type: 'string' },
      report: { type: 'string', multiple: true },
      markdown: { type: 'string' },
      html: { type: 'string' },
      'no-progress': { type: 'boolean' },
    },
  });

  if (parsed.values.config) {
    const loaded = await loadConfigFile(parsed.values.config);
    if (parsed.values.markdown || parsed.values.html || parsed.values.report) {
      loaded.reports = [
        ...(parsed.values.report || []).map((value) => parseReportOverride(value)),
        ...(parsed.values.markdown ? [{ type: 'markdown' as const, path: parsed.values.markdown }] : []),
        ...(parsed.values.html ? [{ type: 'html' as const, path: parsed.values.html }] : []),
      ];
    }
    return loaded;
  }

  if (parsed.positionals.length === 1 && command !== 'check') {
    return loadConfigFile(parsed.positionals[0]);
  }

  return configFromCliOptions({
    name: parsed.values.name,
    sitemap: parsed.values.sitemap,
    file: parsed.values.file,
    url: parsed.values.url,
    origin: parsed.values.origin,
    replace: parsed.values.replace,
    strategy: parsed.values.strategy as never,
    limit: parsed.values.limit,
    percent: parsed.values.percent,
    seed: parsed.values.seed,
    concurrency: parsed.values.concurrency,
    timeout: parsed.values.timeout,
    expectStatus: parsed.values['expect-status'],
    maxRedirects: parsed.values['max-redirects'],
    report: parsed.values.report,
    markdown: parsed.values.markdown,
    html: parsed.values.html,
  });
}

function parseReportOverride(value: string) {
  const [type, ...rest] = value.split(':');
  return { type: type as never, path: rest.join(':') || undefined };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
