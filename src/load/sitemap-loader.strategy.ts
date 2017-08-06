import {LoaderStrategy} from './loader-strategy.interface';
import {SitemapEntry} from '../model/sitemap-entry.model';
import {Observable} from 'rxjs/Rx';

const Sitemapper: any = require('sitemapper');

export class SitemapLoaderStrategy implements LoaderStrategy {

    private _sitemapper: any = new Sitemapper();

    constructor(private _sitemapUrl: string) {
    }

    load(): Observable<SitemapEntry[]> {
        return Observable.fromPromise(this._sitemapper.fetch(this._sitemapUrl))
            .map((sitemap: any) => {
                const entries: SitemapEntry[] = [];
                for (const site of sitemap.sites) {
                    entries.push(new SitemapEntry(site));
                }
                console.log(`Loaded ${entries.length} entries from sitemap ${this._sitemapUrl}`);
                return entries;
            });
    }
}