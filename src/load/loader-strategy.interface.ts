import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Observable';

/**
 * Loads a bunch of sitemap entries.
 */
export interface LoaderStrategy {
    load(): Observable<SitemapEntry[]>;
}