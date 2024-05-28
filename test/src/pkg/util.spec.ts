import { findUrl, genMD5Hash, genParams } from '../../../src/common/util';
/**
 * Unit test for {@link findUrl}.
 */
describe('findUrl', () => {
    it('should return empty string when text is empty', () => {
        expect(findUrl('')).toBe('');
    });

    it('should return empty string when text has no url', () => {
        expect(findUrl('hello world')).toBe('');
    });

    it('should return the first url found in the text', () => {
        expect(findUrl('hello https://example.com world')).toBe(
            'https://example.com'
        );
    });

    it('should return the first url found in the text (2)', () => {
        expect(findUrl('hello http://example.com world')).toBe(
            'http://example.com'
        );
    });

    it('should return the first url found in the text (3)', () => {
        expect(findUrl('hello http://example.com/hello world')).toBe(
            'http://example.com/hello'
        );
    });
});

/**
 * Unit test for {@link genMD5Hash}.
 */
describe('genMD5Hash', () => {
    it('should generate a valid MD5 hash', () => {
        expect(genMD5Hash('')).toEqual('d41d8cd98f00b204e9800998ecf8427e');
        expect(genMD5Hash('123')).toEqual('202cb962ac59075b964b07152d234b70');
        expect(genMD5Hash('abcdefghijklmnopqrstuvwxyz')).toEqual(
            'c3fcd3d76192e4007dfb496cca67e13b'
        );
    });
});

/**
 * Unit test for {@link genParams}.
 */
test('genParams should return empty string when no params', () => {
    expect(genParams({})).toBe('');
});

test('genParams should return a=1 when pass {a: 1}', () => {
    expect(genParams({ a: 1 })).toBe('a=1');
});

test('genParams should return a=1&b=2 when pass {a: 1, b: 2}', () => {
    expect(genParams({ a: 1, b: 2 })).toBe('a=1&b=2');
});

test('genParams should return a=1&b=2 when pass {b: 2, a: 1}', () => {
    expect(genParams({ b: 2, a: 1 })).toBe('a=1&b=2');
});

test('genParams should not encode ! char', () => {
    expect(genParams({ a: 'a!b' })).toBe('a=a!b');
});

test('genParams should work with number', () => {
    expect(genParams({ a: 1, b: 2.3 })).toBe('a=1&b=2.3');
});

test('genParams should work with boolean', () => {
    expect(genParams({ a: true, b: false })).toBe('a=true&b=false');
});

