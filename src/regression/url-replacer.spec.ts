import {UrlReplacer} from './url-replacer';

describe('UrlReplacer', () => {

    let sut: UrlReplacer;

    beforeEach(() => {
        sut = new UrlReplacer();
    });

    test('Remains the same without any replacement rules', () => {
        expect(sut.replace('http://www.example.com')).toEqual('http://www.example.com');
    });
    
    test('Can replace domain to localhost', () => {
        sut.withReplacement('http://www.example.com', 'http://localhost');
        expect(sut.replace('http://www.example.com')).toEqual('http://localhost');
        expect(sut.replace('http://www.example.com/')).toEqual('http://localhost/');
        expect(sut.replace('http://www.example.com/my-path/to-some-page.html')).toEqual('http://localhost/my-path/to-some-page.html');
    });
});