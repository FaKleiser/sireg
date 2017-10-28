import {StaticReplacerStrategy} from './static-replacer.strategy';
import {TestCase} from '../regression/suite/test-case';

describe('StaticReplacerStrategy', () => {

    let sut: StaticReplacerStrategy;

    const π: (url: string) => TestCase = (url: string) => {
        return TestCase.target(url);
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