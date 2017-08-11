import winston = require('winston');
import {RegressionResult} from './regression-result';

export class RegressionResultSet {

    private _violations: Map<string, RegressionResult> = new Map();
    private _passed: Map<string, RegressionResult> = new Map();
    private _errors: Map<string, RegressionResult> = new Map();

    public addResults(results: RegressionResult[]): this {
        results.forEach(this.addResult, this);
        return this;
    }

    public addResult(result: RegressionResult): this {
        if (result.hasError) {
            this._errors.set(result.affectedUrl.url, result);
        } else {
            if (200 == result.statusCode) {
                this._passed.set(result.affectedUrl.url, result);
            } else {
                this._violations.set(result.affectedUrl.url, result);
            }
        }
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

    public print(): void {
        this._violations.forEach((result: RegressionResult) => {
            winston.info(`[${result.statusCode}] ${result.affectedUrl.url}`);
        });
        this._errors.forEach((result: RegressionResult) => {
            winston.error(`[${result.errorCode}] ${result.affectedUrl.url}: ${result.errorMessage}`);
        });
    }
}