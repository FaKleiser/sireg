export interface TestSuiteConfig {
    /** The title of the test case */
    testCase: string;
    /** sireg settings */
    settings?: {
        /** maximum number of http requests to run in parallel */
        concurrentRequests: number;
        /** number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request */
        requestTimeout: number;
    };
    /** The loaders to load URLs from */
    loaders: { 'loader': string, 'options'?: any }[];
    /** The filter configuration */
    filters?: { 'filter': string, 'options'?: any }[];
    /** The replacements to perform on the url before issuing the HTTP request */
    replacers?: { 'replacer': string, 'options'?: any }[];
    /** The reporters used to report the regression test results */
    reporters?: { 'reporter': string, 'options'?: any }[];
}