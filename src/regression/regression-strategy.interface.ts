import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Observable';

/**
 * Depending on what level of regression testing is aimed at, a strategy may filter certain entries of the sitemap.
 */
export interface RegressionStrategy {
    filter(entries: Observable<SitemapEntry[]>): Observable<SitemapEntry[]>;
}