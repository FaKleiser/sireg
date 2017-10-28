import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import * as fs from 'fs';
import {injectable} from 'inversify';
import {parse} from 'papaparse';
import * as winston from 'winston';
import {TestCase} from '../regression/suite/test-case';
import {SiregError} from '../exception/sireg-error';

export interface CsvLoaderOptions {
    path: string;
}

@injectable()
export class CsvLoaderStrategy implements LoaderStrategy {

    public static HEADER_URL: string = 'url';
    public static HEADER_EXPECTED_URL: string = 'expectedUrl';
    public static HEADER_EXPECTED_STATUS_CODE: string = 'expectedStatusCode';

    private _options: CsvLoaderOptions;

    setOptions(options: any): this {
        this._options = options;
        return this;
    }

    public load(): Observable<TestCase[]> {
        if (!this._options.path || !fs.existsSync(this._options.path)) {
            throw new SiregError(`File path to load from empty or not readable: '${this._options.path}'`);
        }
        const fileString: string = fs.readFileSync(this._options.path, 'utf-8');
        return Observable.of(fileString)
            .map((fileContent: string) => parse(fileContent, {
                header: true,
                skipEmptyLines: true
            }))
            .map((parseResult: PapaParse.ParseResult) => {
                // print parse errors
                if (parseResult.errors) {
                    parseResult.errors.forEach((err: PapaParse.ParseError) => winston.error(JSON.stringify(err)));
                }

                const urls: TestCase[] = [];

                // check required fields
                if (parseResult.data.length > 0 && !parseResult.data[0][CsvLoaderStrategy.HEADER_URL]) {
                    winston.error(`Loaded CSV file ${this._options.path} misses column with name ${CsvLoaderStrategy.HEADER_URL}`);
                    return urls;
                }

                // convert to site urls
                for (const row of parseResult.data || []) {
                    const testCase: TestCase = TestCase.target(row[CsvLoaderStrategy.HEADER_URL]).assertOK();
                    if (row[CsvLoaderStrategy.HEADER_EXPECTED_URL]) {
                        testCase.assertRedirectTarget(row[CsvLoaderStrategy.HEADER_EXPECTED_URL]);
                    }
                    if (row[CsvLoaderStrategy.HEADER_EXPECTED_STATUS_CODE]) {
                        testCase.assertRedirectStatusCode(row[CsvLoaderStrategy.HEADER_EXPECTED_STATUS_CODE]);
                    }
                    urls.push(testCase);
                }
                return urls;
            });
    }

}