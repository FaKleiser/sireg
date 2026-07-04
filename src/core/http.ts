import { performance } from 'node:perf_hooks';
import type { CheckConfig, CheckResult, RedirectExpectation, RedirectHop } from '../types.js';
import { isRedirectStatus, normalizeStatusExpectation, statusMatches } from './status.js';

export async function checkUrl(
  sourceUrl: string,
  targetUrl: string,
  checks: Required<CheckConfig>,
): Promise<CheckResult> {
  const startedAt = performance.now();

  try {
    const response = await fetchWithRedirects(targetUrl, checks);
    const expectedStatus = normalizeStatusExpectation(checks.expectedStatus);
    const passed = statusMatches(response.finalStatus, checks.expectedStatus);

    return {
      type: 'url',
      sourceUrl,
      targetUrl,
      expectedStatus,
      finalUrl: response.finalUrl,
      finalStatus: response.finalStatus,
      redirectChain: response.redirectChain,
      durationMs: Math.round(performance.now() - startedAt),
      passed,
      failureReason: passed ? undefined : `Expected final status ${expectedStatus}, received ${response.finalStatus}.`,
    };
  } catch (error) {
    return failedResult('url', sourceUrl, targetUrl, normalizeStatusExpectation(checks.expectedStatus), startedAt, error);
  }
}

export async function checkRedirect(
  expectation: RedirectExpectation,
  checks: Required<CheckConfig>,
): Promise<CheckResult> {
  const startedAt = performance.now();
  const maxRedirects = expectation.maxRedirects ?? checks.maxRedirects;

  try {
    const response = await fetchWithRedirects(expectation.from, { ...checks, maxRedirects });
    const expectedStatus = normalizeStatusExpectation(expectation.expectedStatus ?? '30x');
    const finalStatusExpectation = normalizeStatusExpectation(expectation.finalStatus ?? '2xx');
    const firstHop = response.redirectChain[0];
    const finalUrl = response.finalUrl || expectation.from;
    const firstStatusOk = statusMatches(firstHop?.status, expectation.expectedStatus ?? '30x');
    const finalStatusOk = statusMatches(response.finalStatus, expectation.finalStatus ?? '2xx');
    const targetOk = redirectTargetMatches(finalUrl, expectation);
    const passed = Boolean(firstHop) && firstStatusOk && finalStatusOk && targetOk;

    return {
      type: 'redirect',
      sourceUrl: expectation.from,
      targetUrl: expectation.from,
      expectedStatus: `${expectedStatus} -> ${finalStatusExpectation}`,
      finalUrl,
      finalStatus: response.finalStatus,
      redirectChain: response.redirectChain,
      durationMs: Math.round(performance.now() - startedAt),
      passed,
      failureReason: passed
        ? undefined
        : describeRedirectFailure({ firstHop, expectation, finalUrl, finalStatus: response.finalStatus }),
    };
  } catch (error) {
    return failedResult('redirect', expectation.from, expectation.from, '30x -> 2xx', startedAt, error);
  }
}

async function fetchWithRedirects(
  url: string,
  checks: Required<CheckConfig>,
): Promise<{ finalUrl: string; finalStatus: number; redirectChain: RedirectHop[] }> {
  let currentUrl = url;
  const redirectChain: RedirectHop[] = [];

  for (let redirects = 0; redirects <= checks.maxRedirects; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), checks.timeout);

    try {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': checks.userAgent,
        },
      });
      await response.body?.cancel();

      if (!isRedirectStatus(response.status)) {
        return {
          finalUrl: currentUrl,
          finalStatus: response.status,
          redirectChain,
        };
      }

      const location = response.headers.get('location') || undefined;
      redirectChain.push({
        url: currentUrl,
        status: response.status,
        location,
      });

      if (!location) {
        return {
          finalUrl: currentUrl,
          finalStatus: response.status,
          redirectChain,
        };
      }

      currentUrl = new URL(location, currentUrl).href;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Exceeded maxRedirects=${checks.maxRedirects} for ${url}`);
}

function redirectTargetMatches(finalUrl: string, expectation: RedirectExpectation): boolean {
  if (expectation.to && finalUrl !== expectation.to) {
    return false;
  }

  if (expectation.toPattern && !new RegExp(expectation.toPattern).test(finalUrl)) {
    return false;
  }

  return true;
}

function describeRedirectFailure(input: {
  firstHop?: RedirectHop;
  expectation: RedirectExpectation;
  finalUrl?: string;
  finalStatus?: number;
}): string {
  if (!input.firstHop) {
    return 'Expected the retired URL to redirect, but it did not redirect.';
  }

  if (!statusMatches(input.firstHop.status, input.expectation.expectedStatus ?? '30x')) {
    return `Expected first response ${normalizeStatusExpectation(input.expectation.expectedStatus ?? '30x')}, received ${input.firstHop.status}.`;
  }

  if (!redirectTargetMatches(input.finalUrl || '', input.expectation)) {
    return `Expected redirect target ${input.expectation.to || input.expectation.toPattern}, received ${input.finalUrl}.`;
  }

  return `Expected final status ${normalizeStatusExpectation(input.expectation.finalStatus ?? '2xx')}, received ${input.finalStatus}.`;
}

function failedResult(
  type: CheckResult['type'],
  sourceUrl: string,
  targetUrl: string,
  expectedStatus: string,
  startedAt: number,
  error: unknown,
): CheckResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    type,
    sourceUrl,
    targetUrl,
    expectedStatus,
    redirectChain: [],
    durationMs: Math.round(performance.now() - startedAt),
    passed: false,
    error: message,
    failureReason: message,
  };
}
