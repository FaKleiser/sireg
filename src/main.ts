import {container} from './inversify.config';
import {CommanderStatic} from 'commander';
import {Subscription} from 'rxjs/Subscription';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import {TestCaseConfig} from './regression/config/test-case-config';
import {RegressionResultSet} from './regression/result/regression-result-set';
import {SitemapRegressionTestFactory} from './regression/sitemap-regression-test-factory';
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


http.globalAgent.maxSockets = 2;
https.globalAgent.maxSockets = 2;

const sireg: CommanderStatic = require('commander');

// == define CLI commands
sireg
    .version('0.1.0');

sireg.command('test <config>')
    .description('Execute the given test case')
    .action((configFile: string) => {
        try {
            siregExec(configFile);
        } catch (e) {
            winston.error(`Critical error occucured. Exiting application. Error was:\n ${e.stack}`);
            process.exit(1);
        }
    });


if (!process.argv.slice(2).length) {
    sireg.outputHelp();
}
sireg.parse(process.argv);

async function siregExec(configFile: string): Promise<void> {
    winston.info('Starting sireg');

    // load config
    const config: TestCaseConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const testFactory: SitemapRegressionTestFactory = container.get(SitemapRegressionTestFactory);

    // find violations
    let resultSet: RegressionResultSet;
    let subscription: Subscription;
    await new Promise((acc, err) => {
        subscription = testFactory.factory(config)
            .regressionTest()
            .subscribe(
                (result: RegressionResultSet) => resultSet = result,
                (err: any) => winston.error('An error occured:', err),
                () => acc()
            );
    });
    subscription.unsubscribe();

    // print violations
    if (resultSet && (resultSet.hasViolations || resultSet.hasErrors)) {
        winston.error(`sireg found the following errors (${Object.keys(resultSet.violations).length}):`);
        resultSet.print();
        process.exit(1);
    } else {
        winston.info('sireg found no errors.');
        process.exit(0);
    }
}