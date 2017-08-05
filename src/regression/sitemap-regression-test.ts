import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import {Observable} from 'rxjs/Observable';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {UrlReplacer} from './url-replacer';
import {RegressionViolation} from './regression-violation';
import {ClientRequest, IncomingMessage} from 'http';
import * as request from 'request';
import {RequestResponse} from 'request';

const http = require('http');

export class SitemapRegressionTest {

    private loader: LoaderStrategy;
    private filter: FilterStrategy = new AllEntriesStrategy();
    private urlReplacer: UrlReplacer = new UrlReplacer();

    constructor(loader: LoaderStrategy) {
        this.loader = loader;
    }

    public withFilter(filter: FilterStrategy): this {
        this.filter = filter;
        return this;
    }

    public withReplacement(replace: string, by: string): this {
        this.urlReplacer.withReplacement(replace, by);
        return this;
    }

    public regressionTest(): Observable<RegressionViolation> {
        let entries = this.loader.load();
        entries = this.filter.filter(entries);

        return entries.flatMap(entries => entries)
            .map(entry => new SitemapEntry(this.urlReplacer.replace(entry.url)))
            .flatMap((entry: SitemapEntry): any => {
                return new Observable(observer => {
                    console.log(`About to check ${entry.url}`);
                    let req = request(entry.url, (error: any, response: RequestResponse, body: any) => {
                        if (error) {
                            observer.error({'msg': `Could not get ${entry.url}`, err: error});
                        } else if (200 != response.statusCode) {
                            observer.next(new RegressionViolation(entry.url, response.statusCode));
                        }
                        observer.complete();
                    });
                    return () => req.abort();
                });
            }, 3);
    }
}