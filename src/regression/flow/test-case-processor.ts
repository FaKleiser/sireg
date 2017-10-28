import {Observable} from 'rxjs/Observable';
import {TestCase} from '../suite/test-case';
import {HttpResponseStack} from '../stack/http-response-stack';
import * as winston from 'winston';
import {HttpStackBuilder} from '../stack/http-stack-builder';
import {TestSuite} from '../suite/test-suite';
import * as request from 'request';
import {Request, RequestResponse} from 'request';
import {AbstractHttpStack} from '../stack/abstract-http-stack';
import {get} from 'lodash';
import http = require('http');

/**
 * Executes the HTTP requests of a test case and returns a {@link HttpResponseStack} for evaluation.
 */
export class TestCaseProcessor {

    private static DEFAULT_TEST_CASE_REQUEST_TIMEOUT_MS: number = 5000;

    constructor(private suite: TestSuite) {
    }

    public process(testCase: TestCase): Observable<AbstractHttpStack> {
        return new Observable(observer => {
            winston.debug(`About to check ${testCase.targetUrl}`);
            const builder: HttpStackBuilder = new HttpStackBuilder(testCase);
            const req: Request = request(testCase.targetUrl, {
                timeout: get(this.suite.config, 'settings.requestTimeout', TestCaseProcessor.DEFAULT_TEST_CASE_REQUEST_TIMEOUT_MS),
                followRedirect: (response: http.IncomingMessage): boolean => {
                    if (response.statusCode >= 300 && response.statusCode <= 308) {
                        builder.pushRedirectResponse(response);
                        return true;
                    }
                    return false;
                }
            }, (error: any, response: RequestResponse, body: any) => {
                if (error) {
                    builder.withError(error);
                } else {
                    builder.withResponse(response);
                }
                observer.next(builder.build());
                observer.complete();
            });
            return () => req.abort();
        });
    }
}