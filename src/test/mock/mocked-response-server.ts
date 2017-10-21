import {MockServerConfig} from './mock-server-config';
import {Observable} from 'rxjs/Observable';
import * as http from 'http';

export class MockedResponseServer {

    private server: http.Server;
    private config: MockServerConfig = {};

    constructor(config: MockServerConfig) {
        console.log('Constructing mock server');
        for (let path in config) {
            if (!config.hasOwnProperty(path)) continue;
            this.config[this.normalizeUrlPath(path)] = config[path];
        }
    }

    public start(): Observable<number> {
        return new Observable((observer) => {
            console.log('Starting mock server');
            this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
                const path: string = this.normalizeUrlPath(req.url);
                if (this.config[path]) {
                    const isRedirectLocation: boolean = isNaN(this.config[path] as any);
                    if (isRedirectLocation) {
                        res.writeHead(301, {
                            'Content-Type': 'text/html',
                            'Location': '/' + this.normalizeUrlPath(this.config[path] as string),
                        });
                    } else {
                        res.writeHead(parseInt(this.config[path] as string), {'Content-Type': 'text/html'});
                    }
                } else {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                }
                res.end('');
            });
            this.server.listen(0, () => {
                console.log(`Mock server listening on '${this.url()}'`);
                observer.next();
                observer.complete();
            });
            return () => this.stop;
        });
    }

    public stop(): void {
        this.server.close();
    }

    public get port(): number {
        return this.server.address().port;
    }

    public url(path: string = ''): string {
        const withoutLeadingSlash: string = this.normalizeUrlPath(path);
        const url: string = `http://127.0.0.1:${this.port}/${withoutLeadingSlash}`;
        console.log(`Getting server url: ${url}`);
        return url;
    }

    private normalizeUrlPath(path: string) {
        const withoutLeadingSlash: string = path.replace(/^\/+/, '');
        return withoutLeadingSlash;
    }
}