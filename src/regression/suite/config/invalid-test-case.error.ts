import {TestSuiteConfig} from './test-suite-config';

export class InvalidTestCaseError extends Error {

    constructor(public testCase: TestSuiteConfig, message: string) {
        super(`Invalid test case '${testCase.testCase}': ${message}`);
    }


}