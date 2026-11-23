const maxChildFiles = 6;
const maxFileBytes = 5 * 1024 * 1024;
const previewTimeoutMs = 8000;
const number = new Intl.NumberFormat();
const controls = document.querySelector('.builder-controls');
const form = controls.querySelector('.sitemap-form');
const source = form.elements.source;
const submit = form.querySelector('button');
const status = form.querySelector('.sitemap-status');
const samples = controls.querySelector('.sample-options');
const command = document.querySelector('#sitemap-command');
const commandError = document.querySelector('.command-error');
const commandTools = document.querySelector('.terminal-tools');
let preview;

controls.hidden = false;
controls.addEventListener('input', updateCommand);
source.addEventListener('input', () => {
  source.setCustomValidity('');
  preview?.abort();
  preview = undefined;
  submit.disabled = false;
  status.textContent = '';
});
updateCommand();

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

  if (sitemap.protocol === 'http:' && location.protocol === 'https:') {
    status.textContent = 'This HTTPS page cannot preview an HTTP sitemap. You can still run sireg from your terminal.';
    return;
  }

  submit.disabled = true;
  status.textContent = 'Reading sitemap…';
  const controller = new AbortController();
  preview = controller;
  const timer = setTimeout(() => controller.abort(), previewTimeoutMs);
  try {
    const { pages, files, partial } = await previewSitemap(sitemap, controller.signal);
    if (preview !== controller) return;
    const stats = number.format(pages) + (pages === 1 ? ' page URL' : ' page URLs') +
      ' in ' + number.format(files) + (files === 1 ? ' sitemap file' : ' sitemap files');
    status.textContent = partial
      ? 'Partial preview: ' + stats + ' read. The CLI attempts to load the full sitemap.'
      : 'Found ' + stats + '.';
  } catch (error) {
    if (preview !== controller) return;
    const reason = controller.signal.aborted ? 'The preview timed out.' : error.message;
    status.textContent = reason + ' You can still run sireg from your terminal.';
  } finally {
    clearTimeout(timer);
    if (preview === controller) {
      preview = undefined;
      submit.disabled = false;
    }
  }
});

function webUrl(value, protocol) {
  const input = value.trim();
  const url = new URL(input.includes('://') ? input : protocol + '://' + input);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Expected an HTTP(S) URL without credentials.');
  }
  return url;
}

function sitemapUrl(value) {
  const url = webUrl(value, 'https');
  if (url.pathname === '/') url.pathname = '/sitemap.xml';
  url.hash = '';
  return url;
}

function updateCommand() {
  const strategy = controls.querySelector('[name="strategy"]:checked').value;
  samples.hidden = strategy === 'all';
  for (const field of samples.querySelectorAll('[data-strategy]')) {
    field.hidden = field.dataset.strategy !== strategy;
  }

  const invalid = controls.querySelector('[aria-invalid="true"]');
  invalid?.removeAttribute('aria-invalid');
  invalid?.removeAttribute('aria-errormessage');

  let error = '';
  try {
    const next = localCommand(strategy);
    if (command.textContent !== next) {
      command.textContent = next;
      command.dispatchEvent(new Event('commandchange'));
    }
  } catch (problem) {
    error = problem.message;
    problem.cause?.setAttribute('aria-invalid', 'true');
    problem.cause?.setAttribute('aria-errormessage', commandError.id);
  }
  command.parentElement.hidden = Boolean(error);
  commandTools.hidden = Boolean(error);
  commandError.hidden = !error;
  commandError.textContent = error;
}

function localCommand(strategy) {
  const originField = controls.querySelector('[name="origin"]');
  let sitemap;
  let target;
  try {
    sitemap = sitemapUrl(source.value.trim() || source.placeholder);
  } catch {
    throw new Error('Enter a valid domain or sitemap URL.', { cause: source });
  }
  try {
    target = webUrl(originField.value, 'http');
    if (target.href !== target.origin + '/') throw new Error('Expected an origin.');
  } catch {
    throw new Error('Enter a target origin such as http://127.0.0.1:8000, without a path or query.', { cause: originField });
  }

  const expectedStatus = controls.querySelector('[name="expected-status"]').value;
  const lines = [
    'npx --yes sireg@1.1.0 check',
    '  --sitemap ' + shellQuote(sitemap.href),
    '  --origin ' + shellQuote(target.origin),
    '  --expect-status ' + expectedStatus,
  ];

  if (strategy === 'random') {
    const limitField = controls.querySelector('[name="limit"]');
    const limit = limitField.valueAsNumber;
    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new Error('Enter a whole number of URLs, at least 1.', { cause: limitField });
    }
    lines.push('  --strategy random --limit ' + limit);
  } else if (strategy === 'percent') {
    const percentField = controls.querySelector('[name="percent"]');
    const percent = percentField.valueAsNumber;
    if (!(percent > 0 && percent <= 100)) {
      throw new Error('Enter a percentage greater than 0 and up to 100.', { cause: percentField });
    }
    lines.push('  --strategy percent --percent ' + percent);
  }

  const seed = controls.querySelector('[name="seed"]').value.trim();
  if (strategy !== 'all' && seed) lines.push('  --seed ' + shellQuote(seed));
  return lines.join(' \\\n');
}

function shellQuote(value) {
  return "'" + value.replaceAll("'", "'\"'\"'") + "'";
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
