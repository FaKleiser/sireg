import {TestSuiteConfig} from 'test-suite-config.ts';
import {RegressionResultSet} from '../regression/result/regression-result-set';

export interface ReporterStrategy {

    setOptions(options: any): this;

    report(testCase: TestSuiteConfig, result: RegressionResultSet): Promise<void>;
}