import {Assertion} from './assertion';

export class AssertionResult {

    private message: string;
    private cause: Assertion;

    private constructor() {
    }

    public static error(causedBy: Assertion): AssertionResult {

    }

    public static ok(causedBy: Assertion): AssertionResult {

    }
}