import {TestSuiteConfig} from './test-suite-config';
import {defaultsDeep, indexOf, kebabCase, map, set} from 'lodash';
import * as fs from 'fs';

export class TestSuiteConfigFactory {

    public static fromFile(configFile: string): TestSuiteConfig {
        const testSuiteConfig: TestSuiteConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        return TestSuiteConfigFactory.defaultSettings(testSuiteConfig);
    }

    public static fromCommanderOptions(options: { [option: string]: any }): TestSuiteConfig {
        // 3 dimensions: type/strategy/option (e.g. loader/csv/path)
        const parsedConfig: any = {};

        for (const option in options) {
            if (!options.hasOwnProperty(option)) continue;
            if (undefined === options[option]) continue;

            // parse options
            const value: any = options[option];
            const parts: string[] = kebabCase(option).split('-');
            if (parts.length < 2) {
                throw new Error(`Expected given option to at least define type and strategy, but found: ${option}`);
            }

            // get type
            const type: string = parts[0];
            if (-1 === indexOf(['loader', 'replacer', 'filter', 'reporter'], type.toLowerCase())) {
                throw new Error(`Unknown type: ${type}`);
            }
            // suffix with 's' as the config keys are plural
            const configType: string = `${type}s`;

            const strategy: string = parts[1];

            // turn actual config to object
            const addToConfig: any = {};
            if (parts.length > 2) {
                set(addToConfig, `${configType}.${strategy}.${parts.slice(2).join('.')}`, value);
            } else {
                set(addToConfig, `${configType}.${strategy}`, {});
            }
            defaultsDeep(parsedConfig, addToConfig);
        }

        return TestSuiteConfigFactory.defaultSettings({
            testSuite: 'sireg test suite',
            loaders: map(parsedConfig['loaders'] || [], (options: any, loader: string) => {
                return {
                    loader: loader,
                    options: options,
                };
            }),
            replacers: map(parsedConfig['replacers'] || [], (options: any, replacer: string) => {
                return {
                    replacer: replacer,
                    options: options,
                };
            }),
            reporters: map(parsedConfig['reporters'] || [], (options: any, reporter: string) => {
                return {
                    reporter: reporter,
                    options: options,
                };
            }),
            filters: map(parsedConfig['filters'] || [], (options: any, filter: string) => {
                return {
                    filter: filter,
                    options: options,
                };
            }),
        });
    }

    /**
     * Applies sound defaults to the given config.
     */
    private static defaultSettings(testSuiteConfig: TestSuiteConfig): TestSuiteConfig {
        // define default config structure and default sireg settings
        const configWithDefaults: TestSuiteConfig = defaultsDeep(testSuiteConfig, {
            loaders: [],
            replacers: [],
            filters: [],
            reporters: [],
            settings: {
                concurrentRequests: 3,
                requestTimeout: 3000
            }
        });

        // add console reporter if no reporter is defined
        if (0 === configWithDefaults.reporters.length) {
            configWithDefaults.reporters.push({
                reporter: 'console'
            });
        }

        return configWithDefaults;
    }

}