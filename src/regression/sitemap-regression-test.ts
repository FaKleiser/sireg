import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {Observable} from 'rxjs/Observable';
import {SiteUrl} from '../model/site-url.model';
import * as request from 'request';
import {Request, RequestResponse} from 'request';
import {RegressionResultSet} from './result/regression-result-set';
import {RegressionResult} from './result/regression-result';
import {UrlReplacerStrategy} from '../replace/url-replacer-strategy.interface';
import {TestCaseConfig} from './config/test-case-config';
import {ReporterStrategy} from '../reporter/reporter-strategy.interface';
import winston = require('winston');
import http = require('http');
import {TestSuite} from './test-suite';

export class SitemapRegressionTest {

    public regressionTest(suite: TestSuite): Observable<RegressionResultSet> {
        // 1. load
        let entries: Observable<SiteUrl[]> = Observable.from(suite.loaders)
        // load all
            .flatMap((loader: LoaderStrategy) => loader.load())
            // combine all found SiteUrls to a single array
            .reduce((acc: SiteUrl[], cur: SiteUrl[]) => [].concat(acc, cur), [])
            .do((all: SiteUrl[]) => winston.info(`Loaded ${all.length} URLs`));

        // 2. filter
        for (const filter of suite.filters) {
            entries = entries.map((all: SiteUrl[]) => filter.filter(all));
        }
        entries = entries.do((all: SiteUrl[]) => winston.info(`About to check ${all.length} filtered URLs`));

        // 3. turn the site url array into a stream of individual site urls.
        let single: Observable<SiteUrl> = entries.flatMap(entries => entries);

        // 4. apply replacements
        for (const replacer of suite.replacers) {
            single = single.map((url: SiteUrl) => replacer.replace(url));
        }

        // 4. regression
        return single
        // request each url
            .flatMap<SiteUrl, RegressionResult>((siteUrl: SiteUrl): any => {
                return new Observable(observer => {
                    winston.debug(`About to check ${siteUrl.url}`);
                    const redirectsStack: http.IncomingMessage[] = [];
                    const req: Request = request(siteUrl.url, {
                        timeout: suite.config.settings.requestTimeout,
                        followRedirect: (response: http.IncomingMessage): boolean => {
                            if (response.statusCode >= 300 && response.statusCode <= 308) {
                                redirectsStack.push(response);
                                return true;
                            }
                            return false;
                        }
                    }, (error: any, response: RequestResponse, body: any) => {
                        if (error) {
                            observer.next(RegressionResult.httpError(siteUrl, error, redirectsStack));
                        } else {
                            observer.next(RegressionResult.httpResponse(siteUrl, response, redirectsStack));
                        }
                        observer.complete();
                    });
                    return () => req.abort();
                });
            }, suite.config.settings.concurrentRequests)
            // collect individual regression results
            .reduce<RegressionResult, RegressionResultSet>((set: RegressionResultSet, res: RegressionResult): RegressionResultSet => {
                return set.addResult(res);
            }, new RegressionResultSet())
            .do((res: RegressionResultSet) => {
                suite.reporters.forEach((reporter: ReporterStrategy) => reporter.report(suite.config, res));
            });
    }

}