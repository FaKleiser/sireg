import {LoaderStrategy} from './loader-strategy.interface';
import {Observable} from 'rxjs/Observable';
import * as fs from 'fs';
import {injectable} from 'inversify';
import {SiteUrl} from '../model/site-url.model';

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

    public load(): Observable<SiteUrl[]> {
        const fileString: string = fs.readFileSync(this._options.filePath, 'utf-8');
        return Observable.of(fileString)
            .map((fileContent: string) => {
                const entries: SiteUrl[] = fileContent
                    .split('\n')
                    .map(url => url.replace('\n', '').replace('\r', ''))
                    .filter(url => url != undefined && url.length > 0)
                    .map(url => new SiteUrl(url));
                return entries;
            });
    }

}