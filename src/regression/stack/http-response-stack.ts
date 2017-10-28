import {HttpStackBuilder} from './http-stack-builder';
import {RequestResponse} from 'request';
import {AbstractHttpStack} from './abstract-http-stack';
import http = require('http');

export class HttpResponseStack extends AbstractHttpStack {

    private _response: RequestResponse;

    constructor(builder: HttpStackBuilder) {
        super(builder);
        this._response = builder.response;
    }


    get firstResponse(): http.IncomingMessage {
        // if no redirects occured, the stack is empty and the response is returned instead
        return super.firstResponse || this._response;
    }

    get lastResponse(): http.IncomingMessage {
        return this._response;
    }
}