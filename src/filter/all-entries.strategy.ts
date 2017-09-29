import {FilterStrategy} from './filter-strategy.interface';
import {TestCase} from '../regression/test-case';

/**
 * A strategy to regression test all test cases loaded by the loaders.
 */
export class AllEntriesStrategy implements FilterStrategy {

    filter(testCases: TestCase[]): TestCase[] {
        return testCases;
    }

}