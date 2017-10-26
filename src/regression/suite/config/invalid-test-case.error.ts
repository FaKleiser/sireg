import {TestSuiteConfig} from './test-suite-config';
import {SiregError} from '../../../exception/sireg-error';

export class InvalidTestCaseError extends SiregError {

    constructor(public testCase: TestSuiteConfig, message: string) {
        super(`Invalid test case '${testCase.testSuite}': ${message}`);
    }


}