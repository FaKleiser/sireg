import {TestCase} from './test-case';
import {HttpResponseStackBuilder} from './http-response-stack-builder';
import http = require('http');

export abstract class AbstractHttpStack {
    private _testCase: TestCase;
    private _redirectsStack: http.IncomingMessage[];

    constructor(builder: HttpResponseStackBuilder) {
        this._testCase = builder.testCase;
        this._redirectsStack = [].concat(builder.redirectsStack);
    }

    get testCase(): TestCase {
        return this._testCase;
    }

    /**
     * If sireg followed redirects, the stack of followed redirects is accessible here.
     */
    get redirectsStack(): http.IncomingMessage[] {
        return this._redirectsStack;
    }

    /**
     * The last incoming HTTP message received by sireg for the requested URL.
     */
    get lastResponse(): http.IncomingMessage {
        return this._redirectsStack[this._redirectsStack.length - 1];
    }
}