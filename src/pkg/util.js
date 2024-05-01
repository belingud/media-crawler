"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUrl = findUrl;
exports.generateXBogus = generateXBogus;
exports.genParams = genParams;
exports.getTimeStamp = getTimeStamp;
const X_Bogus_1 = require("./X-Bogus");
function findUrl(text) {
    try {
        const urls = text.match(/http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/);
        return urls[0];
    }
    catch (error) {
        console.error(`Find url error: ${error}`);
        throw new Error('Not a valid url');
    }
}
function generateXBogus(queryParams, userAgent) {
    return (0, X_Bogus_1.sign)(queryParams, userAgent);
}
function genParams(params) {
    return Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');
}
function getTimeStamp(unit = 'milli') {
    switch (unit) {
        case 'milli':
            return new Date().getTime();
        case 'sec':
            return Math.floor(new Date().getTime() / 1000);
        case 'min':
            return Math.floor(new Date().getTime() / 1000 / 60);
    }
}
//# sourceMappingURL=util.js.map