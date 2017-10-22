import {TestSuiteConfig} from './test-suite-config';
import {defaultsDeep} from 'lodash';
import * as fs from 'fs';

export class TestSuiteConfigFactory {

    public static fromFile(configFile: string): TestSuiteConfig {
        return defaultsDeep(JSON.parse(fs.readFileSync(configFile, 'utf8')), {
            settings: {
                concurrentRequests: 3,
                requestTimeout: 3000
            }
        });
    }

}