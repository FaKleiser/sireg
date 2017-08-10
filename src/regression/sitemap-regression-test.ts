import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {Observable} from 'rxjs/Observable';
import {SiteUrl} from '../model/site-url.model';
import * as request from 'request';
import {Request, RequestResponse} from 'request';
import {RegressionResultSet} from './result/regression-result-set';
import {RegressionResult} from './result/regression-result';
import {UrlReplacerStrategy} from '../replace/url-replacer-strategy.interface';
import winston = require('winston');

export class SitemapRegressionTest {

    private _loaders: LoaderStrategy[] = [];
    private _filters: FilterStrategy[] = [];
    private _replacers: UrlReplacerStrategy[] = [];

    constructor() {
    }

    public addLoader(loader: LoaderStrategy): this {
        this._loaders.push(loader);
        return this;
    }

    public addFilter(filter: FilterStrategy): this {
        this._filters.push(filter);
        return this;
    }

    public addReplacer(replacer: UrlReplacerStrategy): this {
        this._replacers.push(replacer);
        return this;
    }

    public regressionTest(): Observable<RegressionResultSet> {
        // 1. load
        let entries: Observable<SiteUrl[]> = Observable.from(this._loaders)
        // load all
            .flatMap((loader: LoaderStrategy) => loader.load())
            // combine all found SiteUrls to a single array
            .reduce((acc: SiteUrl[], cur: SiteUrl[]) => [].concat(acc, cur), [])
            .do((all: SiteUrl[]) => winston.info(`Loaded ${all.length} URLs`));

        // 2. filter
        for (const filter of this._filters) {
            entries = entries.map((all: SiteUrl[]) => filter.filter(all));
        }
        entries = entries.do((all: SiteUrl[]) => winston.info(`About to check ${all.length} filtered URLs`));

        // 3. turn the site url array into a stream of individual site urls.
        let single: Observable<SiteUrl> = entries.flatMap(entries => entries);

        // 4. apply replacements
        for (const replacer of this._replacers) {
            single = single.map((url: SiteUrl) => replacer.replace(url));
        }

        // 4. regression
        return single.flatMap((entry: SiteUrl): any => {
            return new Observable(observer => {
                winston.debug(`About to check ${entry.url}`);
                const req: Request = request(entry.url, {
                    timeout: 1500,
                }, (error: any, response: RequestResponse, body: any) => {
                    if (error) {
                        observer.error({'msg': `Could not get ${entry.url}`, err: error});
                    } else {
                        observer.next(new RegressionResult(entry.url, response.statusCode));
                    }
                    observer.complete();
                });
                return () => req.abort();
            });
        }, 3)
            .toArray()
            .map((results: RegressionResult[]) => new RegressionResultSet().addResults(results));
    }


    get loaders(): LoaderStrategy[] {
        return this._loaders;
    }

    get filters(): FilterStrategy[] {
        return this._filters;
    }

    get replacers(): UrlReplacerStrategy[] {
        return this._replacers;
    }
}