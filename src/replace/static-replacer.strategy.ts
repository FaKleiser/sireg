import {UrlReplacerStrategy} from './url-replacer-strategy.interface';
import {SiteUrl} from '../model/site-url.model';

export interface StaticReplacerStrategyOptions {
    'replace': string;
    'with': string;
}

export class StaticReplacerStrategy implements UrlReplacerStrategy {

    private options: StaticReplacerStrategyOptions;

    setOptions(options: StaticReplacerStrategyOptions): this {
        this.options = options;
        return this;
    }

    public replace(siteUrl: SiteUrl): SiteUrl {
        if (!this.options) {
            throw new Error('No options provided for static replacer!');
        }
        return new SiteUrl(siteUrl.url.replace(this.options.replace, this.options.with));
    }
}