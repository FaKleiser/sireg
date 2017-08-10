import {TestCaseConfig} from './config/test-case-config';
import {SitemapRegressionTest} from './sitemap-regression-test';
import {inject, injectable} from 'inversify';
import {LoaderStrategy} from '../load/loader-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import Symbols from '../inversify.symbols';

@injectable()
export class SitemapRegressionTestFactory {

    constructor(@inject(Symbols.LoaderStrategyFactory) private loaderFactory: (loader: string) => (options: any) => LoaderStrategy) {
    }

    public factory(config: TestCaseConfig): SitemapRegressionTest {
        const test: SitemapRegressionTest = new SitemapRegressionTest();

        // setup loaders
        for (const loaderCfg of config.loaders) {
            const factory: (options: any) => LoaderStrategy = this.loaderFactory(loaderCfg.loader);
            test.addLoader(factory(loaderCfg.options));
        }

        // setup filtering
        test.addFilter(new AllEntriesStrategy());

        // define replacements
        for (const replacementCfg of config.replacements || []) {
            switch (replacementCfg.replacement) {
                case 'static':
                    test.withReplacement(replacementCfg.options.replace, replacementCfg.options.by);
                    break;
                default:
                    throw new Error(`Unsupported replacement: ${replacementCfg.replacement}`);
            }
        }
        return test;
    }

}