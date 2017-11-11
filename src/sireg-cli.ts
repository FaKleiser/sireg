import {container} from './inversify.config';
import {CommanderStatic} from 'commander';
import {Subscription} from 'rxjs/Subscription';
import * as http from 'http';
import * as https from 'https';
import {TestSuiteConfig} from './regression/suite/config/test-suite-config';
import {RegressionResultSet} from './regression/result/regression-result-set';
import {TestSuiteFactory} from './regression/suite/test-suite-factory';
import {SiregExecutor} from './regression/flow/sireg-executor';
import {TestSuiteConfigFactory} from './regression/suite/config/test-suite-config-factory';
import strftime = require('strftime');
import winston = require('winston');
import {SiregError} from './exception/sireg-error';

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

const sireg: CommanderStatic = require('commander');

// == define CLI commands
sireg
    .version('0.3.1');

sireg.command('test <config>')
    .description('Execute the given test suite JSON file')
    .action(async (configFile: string) => {
        const config: TestSuiteConfig = TestSuiteConfigFactory.fromFile(configFile);
        await handleCommand(config);
    });

const execCmd: any = sireg.command('exec');
execCmd
    .description('Define a simple test suite through CLI options')

    // loaders
    .option('--loader-sitemap', '[Loader/Sitemap] Enable the sitemap loader')
    .option('--loader-sitemap-sitemap <sitemap>', '[Loader/Sitemap] The URL to the sitemap')
    .option('--loader-file', '[Loader/File] Enable the file loader')
    .option('--loader-file-path <path>', '[Loader/File] The path to the file containing the URLs to be tested')
    .option('--loader-csv', '[Loader/CSV] Enable the CSV loader')
    .option('--loader-csv-path <path>', '[Loader/CSV] The path to the CSV file containing the URLs to be tested')

    // replacers
    .option('--replacer-static', '[Replacer/Static] Enable the static replacer')
    .option('--replacer-static-replace <replace>', '[Replacer/Static] The string to replace in each URL being tested')
    .option('--replacer-static-with <with>', '[Replacer/Static] The value to replace each match of the URLs being tested')

    .action(async () => {
        const config: TestSuiteConfig = TestSuiteConfigFactory.fromCommanderOptions(execCmd.opts()) as any;
        await handleCommand(config);

    });

if (!process.argv.slice(2).length) {
    sireg.outputHelp();
}
sireg.parse(process.argv);

async function handleCommand(config: TestSuiteConfig): Promise<void> {
    try {
        await siregExec(config);
    } catch (e) {
        if (e instanceof SiregError) {
            winston.error(`${e.message}`);
        } else {
            winston.error(`Unexpected critical error occucured. Stack trace:\n ${e.stack}`);
        }
        process.exit(1);
    }
}

async function siregExec(config: TestSuiteConfig): Promise<void> {
    winston.info('Starting sireg');

    // load config
    http.globalAgent.maxSockets = config.settings.concurrentRequests;
    https.globalAgent.maxSockets = config.settings.concurrentRequests;
    const testFactory: TestSuiteFactory = container.get(TestSuiteFactory);

    // find violations
    let resultSet: RegressionResultSet;
    let subscription: Subscription;
    await new Promise((acc, err) => {
        subscription = new SiregExecutor()
            .regressionTest(testFactory.factory(config))
            .subscribe(
                (result: RegressionResultSet) => resultSet = result,
                (err: any) => { throw err; },
                () => acc()
            );
    });
    subscription.unsubscribe();

    // print violations
    if (resultSet && (resultSet.hasViolations || resultSet.hasErrors)) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}