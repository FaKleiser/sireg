import {LoaderStrategy} from './loader-strategy.interface';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Rx';
import {inject, injectable} from 'inversify';
import Symbols from '../inversify.symbols';
import * as winston from 'winston';

export interface SitemapLoaderOptions {
    sitemap: string;
}

@injectable()
export class SitemapLoaderStrategy implements LoaderStrategy {

    private _options: SitemapLoaderOptions;

    constructor(@inject(Symbols.Sitemapper) private sitemapper: any) {
    }

    setOptions(options: any): this {
        this._options = options;
        return this;
    }

    load(): Observable<SitemapEntry[]> {
        return Observable.fromPromise(this.sitemapper.fetch(this._options.sitemap))
            .map((sitemap: any) => {
                const entries: SitemapEntry[] = [];
                for (const site of sitemap.sites) {
                    entries.push(new SitemapEntry(site));
                }
                winston.info(`Loaded ${entries.length} entries from sitemap ${this._options.sitemap}`);
                return entries;
            });
    }
}