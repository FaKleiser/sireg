import {ChangeFreq} from './change-freq.enum';
import {Moment} from 'moment';

export class SitemapEntry {

    constructor(private _url: string, private _lastmod?: Moment, private _changeFreq?: ChangeFreq) {
    }

    get url(): string {
        return this._url;
    }

    get lastmod(): Moment {
        return this._lastmod;
    }

    get changeFreq(): ChangeFreq {
        return this._changeFreq;
    }
}