import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import {SitemapEntry} from '../model/sitemap-entry.model';

const fs = require('fs');

export class FileLoaderStrategy implements LoaderStrategy {

    private fileName: string;

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    public load(): Observable<SitemapEntry[]> {
        let fileString = fs.readFileSync(this.fileName, 'utf-8');
        return Observable.of(fileString)
            .map((fileContent: string) => {
                const entries = fileContent
                    .split('\n')
                    .map(url => url.replace('\n', '').replace('\r', ''))
                    .filter(url => url != undefined && url.length > 0)
                    .map(url => new SitemapEntry(url));
                return entries;
            });
    }

}