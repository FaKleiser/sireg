/**
 * Represents a test case that is executed and then validated.
 */
import {Assertion} from './assertion/assertion';
import {HttpResponseStack} from './http-response-stack';

export class TestCase {

    private _targetUrl: string;
    private _assertions: Assertion[];

    private constructor(url: string) {
        this.target(url);
    }

    public static target(url: string): TestCase {
        return new TestCase(url);
    }

    public target(url: string): this {
        this._targetUrl = url;
        return this;
    }

    get targetUrl(): string {
        return this._targetUrl;
    }

    // // assertions // //

    public assert(assertion: Assertion): this {
        this._assertions.push(assertion);
        return this;
    }

    public assertOK(): this {
        // fixme: implement
        return this;
    }

    public assertRedirectStatusCode(statusCode: number): this {
        // fixme: implement
        return this;
    }

    public assertRedirectTarget(url: string): this {
        // fixme: implement
        return this;
    }

    get assertions(): Assertion[] {
        return this._assertions;
    }
}