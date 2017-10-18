import {TestCase} from '../suite/test-case';
import {RequestResponse} from 'request';
import {HttpResponseStack} from './http-response-stack';
import {isEmpty} from 'lodash';
import {HttpErrorStack} from './http-error-stack';
import {AbstractHttpStack} from './abstract-http-stack';
import http = require('http');

export class HttpStackBuilder {

    private _testCase: TestCase;
    private _redirectsStack: http.IncomingMessage[] = [];
    private _response: RequestResponse;
    private _error: any;

    constructor(testCase: TestCase) {
        this._testCase = testCase;
    }

    public pushRedirectResponse(response: http.IncomingMessage): this {
        this._redirectsStack.push(response);
        return this;
    }

    public withResponse(response: RequestResponse): this {
        this._response = response;
        return this;
    }

    public withError(error: any): this {
        this._error = error;
        return this;
    }

    public build(): AbstractHttpStack {
        if (isEmpty(this._error) && isEmpty(this._response)) {
            throw new Error('Cannot build HttpResponseStack as neither an error nor a response is set!');
        }
        if (isEmpty(this._error)) {
            return new HttpResponseStack(this);
        } else {
            return new HttpErrorStack(this);
        }
    }

    get testCase(): TestCase {
        return this._testCase;
    }

    get response(): RequestResponse {
        return this._response;
    }

    get redirectsStack(): http.IncomingMessage[] {
        return this._redirectsStack;
    }

    get error(): any {
        return this._error;
    }
}