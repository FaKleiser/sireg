import {MockedResponseServer} from './mocked-response-server';
import {RequestResponse} from 'request';
import request = require('request');

describe('MockedResponseServer', () => {

    let server: MockedResponseServer;

    /**
     * Issues a request to the mock server and calls the assertion callback with the {@link RequestResponse} object.
     */
    const rexpect: (url: string, assertion: (response: RequestResponse) => void) => Promise<void>
        = (url: string, assertion: (response: RequestResponse) => void) => {
        return new Promise((resolve: any, reject: any) => {
            request.get(server.url(url), {
                followRedirect: false,
            }, (error: any, response: any, body: any) => {
                expect(error).toBeNull();
                assertion(response);
                resolve();
            });
        });
    };

    beforeAll(async (done) => {
        server = new MockedResponseServer({
            '/foo': 200,
            'bar': 201,
            '/some/nested/path': 418,
            '/take-me-to/foo': 'foo',
            '/take-me-to/bar': '/bar',
        });
        await server.start().toPromise();
        done();
    });

    afterAll((done) => {
        server.stop();
    });

    it('should receive 404 on an undefined URL', async (done) => {
        await Promise.all([
            rexpect('/i-do-not-exist', (r: RequestResponse) => expect(r.statusCode).toBe(404)),
            rexpect('i-do-not-exist', (r: RequestResponse) => expect(r.statusCode).toBe(404)),
            rexpect('i/do/not/exist', (r: RequestResponse) => expect(r.statusCode).toBe(404)),
        ]);
        done();
    });

    it('should receive status code as defined in the mock server config', async (done) => {
        await Promise.all([
            rexpect('/foo', (r: RequestResponse) => expect(r.statusCode).toBe(200)),
            rexpect('foo', (r: RequestResponse) => expect(r.statusCode).toBe(200)),
            rexpect('/bar', (r: RequestResponse) => expect(r.statusCode).toBe(201)),
            rexpect('bar', (r: RequestResponse) => expect(r.statusCode).toBe(201)),
            rexpect('/some/nested/path', (r: RequestResponse) => expect(r.statusCode).toBe(418)),
            rexpect('some/nested/path', (r: RequestResponse) => expect(r.statusCode).toBe(418)),
        ]);
        done();
    });

    it('should return redirects for as defined in the mock server config', async (done) => {
        await Promise.all([
            rexpect('/take-me-to/foo', (r: RequestResponse) => {
                expect(r.statusCode).toBe(301);
                expect(r.headers['location']).toBe('/foo');
            }),
            rexpect('take-me-to/foo', (r: RequestResponse) => {
                expect(r.statusCode).toBe(301);
                expect(r.headers['location']).toBe('/foo');
            }),
        ]);
        done();
    });
});