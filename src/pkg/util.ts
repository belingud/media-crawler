import { sign } from './X-Bogus';
// import { sign } from './tmp-xbogus';
/**
 * Find and return the first URL in the input text.
 *
 * @param {string} text - The text to search for URLs.
 * @return {string} The first URL found in the text.
 */
export function findUrl(text: string): string {
  try {
    const urls = text.match(
      /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/,
    );
    return urls[0];
  } catch (error) {
    console.error(`Find url error: ${error}`);
    throw new Error('Not a valid url');
  }
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

export function genParams(params: object): string {
  return Object.keys(params)
    .map(
      // (key) => `${key}=${encodeURIComponent(params[key]).replace(/!/g, '%21')}`,
      // (key) => `${key}=${params[key].replace(/!/g, '%21')}`,
      (key) => `${key}=${params[key]}`,
    )
    .join('&');
}

/**
 * Get the current timestamp in seconds.
 * @param {string} unit - The unit of the timestamp.
 * @return {number} The current timestamp in seconds.
 */
export function getTimeStamp(unit: string = 'milli'): number {
  switch (unit) {
    case 'milli':
      return new Date().getTime();
    case 'sec':
      return Math.floor(new Date().getTime() / 1000);
    case 'min':
      return Math.floor(new Date().getTime() / 1000 / 60);
  }
}
