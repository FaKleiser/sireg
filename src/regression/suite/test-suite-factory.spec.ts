import {TestSuiteFactory} from './test-suite-factory';
import {LoaderStrategyResolver} from '../../load/loader-strategy-resolver';
import {TestSuiteConfig} from './config/test-suite-config';
import {InvalidTestCaseError} from './config/invalid-test-case.error';
import {container} from '../../inversify.config';
import {StaticReplacerStrategy} from '../../replace/static-replacer.strategy';
import {FileLoaderStrategy} from '../../load/file-loader.strategy';
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
        expect(() => sut.factory({} as TestSuiteConfig)).toThrow(InvalidTestCaseError);
        expect(() => sut.factory({loaders: undefined} as TestSuiteConfig)).toThrow(InvalidTestCaseError);
        expect(() => sut.factory({loaders: []} as TestSuiteConfig)).toThrow(InvalidTestCaseError);
    });

    test('Can factory test with single loader', () => {
        t = sut.factory({
            testSuite: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}]
        });
        expect(t).toBeInstanceOf(TestSuite);
        expect(t.loaders[0]).toBeInstanceOf(FileLoaderStrategy);
        expect(t.loaders.length).toBe(1);
    });

    test('Can factory test with multiple loaders', () => {
        t = sut.factory({
            testSuite: 'IntegrationTest',
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
            testSuite: 'IntegrationTest',
            loaders: [
                {'loader': 'file', 'options': {'filePath': 'somePath'}},
                {'loader': 'unknown', 'options': {'filePath': 'somePath'}}
            ]
        })).toThrow(InvalidTestCaseError);
    });


    test('Can factory test with a replacer', () => {
        t = sut.factory({
            testSuite: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}],
            replacers: [{'replacer': 'static', options: {replace: 'foo', 'with': 'bar'}}]
        });
        expect(t).toBeInstanceOf(TestSuite);
        expect(t.replacers[0]).toBeInstanceOf(StaticReplacerStrategy);
        expect(t.replacers.length).toBe(1);
    });

    test('An unknown url replacer causes the factory to fail', () => {
        expect(() => sut.factory({
            testSuite: 'IntegrationTest',
            loaders: [{'loader': 'file', 'options': {'filePath': 'somePath'}}],
            replacers: [{'replacer': 'unknown', options: {}}]
        })).toThrow(InvalidTestCaseError);
    });
});