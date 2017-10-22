import {ReporterStrategy} from './reporter-strategy.interface';
import {RegressionResultSet} from '../regression/result/regression-result-set';
import {injectable} from 'inversify';
import * as c from 'colors/safe';
import {TestSuiteConfig} from '../regression/suite/config/test-suite-config';

process.stdout.isTTY = true;

@injectable()
export class ConsoleReporter implements ReporterStrategy {

    setOptions(options: any): this {
        // no options supported yet
        return this;
    }

    async report(testCase: TestSuiteConfig, result: RegressionResultSet): Promise<void> {
        console.log(Array(80).join('='));
        console.log(c.bold(`== ${testCase.testSuite} ==`));

        if (result.hasErrors) {
            console.log('Errors:');
            for (const error of result.errors) {
                console.log(`  Error occured for '${error.testCase.targetUrl}': ${error.errorMessages.join(' # ')}`);
            }
        }

        if (result.hasViolations) {
            console.log('Violations:');
            for (const violation of result.violations) {
                console.log(`  Assertion violated for '${violation.testCase.targetUrl}': ${violation.violationMessages.join(' # ')}`);
            }
        }

        // fixme: details
        // if (result.hasErrors || result.hasViolations) {
        //     console.log(c.bold(`Details:`));
        //     for (const error of result.errors) {
        //         console.log(`  [${error.errorCode}] ${error.affectedUrl.url} with error message: ${error.errorMessage}`);
        //     }
        //     for (const violation of result.violations) {
        //         console.log(`  [${violation.statusCode}] ${violation.affectedUrl.url}`
        //             + ((violation.hasError) ? ` with error message: ${violation.errorMessage}` : ''));
        //     }
        // }


        // summary statistics
        console.log(c.bold(`Summary:`));
        console.log(`  Errors: ${result.errors.length}`);
        console.log(`  Violations: ${result.violations.length}`);
        console.log(`  Passed: ${result.passed.length}`);
        console.log(Array(80).join('='));
    }

}