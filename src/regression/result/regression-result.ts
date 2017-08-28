import {SiteUrl} from '../../model/site-url.model';
import {RequestResponse} from 'request';
import {get} from 'lodash';
import http = require('http');

export class RegressionResult {

    private _affectedUrl: SiteUrl;
    private _httpResponse: RequestResponse;
    private _error: any;
    private _redirectsStack: http.IncomingMessage[];
    private _customErrorMessage: string;

    private constructor(affectedUrl: SiteUrl, redirectsStack: http.IncomingMessage[] = []) {
        this._affectedUrl = affectedUrl;
        this._redirectsStack = redirectsStack;
    }

    public static httpResponse(affectedUrl: SiteUrl, response: RequestResponse, redirectsStack: http.IncomingMessage[] = []): RegressionResult {
        const res: RegressionResult = new RegressionResult(affectedUrl, redirectsStack);
        res._httpResponse = response;
        return res;
    }

    public static httpError(affectedUrl: SiteUrl, error: any, redirectsStack: http.IncomingMessage[] = []): RegressionResult {
        const res: RegressionResult = new RegressionResult(affectedUrl, redirectsStack);
        res._error = error;
        return res;
    }

    public toString(): string {
        return `[${this.statusCode}] ${this._affectedUrl.url}`;
    }

    get affectedUrl(): SiteUrl {
        return this._affectedUrl;
    }

    /**
     * Returns the URL that was actually requested after potentially following all redirects.
     */
    get actualUrl(): string {
        const url: string = this._httpResponse.url || (this._httpResponse.request as any)['href'];
        return url;
    }

    public set customErrorMessage(value: string) {
        this._customErrorMessage = value;
    }

    get hasError(): boolean {
        return undefined != this._error || undefined != this._customErrorMessage;
    }

    get errorCode(): string {
        return get(this._error, 'code') || 'UNKNOWN';
    }

    get errorMessage(): string {
        return this._customErrorMessage || JSON.stringify(this._error);
    }

    get error(): any {
        return this._error;
    }

    get statusCode(): number {
        return this._httpResponse.statusCode;
    }

    get hasFollowedRedirects(): boolean {
        return this._redirectsStack.length > 0;
    }

    public get redirectsStack(): http.IncomingMessage[] {
        return this._redirectsStack;
    }
}