import { strict as assert } from 'node:assert';
import { mkdtemp, writeFile } from 'node:fs/promises';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  LiveConsoleProgress,
  loadSources,
  normalizeConfig,
  renderReport,
  runSireg,
  selectUrls,
  statusMatches,
} from '../src/index.js';

test('status expectations support ranges, classes, and exact codes', () => {
  assert.equal(statusMatches(200, '2xx'), true);
  assert.equal(statusMatches(302, '30x'), true);
  assert.equal(statusMatches(204, '200-204'), true);
  assert.equal(statusMatches(404, ['2xx', 404]), true);
  assert.equal(statusMatches(500, '2xx'), false);
});

test('random selection is deterministic and bounded', () => {
  const urls = ['https://a.test/1', 'https://a.test/2', 'https://a.test/3', 'https://a.test/4'];
  const first = selectUrls(urls, { strategy: 'random', limit: 2, seed: 'release-42' });
  const second = selectUrls(urls, { strategy: 'random', limit: 2, seed: 'release-42' });

  assert.deepEqual(first.selected, second.selected);
  assert.equal(first.selected.length, 2);
  assert.equal(first.skipped, 2);
});

test('runs nested sitemap checks with transforms and redirect expectations', async () => {
  const server = await createServer((request, response, baseUrl) => {
    if (request.url === '/sitemap.xml') {
      response.writeHead(200, { 'content-type': 'application/xml' });
      response.end(`
        <sitemapindex>
          <sitemap><loc>${baseUrl}/pages.xml</loc></sitemap>
        </sitemapindex>
      `);
      return;
    }

    if (request.url === '/pages.xml') {
      response.writeHead(200, { 'content-type': 'application/xml' });
      response.end(`
        <urlset>
          <url><loc>https://production.example/ok</loc></url>
          <url><loc>https://production.example/moved-target</loc></url>
        </urlset>
      `);
      return;
    }

    if (request.url === '/old') {
      response.writeHead(301, { location: '/moved-target' });
      response.end();
      return;
    }

    if (request.url === '/ok' || request.url === '/moved-target') {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
      return;
    }

    response.writeHead(404);
    response.end('missing');
  });

  try {
    const report = await runSireg({
      name: 'test site',
      sources: [{ type: 'sitemap', url: `${server.url}/sitemap.xml` }],
      transforms: [{ origin: server.url }],
      checks: { concurrency: 2, timeout: 2000 },
      redirects: [{ from: `${server.url}/old`, to: `${server.url}/moved-target` }],
    });

    assert.equal(report.summary.total, 3);
    assert.equal(report.summary.passed, 3);
    assert.equal(report.sitemaps.length, 2);
    assert.equal(report.results.find((result) => result.type === 'redirect')?.redirectChain[0]?.status, 301);
  } finally {
    await server.close();
  }
});

test('emits progress events while checks are running', async () => {
  const server = await createServer((request, response, baseUrl) => {
    if (request.url === '/sitemap.xml') {
      response.writeHead(200, { 'content-type': 'application/xml' });
      response.end(`
        <urlset>
          <url><loc>${baseUrl}/ok</loc></url>
          <url><loc>${baseUrl}/broken</loc></url>
        </urlset>
      `);
      return;
    }

    response.writeHead(request.url === '/ok' ? 200 : 500);
    response.end();
  });

  try {
    const events: string[] = [];
    const report = await runSireg(
      {
        sources: [{ type: 'sitemap', url: `${server.url}/sitemap.xml` }],
        checks: { concurrency: 1, timeout: 2000 },
      },
      {
        onProgress: (event) => {
          events.push(event.type);
          if (event.type === 'check-complete') {
            events.push(`${event.completed}/${event.total}/${event.passed}/${event.failed}`);
          }
        },
      },
    );

    assert.equal(report.summary.total, 2);
    assert.equal(report.summary.passed, 1);
    assert.equal(report.summary.failed, 1);
    assert.deepEqual(events.filter((event) => event === 'check-complete'), ['check-complete', 'check-complete']);
    assert.ok(events.includes('loaded'));
    assert.ok(events.includes('selected'));
    assert.ok(events.includes('1/2/1/0'));
    assert.ok(events.includes('2/2/1/1'));
    assert.equal(events.at(-1), 'done');
  } finally {
    await server.close();
  }
});

test('live console progress renders check stats to a TTY stream', () => {
  const writes: string[] = [];
  const stream = {
    isTTY: true,
    columns: 120,
    write: (value: string) => {
      writes.push(value);
      return true;
    },
    cursorTo: () => undefined,
    clearLine: () => undefined,
  };
  const progress = new LiveConsoleProgress({ stream: stream as never, enabled: true });

  progress.handle({ type: 'phase', phase: 'checking', message: 'Checking 2 URL(s)' });
  progress.handle({
    type: 'check-complete',
    completed: 1,
    total: 2,
    passed: 1,
    failed: 0,
    result: {
      type: 'url',
      sourceUrl: 'https://example.test/ok',
      targetUrl: 'https://example.test/ok',
      expectedStatus: '2xx',
      finalStatus: 200,
      redirectChain: [],
      durationMs: 12,
      passed: true,
    },
  });
  progress.stop();

  assert.match(writes.join(''), /Checking/);
  assert.match(writes.join(''), /1\/2/);
  assert.match(writes.join(''), /ok 1 fail 0/);
});

test('reports failures in markdown and html artifacts', async () => {
  const server = await createServer((request, response) => {
    response.writeHead(request.url === '/ok' ? 200 : 500);
    response.end();
  });

  try {
    const report = await runSireg({
      name: 'report test',
      sources: [{ type: 'url', url: `${server.url}/broken` }],
      checks: { timeout: 2000 },
    });
    const markdown = renderReport(report, { type: 'markdown' });
    const html = renderReport(report, { type: 'html' });

    assert.match(markdown, /0\/1 passed/);
    assert.match(markdown, /Expected final status 2xx, received 500/);
    assert.match(html, /<table>/);
    assert.match(html, /report test/);
  } finally {
    await server.close();
  }
});

test('loads URLs from a local file source', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sireg-'));
  const file = path.join(dir, 'urls.txt');
  await writeFile(file, ['# comment', 'https://example.test/a', '', 'https://example.test/b'].join('\n'));

  const loaded = await loadSources(normalizeConfig({ sources: [{ type: 'file', path: file }] }));

  assert.deepEqual(loaded.urls, ['https://example.test/a', 'https://example.test/b']);
});

async function createServer(
  handler: (request: IncomingMessage, response: ServerResponse, baseUrl: string) => void,
): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer((request, response) => handler(request, response, baseUrl));
  let baseUrl = '';

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Expected TCP server address.');
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  return {
    url: baseUrl,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}
