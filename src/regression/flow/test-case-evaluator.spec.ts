import Mock = jest.Mock;
import {TestCaseEvaluator} from './test-case-evaluator';
import {AbstractHttpStack} from '../stack/abstract-http-stack';
import {TestCase} from '../suite/test-case';
import {RegressionResult} from '../result/regression-result';
import {HttpStackBuilder} from '../stack/http-stack-builder';
import {RegressionResultStatus} from '../result/regression-result-status.enum';
import {RequestResponse} from 'request';
import {AssertionResult} from '../assertion/assertion-result';
import {Assertion} from '../assertion/assertion';

describe('TestCaseEvaluator', () => {

    let sut: TestCaseEvaluator;
    let stack: AbstractHttpStack;
    let testCase: TestCase;
    let result: RegressionResult;
    let stackBuilder: HttpStackBuilder;
    let RequestResponseMock: Mock<RequestResponse>;
    let MockAssertion: Mock<Assertion>;

    beforeEach(() => {
        sut = new TestCaseEvaluator;
        testCase = TestCase.target('http://localhost/example');
        stackBuilder = new HttpStackBuilder(testCase);
        RequestResponseMock = jest.fn<RequestResponse>(() => ({
            statusCode: jest.fn()
        }));
        MockAssertion = jest.fn<Assertion>();
    });

    test('Evaluator returns ERROR result if HTTP errors are in the stack', () => {
        stack = stackBuilder.withError({code: 404}).build();
        result = sut.evaluate(stack);
        expect(result).toBeInstanceOf(RegressionResult);
        expect(result.status).toBe(RegressionResultStatus.ERROR);
    });

    test('Evaluator returns SUCCESS result if no assertions are defined in test case', () => {
        stack = stackBuilder.withResponse(new RequestResponseMock).build();
        result = sut.evaluate(stack);
        expect(result).toBeInstanceOf(RegressionResult);
        expect(result.status).toBe(RegressionResultStatus.SUCCESS);
    });

    test('Evaluator returns SUCCESS result if all assertions do not fail', () => {
        stack = stackBuilder.withResponse(new RequestResponseMock).build();
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));

        result = sut.evaluate(stack);
        expect(MockAssertion).toHaveBeenCalledTimes(4);

        expect(result).toBeInstanceOf(RegressionResult);
        expect(result.status).toBe(RegressionResultStatus.SUCCESS);
    });

    test('Evaluator returns VIOLATION result if at least one assertion fails', () => {
        stack = stackBuilder.withResponse(new RequestResponseMock).build();
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.error('Assertion failed')));
        testCase.assert(MockAssertion.mockReturnValueOnce(AssertionResult.hasPassed()));

        result = sut.evaluate(stack);
        expect(MockAssertion).toHaveBeenCalledTimes(3);

        expect(result).toBeInstanceOf(RegressionResult);
        expect(result.status).toBe(RegressionResultStatus.VIOLATION);
    });
});