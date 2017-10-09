import {HttpResponseStack} from '../http-response-stack';
import {AssertionResult} from '../assertion/assertion-result';
import {RegressionResultStatus} from './regression-result-status.enum';

export class RegressionResult {

    private _status: RegressionResultStatus;
    private responseStack: HttpResponseStack;

    private constructor(responseStack: HttpResponseStack) {
        this.responseStack = responseStack;
    }

    static errorneous(stack: HttpResponseStack): RegressionResult {
        const result: RegressionResult = new RegressionResult(stack);
        result._status = RegressionResultStatus.ERROR;
        return result;
    }

    static fromAssertionResults(stack: HttpResponseStack, assertionResults: AssertionResult[]): RegressionResult {
        const result: RegressionResult = new RegressionResult(stack);
        const allAssertionsPassed: boolean = assertionResults.reduce((passed, cur) => passed && cur.hasPassed, true);
        if (allAssertionsPassed) {
            result._status = RegressionResultStatus.SUCCESS;
        } else {
            result._status = RegressionResultStatus.VIOLATION;
        }
        return result;
    }


    get status(): RegressionResultStatus {
        return this._status;
    }
}