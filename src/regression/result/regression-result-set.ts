import winston = require('winston');
import {RegressionResult} from './regression-result';

export class RegressionResultSet {

    private _violations: { [url: string]: number } = {};
    private _passed: { [url: string]: number } = {};

    public addResults(results: RegressionResult[]): this {
        results.forEach(this.addResult, this);
        return this;
    }

    public addResult(result: RegressionResult): this {
        if (200 == result.statusCode) {
            this._passed[result.affectedUrl] = result.statusCode;
        } else {
            this._violations[result.affectedUrl] = result.statusCode;
        }
        return this;
    }

    public get hasViolations(): boolean {
        return Object.keys(this._violations).length > 0;
    }

    get violations(): { [p: string]: number } {
        return this._violations;
    }

    get passed(): { [p: string]: number } {
        return this._passed;
    }

    public print(): void {
        for (const url in this._violations) {
            if (!this._violations.hasOwnProperty(url)) continue;
            winston.info(`[${this._violations[url]}] ${url}`);
        }
    }
}