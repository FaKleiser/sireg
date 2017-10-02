export class AssertionResult {

    private constructor(private _passed: boolean, private _message?: string) {
    }

    public static error(msg: string): AssertionResult {
        return new AssertionResult(false, msg);
    }

    public static hasPassed(): AssertionResult {
        return new AssertionResult(true);
    }

    get hasPassed(): boolean {
        return this._passed;
    }

    get hasError(): boolean {
        return !this.hasPassed;
    }

    get hasMessage(): boolean {
        return !!this.message;
    }

    get message(): string {
        return this._message;
    }
}