import {FilterStrategy} from './filter-strategy.interface';
import {SiteUrl} from '../model/site-url.model';

/**
 * A strategy to regression test all sitemap entries found by the loader.
 */
export class AllEntriesStrategy implements FilterStrategy {

    filter(entries: SiteUrl[]): SiteUrl[] {
        return entries;
    }

}