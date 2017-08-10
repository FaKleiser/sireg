import {SitemapRegressionTestFactory} from './sitemap-regression-test-factory';
import {LoaderStrategyResolver} from '../load/loader-strategy-resolver';
import {TestCaseConfig} from './config/test-case-config';
import {InvalidTestCase} from './config/invalid-test-case';
import {container} from '../inversify.config';
import {SitemapRegressionTest} from './sitemap-regression-test';
import Mock = jest.Mock;

describe('SitemapRegressionTestFactory', () => {

    let loaderFactoryMock: Mock<LoaderStrategyResolver>;
    let sut: SitemapRegressionTestFactory;

    beforeEach(() => {
        loaderFactoryMock = jest.fn();
        sut = container.get(SitemapRegressionTestFactory);
    });

    test('Factory fails if no loaders are defined', () => {
        expect(() => sut.factory({} as TestCaseConfig)).toThrow(InvalidTestCase);
        expect(() => sut.factory({loaders: undefined} as TestCaseConfig)).toThrow(InvalidTestCase);
        expect(() => sut.factory({loaders: []} as TestCaseConfig)).toThrow(InvalidTestCase);
    });

    test('Can factory test with single loader', () => {
        let test = sut.factory({
            testCase: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}]
        });
        expect(test).toBeInstanceOf(SitemapRegressionTest);
        expect(test.loaders.length).toBe(1);
    });

    test('Can factory test with multiple loaders', () => {
        let test = sut.factory({
            testCase: 'IntegrationTest',
            loaders: [
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'file', 'options': {'filePath': 'somePath'}}
            ]
        });
        expect(test).toBeInstanceOf(SitemapRegressionTest);
        expect(test.loaders.length).toBe(3);
    });

    test('An unknown loader cause the factory to fail', () => {
        expect(() => sut.factory({
            testCase: 'IntegrationTest',
            loaders: [
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'unknown', 'options': {'filePath': 'somePath'}}
            ]
        })).toThrow(InvalidTestCase);
    });
});