import {SiteUrl} from '../model/site-url.model';

/**
 * Depending on what level of regression testing is aimed at, a strategy may filter certain entries of the sitemap.
 */
export interface FilterStrategy {
    filter(entries: SiteUrl[]): SiteUrl[];
}