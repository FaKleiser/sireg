import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Rx';
import {inject, injectable} from 'inversify';
import Symbols from '../inversify.symbols';
import * as winston from 'winston';
import {TestCase} from '../regression/suite/test-case';

export interface SitemapLoaderOptions {
    sitemap: string;
}

@injectable()
export class SitemapLoaderStrategy implements LoaderStrategy {

    private _options: SitemapLoaderOptions;

    constructor(@inject(Symbols.Sitemapper) private sitemapper: any) {
    }

    setOptions(options: any): this {
        this._options = options;
        return this;
    }

    load(): Observable<TestCase[]> {
        return Observable.fromPromise(this.sitemapper.fetch(this._options.sitemap))
            .map((sitemap: any) => {
                const testCases: TestCase[] = [];
                for (const site of sitemap.sites) {
                    testCases.push(TestCase.target(site).assertOK());
                }
                winston.info(`Loaded ${testCases.length} test cases from sitemap ${this._options.sitemap}`);
                return testCases;
            });
    }
}