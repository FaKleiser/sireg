import {Observable} from 'rxjs/Observable';
import {TestCase} from '../regression/test-case';

/**
 * Loads a bunch of sitemap entries.
 */
export interface LoaderStrategy {
    setOptions(options: any): this;

    load(): Observable<TestCase[]>;
}