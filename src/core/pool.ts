export async function mapLimit<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
  onComplete?: (result: R, value: T, index: number) => void,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const value = values[currentIndex];
      const result = await mapper(value, currentIndex);
      results[currentIndex] = result;
      onComplete?.(result, value, currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, values.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
