import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import {Observable} from 'rxjs/Observable';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {UrlReplacer} from './url-replacer';
import * as request from 'request';
import {Request, RequestResponse} from 'request';
import winston = require('winston');
import {RegressionResultSet} from './result/regression-result-set';
import {RegressionResult} from './result/regression-result';

export class SitemapRegressionTest {

    private filter: FilterStrategy = new AllEntriesStrategy();
    private urlReplacer: UrlReplacer = new UrlReplacer();

    constructor(private loaders: LoaderStrategy[]) {
    }

    public withFilter(filter: FilterStrategy): this {
        this.filter = filter;
        return this;
    }

    public withReplacement(replace: string, by: string): this {
        this.urlReplacer.withReplacement(replace, by);
        return this;
    }

    public regressionTest(): Observable<RegressionResultSet> {
        let entries: Observable<SitemapEntry[]> = Observable.from(this.loaders)
            .flatMap((loader: LoaderStrategy) => loader.load());

        entries = this.filter.filter(entries)
            .do((all: SitemapEntry[]) => winston.debug(`About to check ${all.length} URLs`));

        return entries.flatMap(entries => entries)
            .map(entry => new SitemapEntry(this.urlReplacer.replace(entry.url)))
            .flatMap((entry: SitemapEntry): any => {
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
}