import 'reflect-metadata';
import {LoaderStrategy} from './load/loader-strategy.interface';
import {FileLoaderStrategy} from './load/file-loader.strategy';
import {SitemapLoaderStrategy} from './load/sitemap-loader.strategy';
import {Container, interfaces} from 'inversify';
import {SitemapRegressionTestFactory} from './regression/sitemap-regression-test-factory';
import Symbols from './inversify.symbols';
import {UrlReplacerStrategy} from './replace/url-replacer-strategy.interface';

const container: Container = new Container();

// == REGRESSION

container.bind<SitemapRegressionTestFactory>(SitemapRegressionTestFactory).to(SitemapRegressionTestFactory);

// == LOADER

container.bind<LoaderStrategy>(Symbols.LoaderStrategy).to(FileLoaderStrategy).whenTargetNamed('file');
container.bind<LoaderStrategy>(Symbols.LoaderStrategy).to(SitemapLoaderStrategy).whenTargetNamed('sitemap');

// used to resolve the actual loader strategies by name
container.bind<interfaces.Factory<LoaderStrategy>>(Symbols.LoaderStrategyFactory).toFactory<LoaderStrategy>((context) => {
    return (loaderName: string) => (options: any) => {
        const loader: LoaderStrategy = context.container.getNamed<LoaderStrategy>(Symbols.LoaderStrategy, loaderName);
        loader.setOptions(options);
        return loader;
    };
});


// == REPLACER

// used to resolve the actual loader strategies by name
container.bind<interfaces.Factory<UrlReplacerStrategy>>(Symbols.UrlReplacerStrategyFactory).toFactory<UrlReplacerStrategy>((context) => {
    return (replacerName: string) => (options: any) => {
        const loader: UrlReplacerStrategy = context.container.getNamed<UrlReplacerStrategy>(Symbols.UrlReplacerStrategy, replacerName);
        loader.setOptions(options);
        return loader;
    };
});


// == EXTERNAL
const Sitemapper: any = require('sitemapper');
container.bind(Symbols.Sitemapper).toConstantValue(new Sitemapper());

export {container};