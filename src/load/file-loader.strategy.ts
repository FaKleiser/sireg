import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import * as fs from 'fs';
import {injectable} from 'inversify';
import {TestCase} from '../regression/suite/test-case';
import * as winston from 'winston';

export interface FileLoaderOptions {
    path: string;
}

@injectable()
export class FileLoaderStrategy implements LoaderStrategy {

    private _options: FileLoaderOptions;

    setOptions(options: any): this {
        this._options = options;
        return this;
    }

    public load(): Observable<TestCase[]> {
        if (!this._options.path || !fs.existsSync(this._options.path)) {
            throw new Error(`File path to load from empty or not readable: '${this._options.path}'`);
        }
        const fileString: string = fs.readFileSync(this._options.path, 'utf-8');
        return Observable.of(fileString)
            .map((fileContent: string) => {
                const testCases: TestCase[] = fileContent
                    .split('\n')
                    .map(url => url.replace('\n', '').replace('\r', ''))
                    .filter(url => url != undefined && url.length > 0)
                    .map(url => TestCase.target(url).assertOK());
                winston.info(`Loaded ${testCases.length} test cases from file ${this._options.path}`);
                return testCases;
            });
    }

}