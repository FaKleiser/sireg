import {TestSuiteFactory} from './test-suite-factory';
import {LoaderStrategyResolver} from '../load/loader-strategy-resolver';
import {TestCaseConfig} from './config/test-case-config';
import {InvalidTestCase} from './config/invalid-test-case';
import {container} from '../inversify.config';
import {StaticReplacerStrategy} from '../replace/static-replacer.strategy';
import {FileLoaderStrategy} from '../load/file-loader.strategy';
import {TestSuite} from './test-suite';
import Mock = jest.Mock;

describe('TestSuiteFactory', () => {

    let loaderFactoryMock: Mock<LoaderStrategyResolver>;
    let sut: TestSuiteFactory;
    let t: TestSuite;

    beforeEach(() => {
        loaderFactoryMock = jest.fn();
        sut = container.get(TestSuiteFactory);
    });

    test('Factory fails if no loaders are defined', () => {
        expect(() => sut.factory({} as TestCaseConfig)).toThrow(InvalidTestCase);
        expect(() => sut.factory({loaders: undefined} as TestCaseConfig)).toThrow(InvalidTestCase);
        expect(() => sut.factory({loaders: []} as TestCaseConfig)).toThrow(InvalidTestCase);
    });

    test('Can factory test with single loader', () => {
        t = sut.factory({
            testCase: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}]
        });
        expect(t).toBeInstanceOf(TestSuite);
        expect(t.loaders[0]).toBeInstanceOf(FileLoaderStrategy);
        expect(t.loaders.length).toBe(1);
    });

    test('Can factory test with multiple loaders', () => {
        t = sut.factory({
            testCase: 'IntegrationTest',
            loaders: [
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'file', 'options': {'filePath': 'somePath'}}
            ]
        });
        expect(t).toBeInstanceOf(TestSuite);
        expect(t.loaders.length).toBe(3);
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


    test('Can factory test with a replacer', () => {
        t = sut.factory({
            testCase: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}],
            replacers: [{'replacer': 'static', options: {replace: 'foo', 'with': 'bar'}}]
        });
        expect(t).toBeInstanceOf(TestSuite);
        expect(t.replacers[0]).toBeInstanceOf(StaticReplacerStrategy);
        expect(t.replacers.length).toBe(1);
    });

    test('An unknown url replacer causes the factory to fail', () => {
        expect(() => sut.factory({
            testCase: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}],
            replacers: [{'replacer': 'unknown', options: {}}]
        })).toThrow(InvalidTestCase);
    });
});