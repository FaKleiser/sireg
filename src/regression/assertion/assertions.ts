import {Assertion} from './assertion';
import {HttpResponseStack} from '../http-response-stack';
import {AssertionResult} from './assertion-result';

export class Assertions {

    /**
     * Asserts that the request eventually returned 200 (i.e. the last request of a redirect chain).
     */
    public static assertOK(): Assertion {
        return (stack: HttpResponseStack) => {
            const code: number = stack.lastResponse.statusCode;
            if (200 == code) {
                return AssertionResult.hasPassed();
            } else {
                return AssertionResult.error(`Expected response code of ${stack.lastResponse.url} to be 200, but was ${code}`);
            }
        };
    }

    /**
     * Asserts the status codes along the redirect chain.
     */
    public static assertRedirectStatusCode(statusCode: number): Assertion {
        return (stack: HttpResponseStack) => {
            for (const redirect of stack.redirectsStack) {
                if (statusCode != redirect.statusCode) {
                    return AssertionResult.error(`Expected response code of redirect ${redirect.url} to be ${statusCode}, but was ${redirect.statusCode}`);
                }
            }
            return AssertionResult.hasPassed();
        };
    }

    /**
     * Asserts that the chain ended at the expected URL, no matter how many redirects were necessary.
     */
    public static assertRedirectTarget(expectedUrl: string): Assertion {
        return (stack: HttpResponseStack) => {
            const actualUrl: string = stack.lastResponse.url;
            if (expectedUrl == actualUrl) {
                return AssertionResult.hasPassed();
            } else {
                return AssertionResult.error(`Expected redirect target to end at ${expectedUrl}, but got redirected to ${actualUrl}`);
            }
        };
    }

}