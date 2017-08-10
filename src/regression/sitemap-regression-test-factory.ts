import {TestCaseConfig} from './config/test-case-config';
import {SitemapRegressionTest} from './sitemap-regression-test';
import {inject, injectable} from 'inversify';
import {LoaderStrategy} from '../load/loader-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import Symbols from '../inversify.symbols';
import * as winston from 'winston';
import {InvalidTestCase} from './config/invalid-test-case';

@injectable()
export class SitemapRegressionTestFactory {

    constructor(@inject(Symbols.LoaderStrategyFactory) private loaderFactory: (loader: string) => (options: any) => LoaderStrategy) {
    }

    public factory(config: TestCaseConfig): SitemapRegressionTest {
        const test: SitemapRegressionTest = new SitemapRegressionTest();
        winston.info(`Configuring test case: ${config.testCase}`);

        // setup loaders
        if (!config.loaders || config.loaders.length < 1) {
            throw new InvalidTestCase(config, 'Test case needs to define at least one loader.');
        }
        for (const loaderCfg of config.loaders) {
            try {
                const factory: (options: any) => LoaderStrategy = this.loaderFactory(loaderCfg.loader);
                test.addLoader(factory(loaderCfg.options));
            } catch (e) {
                winston.error(e);
                throw new InvalidTestCase(config, `An error occured while trying to setup loader ${loaderCfg.loader} with config ${JSON.stringify(loaderCfg.options)}.`);
            }
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