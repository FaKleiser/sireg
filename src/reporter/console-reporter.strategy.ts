import {ReporterStrategy} from './reporter-strategy.interface';
import {TestCaseConfig} from '../regression/config/test-case-config';
import {RegressionResultSet} from '../regression/result/regression-result-set';
import {injectable} from 'inversify';
process.stdout.isTTY = true;
import * as c from 'colors/safe';

@injectable()
export class ConsoleReporter implements ReporterStrategy {

    setOptions(options: any): this {
        // no options supported yet
        return this;
    }

    async report(testCase: TestCaseConfig, result: RegressionResultSet): Promise<void> {
        console.log(Array(80).join('='));
        console.log(c.bold(`== ${testCase.testCase} ==`));

        // details
        if (result.hasErrors || result.hasViolations) {
            console.log(c.bold(`Details:`));
            for (const error of result.errors) {
                console.log(`  [${error.errorCode}] ${error.affectedUrl.url} with error message: ${error.errorMessage}`);
            }
            for (const violation of result.violations) {
                console.log(`  [${violation.statusCode}] ${violation.affectedUrl.url}`);
            }
        }



        // summary statistics
        console.log(c.bold(`Summary:`));
        console.log(`  Errors: ${result.errors.length}`);
        console.log(`  Violations: ${result.violations.length}`);
        console.log(`  Passed: ${result.passed.length}`);
        console.log(Array(80).join('='));
    }

}