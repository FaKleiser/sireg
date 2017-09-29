import {AbstractHttpStack} from './abstract-http-stack';
import {HttpResponseStackBuilder} from './http-response-stack-builder';

export class HttpErrorStack extends AbstractHttpStack {

    private _error: any;

    constructor(builder: HttpResponseStackBuilder) {
        super(builder);
        this._error = builder.error;
    }

    get error(): any {
        return this._error;
    }
}