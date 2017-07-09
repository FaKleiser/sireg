import {RegressionStrategy} from './regression-strategy.interface';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Rx';

/**
 * A strategy to regression test all sitemap entries found by the loader.
 */
export class AllEntriesStrategy implements RegressionStrategy {
    filter(entries: Observable<SitemapEntry[]>): Observable<SitemapEntry[]> {
        return entries;
    }

}