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
    .action(async () => {
        winston.info('Starting sitemap regression');
        // setup loader
        let loader: LoaderStrategy = new SitemapLoaderStrategy('http://localhost/sitemap.xml');
        loader = new FileLoaderStrategy('test-data.txt');

        // create regression test
        let regression = new SitemapRegressionTest(loader);

        // setup filtering
        regression.withFilter(new AllEntriesStrategy());

        // define replacements
        regression.withReplacement('http://localhost/', 'http://localhost/');

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

    });


sitemapRegression.parse(process.argv);
