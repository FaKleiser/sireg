import {TestSuiteConfig} from '../../regression/suite/config/test-suite-config';
import {MockedResponseServer} from '../mock/mocked-response-server';
import {TestSuiteConfigFactory} from '../../regression/suite/config/test-suite-config-factory';
import {TestSuiteFactory} from '../../regression/suite/test-suite-factory';
import {container} from '../../inversify.config';
import {TestSuite} from '../../regression/suite/test-suite';
import {SiregExecutor} from '../../regression/flow/sireg-executor';
import {RegressionResultSet} from '../../regression/result/regression-result-set';
import {Subscription} from 'rxjs/Subscription';
import {StaticReplacerStrategy} from '../../replace/static-replacer.strategy';

describe('simple test case', () => {

    let server: MockedResponseServer;

    beforeAll(async (done) => {
        server = new MockedResponseServer({
            '/foo': 200,
            'bar': 200,
            '/take-me-to/foo': 'foo',
            '/take-me-to/bar': '/bar',
        });
        await server.start().toPromise();
        done();
    });

    afterAll((done) => {
        server.stop();
    });

    it('should correctly report passed and violated urls', async (done) => {
        const config: TestSuiteConfig = TestSuiteConfigFactory.fromFile('src/test/simple-test-suite/simple-test-suite.sireg.json');
        const testFactory: TestSuiteFactory = container.get(TestSuiteFactory);
        const suite: TestSuite = testFactory.factory(config);
        suite.addReplacer(new StaticReplacerStrategy().setOptions({
            'replace': 'http://localhost/',
            'with': server.url('/')
        }));

        let resultSet: RegressionResultSet;
        let subscription: Subscription;
        await new Promise((acc, rej) => {
            subscription = new SiregExecutor()
                .regressionTest(suite)
                .subscribe(
                    (result: RegressionResultSet) => resultSet = result,
                    (err: any) => console.error('An error occured:', err),
                    () => acc()
                );
        });
        subscription.unsubscribe();

        expect(resultSet).toBeInstanceOf(RegressionResultSet);
        expect(resultSet.hasErrors).toBeFalsy();
        expect(resultSet.passed).toHaveLength(4);
        expect(resultSet.violations).toHaveLength(1);

        done();
    });


});