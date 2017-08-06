import {SitemapLoaderStrategy} from './load/sitemap-loader.strategy';
import {AllEntriesStrategy} from './filter/all-entries.strategy';
import {CommanderStatic} from 'commander';
import {SitemapRegressionTest} from './regression/sitemap-regression-test';
import {FileLoaderStrategy} from './load/file-loader.strategy';
import {LoaderStrategy} from './load/loader-strategy.interface';
import {RegressionViolation} from './regression/regression-violation';
import {Subscription} from 'rxjs/Subscription';
import strftime = require('strftime');
import winston = require('winston');
import * as fs from 'fs';


// == configure logger
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    prettyPrint: true,
    level: process.env.LOG_LEVEL || 'debug',
    colorize: true,
    silent: false,
    stderrLevels: [],
    timestamp: () => strftime('%F %T.%L')
});


const sitemapRegression: CommanderStatic = require('commander');

// == define CLI commands
sitemapRegression
    .version('0.1.0')
    .arguments('<config>')
    .action((configFile: string) => {
        try {
            sitemapRegressionExec(configFile);
        } catch (e) {
            winston.error(`Critical error occucured. Exiting application. Error was:\n ${e.stack}`);
            process.exit(1);
        }
    });


sitemapRegression.parse(process.argv);

async function sitemapRegressionExec(configFile: string): Promise<void> {
    winston.info('Starting sitemap regression');

    // load config
    const config: any = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    // fixme: validate with json schema

    // setup loader
    // fixme: support multiple loaders
    let loader: LoaderStrategy;
    for (const loaderCfg of config.loaders) {
        switch (loaderCfg.loader) {
            case 'file':
                loader = new FileLoaderStrategy(loaderCfg.options.filePath);
                break;
            case 'sitemap':
                loader = new SitemapLoaderStrategy(loaderCfg.options.sitemap);
                break;
            default:
                throw new Error(`Unsupported loader: ${loaderCfg.loader}`);
        }
    }

    // create regression test
    const regression: SitemapRegressionTest = new SitemapRegressionTest(loader);

    // setup filtering
    regression.withFilter(new AllEntriesStrategy());

    // define replacements
    for (const replacementCfg of config.replacements || []) {
        switch (replacementCfg.replacement) {
            case 'static':
                regression.withReplacement(replacementCfg.options.replace, replacementCfg.options.by);
                break;
            default:
                throw new Error(`Unsupported replacement: ${replacementCfg.replacement}`);
        }
    }


    // find violations
    const violations: RegressionViolation[] = [];
    let subscription: Subscription;
    await new Promise((acc, err) => {
        subscription = regression
            .regressionTest()
            .subscribe(
                (violation: RegressionViolation) => violations.push(violation),
                (err: any) => winston.error('An error occured:', err),
                () => acc()
            );
    });
    subscription.unsubscribe();

    // print violations
    if (violations.length > 0) {
        winston.error(`Sitemap regression found the following errors (${violations.length}):`);
        for (const violation of violations) {
            winston.error(violation.toString());
        }
        process.exit(1);
    } else {
        winston.info('Sitemap regression found no errors.');
        process.exit(0);
    }
}