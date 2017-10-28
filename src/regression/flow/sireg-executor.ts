import {LoaderStrategy} from '../../load/loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import {RegressionResultSet} from '../result/regression-result-set';
import {RegressionResult} from '../result/regression-result';
import {ReporterStrategy} from '../../reporter/reporter-strategy.interface';
import {TestSuite} from '../suite/test-suite';
import {TestCase} from '../suite/test-case';
import {TestCaseProcessor} from './test-case-processor';
import {TestCaseEvaluator} from './test-case-evaluator';
import {HttpResponseStack} from '../stack/http-response-stack';
import winston = require('winston');

/**
 * The SiregExecutor defines the flow of turning a single TestSuite definition into a RegressionResultSet and is thus
 * the main point of entry to execute a sireg test suite.
 */
export class SiregExecutor {

    public regressionTest(suite: TestSuite): Observable<RegressionResultSet> {
        // 1. load
        let entries: Observable<TestCase[]> = Observable.from(suite.loaders)
        // load all
            .flatMap((loader: LoaderStrategy) => loader.load())
            // combine all found SiteUrls to a single array
            .reduce((acc: TestCase[], cur: TestCase[]) => [].concat(acc, cur), [])
            .do((all: TestCase[]) => winston.info(`Loaded ${all.length} test cases`));

        // 2. filter
        for (const filter of suite.filters) {
            entries = entries.map((all: TestCase[]) => filter.filter(all));
        }
        entries = entries.do((all: TestCase[]) => winston.info(`About to execute ${all.length} filtered test cases`));

        // 3. turn the test case array into a stream of individual test cases.
        let single: Observable<TestCase> = entries.flatMap(entries => entries);

        // 4. apply replacements
        for (const replacer of suite.replacers) {
            single = single.map((url: TestCase) => replacer.replace(url));
        }

        // 4. regression
        const testCaseProcessor: TestCaseProcessor = new TestCaseProcessor(suite);
        const testCaseEvaluator: TestCaseEvaluator = new TestCaseEvaluator();
        return single
        // request each url
            .flatMap((testCase: TestCase) => testCaseProcessor.process(testCase), suite.config.settings.concurrentRequests)
            // evaluate assertions
            .map((stack: HttpResponseStack) => testCaseEvaluator.evaluate(stack))
            // collect individual regression results
            .reduce<RegressionResult, RegressionResultSet>((set: RegressionResultSet, res: RegressionResult): RegressionResultSet => {
                return set.addResult(res);
            }, new RegressionResultSet())
            .do((res: RegressionResultSet) => {
                suite.reporters.forEach((reporter: ReporterStrategy) => reporter.report(suite.config, res));
            });
    }

}