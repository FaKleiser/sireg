import {FilterStrategy} from './filter-strategy.interface';
import {SitemapEntry} from '../model/sitemap-entry.model';

/**
 * A strategy to regression test all sitemap entries found by the loader.
 */
export class AllEntriesStrategy implements FilterStrategy {

    filter(entries: SitemapEntry[]): SitemapEntry[] {
        return entries;
    }

}