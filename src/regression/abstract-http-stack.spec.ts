import {TestCase} from '../regression/test-case';
import {HttpResponseStackBuilder} from './http-response-stack-builder';
import {mock} from 'ts-mockito';
import {AbstractHttpStack} from './abstract-http-stack';
import {HttpErrorStack} from './http-error-stack';
import {HttpResponseStack} from './http-response-stack';

describe('AbstractHttpStack', () => {

    let sut: AbstractHttpStack;
    let stack: HttpResponseStackBuilder;
    let testCase: TestCase;

    beforeEach(() => {
        testCase = mock(TestCase);
        sut = undefined;
        stack = new HttpResponseStackBuilder(testCase);
    });

    test('Fails to create test case without response and without error', () => {
        expect(() => stack.build()).toThrow(Error);
    });

    test('Can create from simple response', () => {
        const responseMock: any = {mock: true};
        sut = stack.withResponse(responseMock).build();
        expect(sut).toBeInstanceOf(HttpResponseStack);
        expect(sut.testCase).toBe(testCase);
        expect(sut.firstResponse).toBe(responseMock);
        expect(sut.lastResponse).toBe(responseMock);
        expect(sut.redirectsStack).toEqual([]);
    });

    test('Can create from redirect stack', () => {
        const redirect1Mock: any = {mock1: true};
        const redirect2Mock: any = {mock2: true};
        const responseMock: any = {mock3: true};
        sut = stack
            .pushRedirectResponse(redirect1Mock)
            .pushRedirectResponse(redirect2Mock)
            .withResponse(responseMock)
            .build();
        expect(sut.testCase).toBe(testCase);
        expect(sut.firstResponse).toBe(redirect1Mock);
        expect(sut.lastResponse).toBe(responseMock);
        expect(sut.redirectsStack).toEqual([redirect1Mock, redirect2Mock]);
    });

    test('Can create from HTTP error', () => {
        const error: any = {error: 'mock'};
        sut = stack.withError(error).build();
        expect(sut).toBeInstanceOf(HttpErrorStack);
        expect((sut as HttpErrorStack).error).toBe(error);
        expect(sut.redirectsStack).toEqual([]);
        expect(sut.firstResponse).toBeUndefined();
        expect(sut.lastResponse).toBeUndefined();
    });
});