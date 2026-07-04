import type { UrlTransform } from '../types.js';

export function applyTransforms(url: string, transforms: UrlTransform[] = []): string {
  return transforms.reduce((current, transform) => applyTransform(current, transform), url);
}

export function applyTransform(url: string, transform: UrlTransform): string {
  if ('origin' in transform) {
    return replaceOrigin(url, transform.origin);
  }

  if ('pattern' in transform) {
    const expression = new RegExp(transform.pattern, transform.flags || '');
    return url.replace(expression, transform.replacement ?? transform.to ?? '');
  }

  if ('from' in transform) {
    return transform.once ? url.replace(transform.from, transform.to) : url.split(transform.from).join(transform.to);
  }

  return url;
}

function replaceOrigin(url: string, origin: string): string {
  const parsed = new URL(url);
  const target = new URL(origin);
  parsed.protocol = target.protocol;
  parsed.host = target.host;
  return parsed.href;
}
