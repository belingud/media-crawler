import { TSUnit } from './enum';
import { sign } from './X-Bogus';
import * as crypto from 'crypto';
// import { sign } from './tmp-xbogus';
/**
 * Find and return the first URL in the input text.
 *
 * @param {string} text - The text to search for URLs.
 * @return {string} The first URL found in the text.
 */
export function findUrl(text: string): string {
    const urls = text.match(
        /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/
    );
    return urls ? urls[0] : '';
}

/**
 * Generate X-Bogus signed url
 * @param URL url
 * @param object headers Contains User-Agent
 * @returns X-Bogus signed url
 */
export function generateXBogus(queryParams: string, userAgent: string): string {
    return sign(queryParams, userAgent);
}

export function genParams(params: { [key: string]: string | number | boolean }): string {
    return Object.keys(params)
        .map(
            // (key) => `${key}=${encodeURIComponent(params[key]).replace(/!/g, '%21')}`,
            // (key) => `${key}=${params[key].replace(/!/g, '%21')}`,
            (key) => `${key}=${params[key]}`
        )
        .join('&');
}

/**
 * Get the current timestamp in seconds.
 * @param {TSUnit} unit - The unit of the timestamp.
 * @return {number} The current timestamp in seconds.
 */
export function getTimeStamp(unit: TSUnit = TSUnit.milli): number {
    const now = Date.now();
    switch (unit) {
        case TSUnit.milli:
            return now;
        case TSUnit.sec:
            return (now / 1000) | 0;
        case TSUnit.min:
            return (now / 1000 / 60) | 0;
    }
}

/**
 * Generates an MD5 hash for the given string.
 *
 * @param {string} str - The string to generate the hash for.
 * @return {string} The MD5 hash of the input string.
 */
export function genMD5Hash(str: string): string {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}
