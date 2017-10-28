import {HttpResponseStack} from '../stack/http-response-stack';
import {RegressionResult} from '../result/regression-result';
import {AssertionResult} from '../assertion/assertion-result';
import {HttpErrorStack} from '../stack/http-error-stack';
import {AbstractHttpStack} from '../stack/abstract-http-stack';

export class TestCaseEvaluator {

    /**
     * Executes the assertions of the test case against the actual received HTTP stack and produces a {@link RegressionResult}.
     */
    public evaluate(stack: AbstractHttpStack): RegressionResult {
        // first check if we had HTTP errors on the way
        if (stack instanceof HttpErrorStack) {
            return RegressionResult.errorneous(stack);
        }

        // now assert
        const responseStack: HttpResponseStack = stack as HttpResponseStack;
        const assertionResults: AssertionResult[] = stack.testCase.assertions.map((assert) => assert(responseStack));
        return RegressionResult.fromAssertionResults(responseStack, assertionResults);
    }
}