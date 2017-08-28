import {RegressionResult} from './regression-result';
import {SiteUrl} from '../../model/site-url.model';

export class RegressionResultSet {

    private static DEFAULT_SUCCESS_STATUS_CODE: number = 200;

    private _violations: Map<string, RegressionResult> = new Map();
    private _passed: Map<string, RegressionResult> = new Map();
    private _errors: Map<string, RegressionResult> = new Map();

    public addResults(results: RegressionResult[]): this {
        results.forEach(this.addResult, this);
        return this;
    }

    public addResult(result: RegressionResult): this {
        const expected: SiteUrl = result.affectedUrl;

        // HTTP errors lead to failures
        if (result.hasError) {
            this._errors.set(expected.url, result);
            return this;
        }

        // check expected redirect location
        if (expected.hasExpectedUrl) {
            if (result.actualUrl != expected.expectedUrl) {
                result.customErrorMessage = `Expected redirect target to be ${expected.expectedUrl}, but was redirected to ${result.actualUrl}`;
                this._violations.set(expected.url, result);
                return this;
            }
        }

        // check expected status code
        if ((expected.expectedStatusCode || RegressionResultSet.DEFAULT_SUCCESS_STATUS_CODE) != result.statusCode) {
            this._violations.set(expected.url, result);
            return this;
        }

        // no violations so far - looks good
        this._passed.set(expected.url, result);
        return this;
    }

    get hasViolations(): boolean {
        return this._violations.size > 0;
    }

    get violations(): RegressionResult[] {
        return Array.from(this._violations.values());
    }

    get passed(): RegressionResult[] {
        return Array.from(this._passed.values());
    }

    get hasErrors(): boolean {
        return this._errors.size > 0;
    }

    get errors(): RegressionResult[] {
        return Array.from(this._errors.values());
    }
}