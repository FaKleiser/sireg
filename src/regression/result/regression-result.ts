import {HttpResponseStack} from '../http-response-stack';
import {AssertionResult} from '../assertion/assertion-result';
import {RegressionResultStatus} from './regression-result-status.enum';
import * as _ from 'lodash';
import {HttpErrorStack} from '../http-error-stack';
import {AbstractHttpStack} from '../abstract-http-stack';
import {TestCase} from '../test-case';

export class RegressionResult {

    private _status: RegressionResultStatus;
    private _stack: AbstractHttpStack;
    private assertionResults: AssertionResult[];

    private constructor(responseStack: AbstractHttpStack) {
        this._stack = responseStack;
    }

    static errorneous(stack: HttpErrorStack): RegressionResult {
        const result: RegressionResult = new RegressionResult(stack);
        result._status = RegressionResultStatus.ERROR;
        return result;
    }

    static fromAssertionResults(stack: HttpResponseStack, assertionResults: AssertionResult[]): RegressionResult {
        const result: RegressionResult = new RegressionResult(stack);
        result.assertionResults = assertionResults;
        const allAssertionsPassed: boolean = assertionResults.reduce((passed, cur) => passed && cur.hasPassed, true);
        if (allAssertionsPassed) {
            result._status = RegressionResultStatus.SUCCESS;
        } else {
            result._status = RegressionResultStatus.VIOLATION;
        }
        return result;
    }

    get testCase(): TestCase {
        return this._stack.testCase;
    }

    get violationMessages(): string[] {
        return _(this.assertionResults || [])
            .map((ar: AssertionResult) => ar.message)
            .filter((e: string) => !!e)
            .value();
    }

    get errorMessages(): string[] {
        const error: any = this.errorStack.error;
        return _(_.isArray(error) ? error : [error])
        // filter empty messages
            .filter((msg: any) => !!msg)
            // turn each element to a string
            .map((err: any) => JSON.stringify(err))
            .value();
    }

    get errorStack(): HttpErrorStack {
        if (this._status === RegressionResultStatus.ERROR) {
            return this._stack as HttpErrorStack;
        }
        return undefined;
    }

    get responseStack(): HttpResponseStack {
        if (this._status === RegressionResultStatus.SUCCESS || this._status === RegressionResultStatus.VIOLATION) {
            return this._stack as HttpResponseStack;
        }
        return undefined;
    }

    get status(): RegressionResultStatus {
        return this._status;
    }
}