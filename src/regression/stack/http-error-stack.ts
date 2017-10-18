import {AbstractHttpStack} from './abstract-http-stack';
import {HttpStackBuilder} from './http-stack-builder';

export class HttpErrorStack extends AbstractHttpStack {

    private _error: any;

    constructor(builder: HttpStackBuilder) {
        super(builder);
        this._error = builder.error;
    }

    get error(): any {
        return this._error;
    }
}