import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import {SitemapEntry} from '../model/sitemap-entry.model';
import * as fs from 'fs';
import {injectable, interfaces} from 'inversify';
import Factory = interfaces.Factory;

export interface FileLoaderOptions {
    filePath: string;
}

@injectable()
export class FileLoaderStrategy implements LoaderStrategy {

    private _options: FileLoaderOptions;

    setOptions(options: any): this {
        this._options = options;
        return this;
    }

    public load(): Observable<SitemapEntry[]> {
        const fileString: string = fs.readFileSync(this._options.filePath, 'utf-8');
        return Observable.of(fileString)
            .map((fileContent: string) => {
                const entries: SitemapEntry[] = fileContent
                    .split('\n')
                    .map(url => url.replace('\n', '').replace('\r', ''))
                    .filter(url => url != undefined && url.length > 0)
                    .map(url => new SitemapEntry(url));
                return entries;
            });
    }

}