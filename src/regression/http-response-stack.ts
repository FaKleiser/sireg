import {HttpResponseStackBuilder} from './http-response-stack-builder';
import {RequestResponse} from 'request';
import {AbstractHttpStack} from './abstract-http-stack';
import http = require('http');

export class HttpResponseStack extends AbstractHttpStack {

    private _response: RequestResponse;

    constructor(builder: HttpResponseStackBuilder) {
        super(builder);
        this._response = builder.response;
    }

    get lastResponse(): http.IncomingMessage {
        return this._response;
    }
}