import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function isFileUrl(value: string): boolean {
  return /^file:\/\//i.test(value);
}

export function absoluteResource(location: string, cwd = process.cwd()): string {
  if (isHttpUrl(location) || isFileUrl(location)) {
    return location;
  }

  return path.resolve(cwd, location);
}

export function resolveResource(base: string, child: string, cwd = process.cwd()): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(child)) {
    return child;
  }

  if (isHttpUrl(base) || isFileUrl(base)) {
    return new URL(child, base).href;
  }

  return path.resolve(path.dirname(path.resolve(cwd, base)), child);
}

export async function readResource(location: string, options: { cwd?: string; userAgent?: string } = {}): Promise<string> {
  const resolved = absoluteResource(location, options.cwd);

  if (isHttpUrl(resolved)) {
    const response = await fetch(resolved, {
      headers: {
        'user-agent': options.userAgent || 'sireg/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Could not load ${resolved}: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return decodeResource(buffer, resolved, response.headers.get('content-encoding') || '');
  }

  const filePath = isFileUrl(resolved) ? fileURLToPath(resolved) : resolved;
  const buffer = await readFile(filePath);
  return decodeResource(buffer, resolved);
}

export function asFileUrl(filePath: string): string {
  return pathToFileURL(path.resolve(filePath)).href;
}

function decodeResource(buffer: Buffer, location: string, contentEncoding = ''): string {
  const shouldGunzip = /\.gz$/i.test(location) || /\bgzip\b/i.test(contentEncoding);
  const decoded = shouldGunzip ? gunzipSync(buffer) : buffer;
  return decoded.toString('utf8');
}
