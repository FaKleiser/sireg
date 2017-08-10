import {SiteUrl} from '../model/site-url.model';

/**
 * Interface used to modify site urls to change URL targets during the regression testing.
 */
export interface UrlReplacerStrategy {

    setOptions(options: any): this;

    replace(url: SiteUrl): SiteUrl;
}