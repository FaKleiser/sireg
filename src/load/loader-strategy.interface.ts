import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Observable';

/**
 * Loads a bunch of sitemap entries.
 */
export interface LoaderStrategy {
    setOptions(options: any): this;
    load(): Observable<SitemapEntry[]>;
}