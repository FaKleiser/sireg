/**
 * Represents a test case that is executed and then validated.
 */
import {Assertion} from './assertion/assertion';
import {Assertions} from './assertion/assertions';

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
        this.assert(Assertions.assertOK());
        return this;
    }

    public assertRedirectStatusCode(statusCode: number): this {
        this.assert(Assertions.assertRedirectStatusCode(statusCode));
        return this;
    }

    public assertRedirectTarget(targetUrl: string): this {
        this.assert(Assertions.assertRedirectTarget(targetUrl));
        return this;
    }

    get assertions(): Assertion[] {
        return this._assertions;
    }
}