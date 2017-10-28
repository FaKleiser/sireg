import {TestSuiteConfigFactory} from './test-suite-config-factory';
import {TestSuiteConfig} from './test-suite-config';

describe('TestSuiteConfigFactory', () => {

    test('Can create testSuiteConfig from empty options', () => {
        const testSuiteConfig: TestSuiteConfig = TestSuiteConfigFactory.fromCommanderOptions({});
        expect(testSuiteConfig).toBeDefined();
        expect(testSuiteConfig).toHaveProperty('testSuite');
        expect(testSuiteConfig).toHaveProperty('loaders');
        expect(testSuiteConfig).toHaveProperty('replacers');
        expect(testSuiteConfig).toHaveProperty('filters');
        expect(testSuiteConfig).toHaveProperty('reporters');
    });

    test('Can set up a non-configured strategy', () => {
        const testSuiteConfig: TestSuiteConfig = TestSuiteConfigFactory.fromCommanderOptions({
            'loaderSitemap': true,
        });
        expect(testSuiteConfig.loaders).toBeDefined();
        expect(testSuiteConfig.loaders).toHaveLength(1);
        expect(testSuiteConfig.loaders[0]).toEqual({
            'loader': 'sitemap',
            'options': {}
        });
    });

    test('Can define a simple property of a strategy', () => {
        const testSuiteConfig: TestSuiteConfig = TestSuiteConfigFactory.fromCommanderOptions({
            'loaderSitemap': true,
            'loaderSitemapSitemap': 'sitemap.xml'
        });
        expect(testSuiteConfig.loaders).toBeDefined();
        expect(testSuiteConfig.loaders).toHaveLength(1);
        expect(testSuiteConfig.loaders[0]).toEqual({
            'loader': 'sitemap',
            'options': {
                'sitemap': 'sitemap.xml'
            }
        });
    });

    test('Can setup multiple strategies', () => {
        const testSuiteConfig: TestSuiteConfig = TestSuiteConfigFactory.fromCommanderOptions({
            'loaderSitemap': true,
            'loaderSitemapSitemap': 'sitemap.xml',
            'replacerStatic': true,
            'replacerStaticReplace': 'replace-this',
            'replacerStaticWith': 'with-this',
        });
        expect(testSuiteConfig.loaders).toBeDefined();
        expect(testSuiteConfig.loaders).toHaveLength(1);
        expect(testSuiteConfig.loaders[0]).toEqual({
            'loader': 'sitemap',
            'options': {
                'sitemap': 'sitemap.xml'
            }
        });
        expect(testSuiteConfig.replacers).toBeDefined();
        expect(testSuiteConfig.replacers).toHaveLength(1);
        expect(testSuiteConfig.replacers[0]).toEqual({
            'replacer': 'static',
            'options': {
                'replace': 'replace-this',
                'with': 'with-this'
            }
        });
    });
});