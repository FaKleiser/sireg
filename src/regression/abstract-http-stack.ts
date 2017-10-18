import {TestCase} from './suite/test-case';
import {HttpResponseStackBuilder} from './http-response-stack-builder';
import http = require('http');

export abstract class AbstractHttpStack {
    private _testCase: TestCase;
    private _redirectsStack: http.IncomingMessage[];

    constructor(builder: HttpResponseStackBuilder) {
        this._testCase = builder.testCase;
        this._redirectsStack = builder.redirectsStack || [];
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
     * The first incoming HTTP message received by sireg for the requested URL.
     */
    get firstResponse(): http.IncomingMessage {
        return this._redirectsStack[0] || undefined;
    }

    /**
     * The last incoming HTTP message received by sireg for the requested URL.
     */
    get lastResponse(): http.IncomingMessage {
        return this._redirectsStack[this._redirectsStack.length - 1];
    }
}