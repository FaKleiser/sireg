import {RegressionResultSet} from '../regression/result/regression-result-set';
import {TestSuiteConfig} from '../regression/suite/config/test-suite-config';

export interface ReporterStrategy {

    setOptions(options: any): this;

    report(testCase: TestSuiteConfig, result: RegressionResultSet): Promise<void>;
}