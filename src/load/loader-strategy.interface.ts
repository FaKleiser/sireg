import {Observable} from 'rxjs/Observable';
import {SiteUrl} from '../model/site-url.model';

/**
 * Loads a bunch of sitemap entries.
 */
export interface LoaderStrategy {
    setOptions(options: any): this;

    load(): Observable<SiteUrl[]>;
}