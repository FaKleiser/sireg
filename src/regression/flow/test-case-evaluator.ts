import {HttpResponseStack} from '../http-response-stack';
import {RegressionResult} from '../result/regression-result';
import {AssertionResult} from '../assertion/assertion-result';
import {HttpErrorStack} from '../http-error-stack';

export class TestCaseEvaluator {

    /**
     * Executes the assertions of the test case against the actual received HTTP stack and produces a {@link RegressionResult}.
     */
    public evaluate(stack: HttpResponseStack): RegressionResult {
        // first check if we had HTTP errors on the way
        if (stack instanceof HttpErrorStack) {
            return RegressionResult.errorneous(stack);
        }

        // now assert
        const assertionResults: AssertionResult[] = stack.testCase.assertions.map((assert) => assert(stack));
        return RegressionResult.fromAssertionResults(stack, assertionResults);
    }
}