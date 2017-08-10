import {TestCaseConfig} from './test-case-config';

export class InvalidTestCase extends Error {

    constructor(public testCase: TestCaseConfig, message: string) {
        super(`Invalid test case '${testCase.testCase}': ${message}`);
    }


}