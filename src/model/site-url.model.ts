/**
 * Represents a site URL that is regression tested.
 *
 * @deprecated - to be replaced by {@link TestCase}
 */
export class SiteUrl {

    constructor(private _url: string, private _expectedUrl: string = undefined, private _expectedStatusCode: number = undefined) {
    }

    get url(): string {
        return this._url;
    }

    public get expectedUrl(): string {
        return this._expectedUrl;
    }

    public get hasExpectedUrl(): boolean {
        return '' != this._expectedUrl;
    }

    public get expectedStatusCode(): number {
        return this._expectedStatusCode;
    }
}