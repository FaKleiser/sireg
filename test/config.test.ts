import { strict as assert } from 'node:assert';
import test from 'node:test';
import { configFromCliOptions, normalizeConfig } from '../src/index.js';

test('CLI options build a friendly default config', () => {
  const config = configFromCliOptions({
    sitemap: 'https://example.com/sitemap.xml',
    origin: 'http://localhost:3000',
    strategy: 'random',
    limit: '10',
    seed: 'ci',
    html: 'reports/sireg.html',
  });

  assert.equal(config.sources.length, 1);
  const transform = config.transforms[0];
  assert.ok(transform && 'origin' in transform);
  assert.equal(transform.origin, 'http://localhost:3000');
  assert.equal(config.select.strategy, 'random');
  assert.equal(config.select.limit, 10);
  assert.equal(config.reports.some((report) => report.type === 'html'), true);
});

test('normalization rejects configs without work', () => {
  assert.throws(() => normalizeConfig({ sources: [] }), /at least one source or redirect/);
});
