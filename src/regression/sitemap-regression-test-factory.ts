import {TestCaseConfig} from './config/test-case-config';
import {SitemapRegressionTest} from './sitemap-regression-test';
import {inject, injectable} from 'inversify';
import {LoaderStrategy} from '../load/loader-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import Symbols from '../inversify.symbols';
import * as winston from 'winston';
import {InvalidTestCase} from './config/invalid-test-case';
import {UrlReplacerStrategy} from '../replace/url-replacer-strategy.interface';
import {ReporterStrategy} from '../reporter/reporter-strategy.interface';
import {ConsoleReporter} from '../reporter/console-reporter.strategy';

@injectable()
export class SitemapRegressionTestFactory {

    constructor(@inject(Symbols.LoaderStrategyFactory) private loaderFactory: (loader: string) => (options: any) => LoaderStrategy,
                @inject(Symbols.UrlReplacerStrategyFactory) private replacerFactory: (replacer: string) => (options: any) => UrlReplacerStrategy,
                @inject(Symbols.ReporterStrategyFactory) private reporterFactory: (reporter: string) => (options: any) => ReporterStrategy) {
    }

    public factory(config: TestCaseConfig): SitemapRegressionTest {
        const test: SitemapRegressionTest = new SitemapRegressionTest(config);
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
        for (const replacerCfg of config.replacers || []) {
            try {
                const factory: (options: any) => UrlReplacerStrategy = this.replacerFactory(replacerCfg.replacer);
                test.addReplacer(factory(replacerCfg.options));
            } catch (e) {
                winston.error(e);
                throw new InvalidTestCase(config, `An error occured while trying to setup replacer ${replacerCfg.replacer} with config ${JSON.stringify(replacerCfg.options)}.`);
            }
        }

        // define reporters
        if (!config.reporters || config.reporters.length === 0) {
            config.reporters = [{reporter: 'console'}];
        }
        for (const reporterCfg of config.reporters || []) {
            try {
                const factory: (options: any) => ReporterStrategy = this.reporterFactory(reporterCfg.reporter);
                test.addReporter(factory(reporterCfg.options));
            } catch (e) {
                winston.error(e);
                throw new InvalidTestCase(config, `An error occured while trying to setup reporter ${reporterCfg.reporter} with config ${JSON.stringify(reporterCfg.options)}.`);
            }
        }

        return test;
    }

}