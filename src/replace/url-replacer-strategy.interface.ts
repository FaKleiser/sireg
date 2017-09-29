import {TestCase} from '../regression/test-case';

/**
 * Interface used to modify site urls to change URL targets during the regression testing.
 */
export interface UrlReplacerStrategy {

    setOptions(options: any): this;

    replace(url: TestCase): TestCase;
}