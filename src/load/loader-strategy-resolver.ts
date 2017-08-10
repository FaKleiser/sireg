import {LoaderStrategy} from './loader-strategy.interface';

export interface LoaderStrategyResolver {

    /**
     * Returns a loader factory for the given loader.
     */
    (loader: string): (options: any) => LoaderStrategy;
}