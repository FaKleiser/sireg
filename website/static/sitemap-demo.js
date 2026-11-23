const maxChildFiles = 6;
const maxFileBytes = 5 * 1024 * 1024;
const previewTimeoutMs = 8000;
const number = new Intl.NumberFormat();
const form = document.querySelector('.sitemap-form');
const source = form.elements.source;
const submit = form.querySelector('button');
const status = form.querySelector('.sitemap-status');
const command = document.querySelector('#sitemap-command');

form.hidden = false;
source.addEventListener('input', () => source.setCustomValidity(''));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  let sitemap;
  try {
    sitemap = sitemapUrl(source.value);
  } catch {
    source.setCustomValidity('Enter a valid domain or an HTTP(S) sitemap URL.');
    source.reportValidity();
    return;
  }

  command.textContent = localCommand(sitemap);
  if (sitemap.protocol === 'http:' && location.protocol === 'https:') {
    status.textContent = 'This HTTPS page cannot preview an HTTP sitemap. Use the command below to check it.';
    return;
  }

  submit.disabled = true;
  status.textContent = 'Reading sitemap…';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), previewTimeoutMs);
  try {
    const { pages, files, partial } = await previewSitemap(sitemap, controller.signal);
    const stats = number.format(pages) + (pages === 1 ? ' page URL' : ' page URLs') +
      ' in ' + number.format(files) + (files === 1 ? ' sitemap file' : ' sitemap files');
    status.textContent = partial
      ? 'Partial preview: ' + stats + ' read. Some entries or child sitemaps were skipped or unavailable. The CLI checks the full sitemap.'
      : 'Found ' + stats + '.';
  } catch (error) {
    const reason = controller.signal.aborted ? 'The preview timed out.' : error.message;
    status.textContent = reason + ' You can still try the command below.';
  } finally {
    clearTimeout(timer);
    submit.disabled = false;
  }
});

function sitemapUrl(value) {
  const input = value.trim();
  const url = new URL(input.includes('://') ? input : 'https://' + input);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Expected a public web URL.');
  }
  if (url.pathname === '/') url.pathname = '/sitemap.xml';
  url.hash = '';
  return url;
}

function localCommand(sitemap) {
  // Quote the complete argument, including query parameters, for POSIX shells.
  const escaped = "'" + sitemap.href.replaceAll("'", "'\"'\"'") + "'";
  return [
    'npm install --no-save --package-lock=false',
    '  sireg@1.0.1 &&',
    'node ./node_modules/sireg/dist/cli.js',
    '  check --no-progress',
    '  --sitemap ' + escaped,
    '  --origin http://127.0.0.1:8000 --expect-status 200',
  ].join(' \\\n');
}

async function previewSitemap(sitemap, signal) {
  const first = await readSitemap(sitemap.href, signal);
  const allowedOrigin = new URL(first.url).origin;
  const seen = new Set([sitemap.href, first.url]);
  const pages = new Set();
  const pending = [];
  let files = 0;
  let partial = false;
  let attempts = 0;

  function addFile(file) {
    files++;
    for (const loc of file.locations) {
      let url;
      try {
        url = new URL(loc, file.url);
      } catch {
        partial = true;
        continue;
      }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
        partial = true;
        continue;
      }
      if (!file.index) {
        pages.add(url.href);
      } else if (url.origin !== allowedOrigin) {
        partial = true;
      } else {
        url.hash = '';
        if (!seen.has(url.href)) {
          seen.add(url.href);
          pending.push(url.href);
        }
      }
    }
  }

  addFile(first);
  while (pending.length && attempts < maxChildFiles && !signal.aborted) {
    const batch = pending.splice(0, maxChildFiles - attempts);
    attempts += batch.length;
    const results = await Promise.allSettled(batch.map((url) => readSitemap(url, signal)));
    for (const result of results) {
      if (result.status === 'fulfilled') addFile(result.value);
      else partial = true;
    }
  }

  return { pages: pages.size, files, partial: partial || pending.length > 0 };
}

async function readSitemap(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  } catch {
    throw new Error('The browser could not read the sitemap. The site may restrict cross-origin access (CORS).');
  }
  if (!response.ok) throw new Error('The sitemap server returned HTTP ' + response.status + '.');
  const xml = new DOMParser().parseFromString(await readXml(response), 'application/xml');
  const root = xml.documentElement;
  const index = root.localName === 'sitemapindex';
  if ((!index && root.localName !== 'urlset') || xml.querySelector('parsererror')) {
    throw new Error('Expected XML with a urlset or sitemapindex. For a custom path, enter the full sitemap URL.');
  }

  const entryName = index ? 'sitemap' : 'url';
  const locations = [];
  for (const entry of root.children) {
    if (entry.localName !== entryName || entry.namespaceURI !== root.namespaceURI) continue;
    const loc = Array.from(entry.children).find((child) =>
      child.localName === 'loc' && child.namespaceURI === root.namespaceURI);
    if (loc?.textContent.trim()) locations.push(loc.textContent.trim());
  }
  return { index, locations, url: response.url };
}

async function readXml(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let xml = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return xml + decoder.decode();
      bytes += value.byteLength;
      if (bytes > maxFileBytes) {
        await reader.cancel();
        throw new Error('This sitemap exceeds the 5 MiB limit for browser previews.');
      }
      xml += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
