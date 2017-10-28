import {RegressionResult} from './regression-result';
import {RegressionResultStatus} from './regression-result-status.enum';

export class RegressionResultSet {

    private static DEFAULT_SUCCESS_STATUS_CODE: number = 200;

    private _violations: RegressionResult[] = [];
    private _passed: RegressionResult[] = [];
    private _errors: RegressionResult[] = [];

    public addResults(results: RegressionResult[]): this {
        results.forEach(this.addResult, this);
        return this;
    }

    public addResult(result: RegressionResult): this {
        switch (result.status) {
            case RegressionResultStatus.VIOLATION:
                this._violations.push(result);
                return this;
            case RegressionResultStatus.SUCCESS:
                this._passed.push(result);
                return this;
            case RegressionResultStatus.ERROR:
                this._errors.push(result);
                return this;
            default:
                throw new Error(`Unknown RegressionResultStatus: ${result.status}`);
        }
    }

    get hasViolations(): boolean {
        return this._violations.length > 0;
    }

    get violations(): RegressionResult[] {
        return this._violations;
    }

    get passed(): RegressionResult[] {
        return this._passed;
    }

    get hasErrors(): boolean {
        return this._errors.length > 0;
    }

    get errors(): RegressionResult[] {
        return this._errors;
    }
}