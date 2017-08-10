import {StaticReplacerStrategy} from './static-replacer.strategy';
import {SiteUrl} from '../model/site-url.model';

describe('StaticReplacerStrategy', () => {

    let sut: StaticReplacerStrategy;

    const π: (url: string) => SiteUrl = (url: string) => {
        return new SiteUrl(url);
    };

    beforeEach(() => {
        sut = new StaticReplacerStrategy();
    });

    test('Fails without options', () => {
        expect(() => sut.replace(π('http://www.example.com'))).toThrow();
    });

    test('Can replace domain to localhost', () => {
        sut.setOptions({
            'replace': 'http://www.example.com',
            'with': 'http://localhost'
        });
        expect(sut.replace(π('http://www.example.com'))).toEqual(π('http://localhost'));
        expect(sut.replace(π('http://www.example.com/'))).toEqual(π('http://localhost/'));
        expect(sut.replace(π('http://www.example.com/my-path/to-some-page.html'))).toEqual(π('http://localhost/my-path/to-some-page.html'));
    });
});