export class RegressionResult {

    private _affectedUrl: string;
    private _statusCode: number;

    constructor(affectedUrl: string, statusCode: number) {
        this._affectedUrl = affectedUrl;
        this._statusCode = statusCode;
    }

    public toString(): string {
        return `[${this._statusCode}] ${this._affectedUrl}`;
    }


    get affectedUrl(): string {
        return this._affectedUrl;
    }

    get statusCode(): number {
        return this._statusCode;
    }
}