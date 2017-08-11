import {TestCaseConfig} from '../regression/config/test-case-config';
import {RegressionResultSet} from '../regression/result/regression-result-set';

export interface ReporterStrategy {

    setOptions(options: any): this;

    report(testCase: TestCaseConfig, result: RegressionResultSet): Promise<void>;
}