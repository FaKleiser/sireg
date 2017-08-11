/* tslint:disable:typedef */
const Symbols = {
    LoaderStrategyFactory: Symbol('Factory<LoaderStrategy>'),
    LoaderStrategy: Symbol('LoaderStrategy'),

    UrlReplacerStrategyFactory: Symbol('Factory<UrlReplacerStrategy>'),
    UrlReplacerStrategy: Symbol('UrlReplacerStrategy'),

    ReporterStrategyFactory: Symbol('Factory<ReporterStrategy>'),
    ReporterStrategy: Symbol('ReporterStrategy'),

    Sitemapper: Symbol('Sitemapper'),
};

export default Symbols;