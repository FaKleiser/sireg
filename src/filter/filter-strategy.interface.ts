import {TestCase} from '../regression/test-case';

/**
 * Depending on what level of regression testing is aimed at, a strategy may filter certain entries of the sitemap.
 */
export interface FilterStrategy {
    filter(testCases: TestCase[]): TestCase[];
}