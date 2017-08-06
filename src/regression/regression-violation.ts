export class RegressionViolation {
    private affectedUrl: string;
    private statusCode: number;

    constructor(affectedUrl: string, statusCode: number) {
        this.affectedUrl = affectedUrl;
        this.statusCode = statusCode;
    }

    public toString(): string {
        return `[${this.statusCode}] ${this.affectedUrl}`;
    }
}