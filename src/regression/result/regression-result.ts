import {SiteUrl} from '../../model/site-url.model';
import {RequestResponse} from 'request';
import {get} from 'lodash';

export class RegressionResult {

    private _affectedUrl: SiteUrl;
    private _httpResponse: RequestResponse;
    private _error: any;

    private constructor(affectedUrl: SiteUrl) {
        this._affectedUrl = affectedUrl;
    }

    public static httpResponse(affectedUrl: SiteUrl, response: RequestResponse): RegressionResult {
        const res: RegressionResult = new RegressionResult(affectedUrl);
        res._httpResponse = response;
        return res;
    }

    public static httpError(affectedUrl: SiteUrl, error: any): RegressionResult {
        const res: RegressionResult = new RegressionResult(affectedUrl);
        res._error = error;
        return res;
    }

    public toString(): string {
        return `[${this.statusCode}] ${this._affectedUrl.url}`;
    }

    get affectedUrl(): SiteUrl {
        return this._affectedUrl;
    }

    get hasError(): boolean {
        return undefined != this._error;
    }

    get errorCode(): string {
        return get(this._error, 'code') || 'UNKNOWN';
    }

    get errorMessage(): string {
        return JSON.stringify(this._error);
    }

    get error(): any {
        return this._error;
    }

    get statusCode(): number {
        return this._httpResponse.statusCode;
    }
}