import {LoaderStrategy} from '../load/loader-strategy.interface';
import {FilterStrategy} from '../filter/filter-strategy.interface';
import {UrlReplacerStrategy} from '../replace/url-replacer-strategy.interface';
import {TestCaseConfig} from './config/test-case-config';
import {ReporterStrategy} from '../reporter/reporter-strategy.interface';

/**
 * Represents a  complete test suite created from a {@link TestCaseConfig} that is ready to be executed.
 */
export class TestSuite {

    private _loaders: LoaderStrategy[] = [];
    private _filters: FilterStrategy[] = [];
    private _replacers: UrlReplacerStrategy[] = [];
    private _reporters: ReporterStrategy[] = [];

    private readonly DEFAULT_CONCURRENT_REQUESTS: number = 3;
    private readonly DEFAULT_REQUEST_TIMEOUT: number = 1500;

    constructor(private _config: TestCaseConfig) {
    }

    public addLoader(loader: LoaderStrategy): this {
        this._loaders.push(loader);
        return this;
    }

    public addFilter(filter: FilterStrategy): this {
        this._filters.push(filter);
        return this;
    }

    public addReplacer(replacer: UrlReplacerStrategy): this {
        this._replacers.push(replacer);
        return this;
    }

    public addReporter(reporter: ReporterStrategy): this {
        this._reporters.push(reporter);
        return this;
    }

    get config(): TestCaseConfig {
        return this._config;
    }

    get loaders(): LoaderStrategy[] {
        return this._loaders;
    }

    get filters(): FilterStrategy[] {
        return this._filters;
    }

    get replacers(): UrlReplacerStrategy[] {
        return this._replacers;
    }

    get reporters(): ReporterStrategy[] {
        return this._reporters;
    }
}