import {UrlReplacerStrategy} from './url-replacer-strategy.interface';
import {injectable} from 'inversify';
import {TestCase} from '../regression/suite/test-case';

export interface StaticReplacerStrategyOptions {
    'replace': string;
    'with': string;
}

@injectable()
export class StaticReplacerStrategy implements UrlReplacerStrategy {

    private options: StaticReplacerStrategyOptions;

    setOptions(options: StaticReplacerStrategyOptions): this {
        this.options = options;
        return this;
    }

    public replace(testCase: TestCase): TestCase {
        if (!this.options) {
            throw new Error('No options provided for static replacer!');
        }
        return testCase.target(testCase.targetUrl.replace(this.options.replace, this.options.with));
    }
}