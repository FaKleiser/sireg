import type { LoadedUrls } from '../types.js';
import { readResource, resolveResource } from './resources.js';

export async function loadSitemap(
  location: string,
  options: { cwd?: string; userAgent?: string; maxDepth?: number } = {},
): Promise<LoadedUrls> {
  const maxDepth = options.maxDepth ?? 8;
  const state = {
    cwd: options.cwd,
    userAgent: options.userAgent,
    maxDepth,
    seen: new Set<string>(),
    urls: [] as string[],
    sitemaps: [] as string[],
  };

  await walkSitemap(location, location, 0, state);

  return {
    urls: state.urls,
    sitemaps: state.sitemaps,
  };
}

async function walkSitemap(
  location: string,
  base: string,
  depth: number,
  state: {
    cwd?: string;
    userAgent?: string;
    maxDepth: number;
    seen: Set<string>;
    urls: string[];
    sitemaps: string[];
  },
): Promise<void> {
  const resolved = resolveResource(base, location, state.cwd);
  if (state.seen.has(resolved)) {
    return;
  }

  if (depth > state.maxDepth) {
    throw new Error(`Sitemap nesting is deeper than maxDepth=${state.maxDepth}: ${resolved}`);
  }

  state.seen.add(resolved);
  state.sitemaps.push(resolved);

  const xml = await readResource(resolved, state);
  const locs = extractLocs(xml);

  if (isSitemapIndex(xml)) {
    for (const child of locs) {
      await walkSitemap(child, resolved, depth + 1, state);
    }
    return;
  }

  for (const loc of locs) {
    state.urls.push(resolveUrlLoc(resolved, loc, state.cwd));
  }
}

function isSitemapIndex(xml: string): boolean {
  return /<\s*sitemapindex[\s>]/i.test(xml);
}

function extractLocs(xml: string): string[] {
  const locs: string[] = [];
  const locPattern = /<\s*loc(?:\s[^>]*)?>([\s\S]*?)<\s*\/\s*loc\s*>/gi;
  let match: RegExpExecArray | null;

  while ((match = locPattern.exec(xml))) {
    const value = decodeXml(match[1].trim());
    if (value) {
      locs.push(value);
    }
  }

  return locs;
}

function resolveUrlLoc(base: string, loc: string, cwd?: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(loc)) {
    return loc;
  }

  return resolveResource(base, loc, cwd);
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
