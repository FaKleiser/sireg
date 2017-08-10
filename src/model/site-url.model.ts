/**
 * Represents a site URL that is regression tested.
 */
export class SiteUrl {

    constructor(private _url: string) {
    }

    get url(): string {
        return this._url;
    }
}