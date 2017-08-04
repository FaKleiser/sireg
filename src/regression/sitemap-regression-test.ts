import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {AllEntriesStrategy} from '../filter/all-entries.strategy';
import {Observable} from 'rxjs/Observable';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {UrlReplacer} from './url-replacer';

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

    public regressionTest(): Observable<void> {
        let entries = this.loader.load();
        entries = this.filter.filter(entries);

        return entries.flatMap(entries => entries)
            .map(entry => new SitemapEntry(this.urlReplacer.replace(entry.url)))
            .do(console.log);
    }
}