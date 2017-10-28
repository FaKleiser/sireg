import {RegressionResult} from '../result/regression-result';
import {RegressionResultStatus} from '../result/regression-result-status.enum';
import {HttpErrorStack} from '../stack/http-error-stack';
import {HttpResponseStack} from '../stack/http-response-stack';
import {AssertionResult} from '../assertion/assertion-result';
import Mock = jest.Mock;

describe('RegressionResult', () => {

    let sut: RegressionResult;

    let errorStack: HttpErrorStack;
    let HttpErrorStackMock: Mock<HttpErrorStack>;

    let httpStack: HttpResponseStack;
    let HttpResponseStackMock: Mock<HttpResponseStack>;

    beforeEach(() => {
        HttpErrorStackMock = jest.fn<HttpErrorStack>();
        errorStack = new HttpErrorStackMock();

        HttpResponseStackMock = jest.fn<HttpResponseStack>();
        httpStack = new HttpResponseStackMock();
    });

    // == test RegressionResult.status and other getters are correctly set
    test('Can create ERROR RegressionResult with error stack', () => {
        sut = RegressionResult.errorneous(errorStack);
        expect(sut).toBeInstanceOf(RegressionResult);
        expect(sut.status).toBe(RegressionResultStatus.ERROR);
        expect(sut.errorStack).toBe(errorStack);
        expect(sut.responseStack).toBeUndefined();
    });
    test('Can create SUCCESS RegressionResult from passed assertions', () => {
        sut = RegressionResult.fromAssertionResults(httpStack, [
            AssertionResult.hasPassed(),
            AssertionResult.hasPassed()
        ]);
        expect(sut).toBeInstanceOf(RegressionResult);
        expect(sut.status).toBe(RegressionResultStatus.SUCCESS);
        expect(sut.errorStack).toBe(undefined);
        expect(sut.responseStack).toEqual(httpStack);
    });
    test('Can create VIOLATION RegressionResult from errorneous assertions', () => {
        sut = RegressionResult.fromAssertionResults(httpStack, [
            AssertionResult.error(''),
            AssertionResult.error('')
        ]);
        expect(sut).toBeInstanceOf(RegressionResult);
        expect(sut.status).toBe(RegressionResultStatus.VIOLATION);
        expect(sut.errorStack).toBe(undefined);
        expect(sut.responseStack).toEqual(httpStack);
    });
    test('Can create VIOLATION RegressionResult from partially errorneous assertions', () => {
        sut = RegressionResult.fromAssertionResults(httpStack, [
            AssertionResult.hasPassed(),
            AssertionResult.error(''),
            AssertionResult.hasPassed()
        ]);
        expect(sut.status).toBe(RegressionResultStatus.VIOLATION);
    });

    // == test error messages are properly retrieved from stack
    test('ERROR RegressionResult returns empty array with no error messages', () => {
        sut = RegressionResult.errorneous(errorStack);
        expect(sut.errorMessages).toEqual([]);
    });
    test('ERROR RegressionResult returns stringified stack error messages', () => {
        const errorMsg: any = {error: true, code: 404};
        HttpErrorStackMock.mockImplementation(() => ({error: errorMsg}));
        sut = RegressionResult.errorneous(new HttpErrorStackMock());
        expect(sut.errorMessages).toEqual([JSON.stringify(errorMsg)]);
    });
    test('ERROR RegressionResult preserves stack array of error messages', () => {
        const errorMsg: any[] = [
            {error: true, code: 404},
            {error: 'some teapot', code: 418}
        ];
        HttpErrorStackMock.mockImplementation(() => ({error: errorMsg}));
        sut = RegressionResult.errorneous(new HttpErrorStackMock());
        expect(sut.errorMessages).toEqual([
            JSON.stringify(errorMsg[0]),
            JSON.stringify(errorMsg[1])
        ]);
    });


    // == test violation messages
    test('Successful regression result has empty violation messages', () => {
        sut = RegressionResult.fromAssertionResults(httpStack, [
            AssertionResult.hasPassed(),
            AssertionResult.hasPassed()
        ]);
        expect(sut.status).toBe(RegressionResultStatus.SUCCESS);
        expect(sut.violationMessages).toEqual([]);
    });
    test('Non-empty violation messages are accessible', () => {
        sut = RegressionResult.fromAssertionResults(httpStack, [
            AssertionResult.hasPassed(),
            AssertionResult.error(''),
            AssertionResult.error('Error1'),
            AssertionResult.hasPassed(),
            AssertionResult.error('Error2'),
        ]);
        expect(sut.status).toBe(RegressionResultStatus.VIOLATION);
        expect(sut.violationMessages).toEqual(['Error1', 'Error2']);
    });
});