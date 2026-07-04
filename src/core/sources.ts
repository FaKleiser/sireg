import { readResource } from './resources.js';
import { loadSitemap } from './sitemap.js';
import type { LoadedUrls, NormalizedConfig, Source } from '../types.js';

type SourceObject = Exclude<Source, string>;

export async function loadSources(config: NormalizedConfig): Promise<LoadedUrls> {
  const allUrls: string[] = [];
  const allSitemaps: string[] = [];

  for (const source of config.sources) {
    const loaded = await loadSource(source, config);
    allUrls.push(...loaded.urls);
    allSitemaps.push(...loaded.sitemaps);
  }

  return {
    urls: allUrls,
    sitemaps: [...new Set(allSitemaps)],
  };
}

async function loadSource(source: Source, config: NormalizedConfig): Promise<LoadedUrls> {
  const normalized = typeof source === 'string' ? guessSource(source) : source;

  if (normalized.type === 'sitemap') {
    const location = normalized.url || normalized.path;
    if (!location) {
      throw new Error('Sitemap source must define url or path.');
    }

    return loadSitemap(location, {
      cwd: config.cwd,
      userAgent: config.checks.userAgent,
      maxDepth: normalized.maxDepth,
    });
  }

  if (normalized.type === 'file') {
    const content = await readResource(normalized.path, {
      cwd: config.cwd,
      userAgent: config.checks.userAgent,
    });
    return {
      urls: content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#')),
      sitemaps: [],
    };
  }

  if (normalized.type === 'url') {
    return { urls: [normalized.url], sitemaps: [] };
  }

  throw new Error(`Unsupported source: ${JSON.stringify(source)}`);
}

function guessSource(value: string): SourceObject {
  if (/\.xml(?:\.gz)?(?:$|\?)/i.test(value)) {
    return { type: 'sitemap', url: value };
  }

  if (/^https?:\/\//i.test(value)) {
    return { type: 'url', url: value };
  }

  return { type: 'file', path: value };
}
