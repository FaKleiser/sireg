const controls = document.querySelector('.builder-controls');
const source = controls.querySelector('#sitemap-source');
const samples = controls.querySelector('.sample-options');
const command = document.querySelector('#sitemap-command');
const commandError = document.querySelector('.command-error');
const commandTools = document.querySelector('.terminal-tools');

controls.hidden = false;
controls.addEventListener('input', updateCommand);
updateCommand();

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
