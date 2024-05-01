"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XBogus = void 0;
const buffer_1 = require("buffer");
const crypto = require("crypto");
class XBogus {
    array = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        10,
        11,
        12,
        13,
        14,
        15,
    ];
    charactor = 'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=';
    usKey = new Uint8Array([0x00, 0x01, 0x0c]);
    userAgent;
    params;
    xb;
    constructor(user_agent = null) {
        this.userAgent =
            user_agent !== null && user_agent !== ''
                ? user_agent
                : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0';
    }
    sign(urlPath) {
        const rc4ByteArray = this.rc4Encrypt(this.usKey, new TextEncoder().encode(this.userAgent));
        const base64EncodedString = buffer_1.Buffer.from(rc4ByteArray).toString('base64');
        const md5String = this.md5(base64EncodedString);
        const md5Array1 = this.md5StrToArray(md5String);
        const md5Array2 = this.md5StrToArray(this.md5(this.md5StrToArray('d41d8cd98f00b204e9800998ecf8427e')));
        const urlPathArray = this.md5Encrypt(urlPath);
        let timer = Math.floor(Date.now() / 1000);
        const ct = 536919696;
        let array3 = [];
        let array4 = [];
        let xb_ = '';
        const newArray = [
            64,
            0.00390625,
            1,
            12,
            urlPathArray[14],
            urlPathArray[15],
            md5Array2[14],
            md5Array2[15],
            md5Array1[14],
            md5Array1[15],
            (timer >> 24) & 255,
            (timer >> 16) & 255,
            (timer >> 8) & 255,
            timer & 255,
            (ct >> 24) & 255,
            (ct >> 16) & 255,
            (ct >> 8) & 255,
            ct & 255,
        ];
        let xorResult = newArray[0];
        for (let i = 1; i < newArray.length; i++) {
            let b = newArray[i];
            if (typeof b === 'string') {
                b = parseInt(b, 10);
            }
            xorResult ^= b;
        }
        newArray.push(xorResult);
        let idx = 0;
        for (; idx < newArray.length; idx += 2) {
            array3.push(newArray[idx]);
            if (idx + 1 < newArray.length) {
                array4.push(newArray[idx + 1]);
            }
        }
        let mergeArray = array3.concat(array4);
        const decoder = new TextDecoder('iso-8859-1');
        const encoder = new TextEncoder();
        let tmpRc4 = this.rc4Encrypt(encoder.encode('ÿ'), encoder.encode(this.encodingConversion(mergeArray[0], mergeArray[1], mergeArray[2], mergeArray[3], mergeArray[4], mergeArray[5], mergeArray[6], mergeArray[7], mergeArray[8], mergeArray[9], mergeArray[10], mergeArray[11], mergeArray[12], mergeArray[13], mergeArray[14], mergeArray[15], mergeArray[16], mergeArray[17], mergeArray[18])));
        const garbledCode = this.encodingConversion2(2, 225, decoder.decode(tmpRc4));
        let inx = 0;
        for (; inx < garbledCode.length; inx += 2) {
            xb_ += this.calculation(garbledCode.charCodeAt(inx), garbledCode.charCodeAt(inx + 1), garbledCode.charCodeAt(inx + 2));
            inx += 3;
        }
        this.params = `${urlPath}&X-Bogus=${xb_}`;
        this.xb = xb_;
        return [this.params, this.xb, this.userAgent];
    }
    rc4Encrypt(key, data) {
        let S = new Uint8Array(256);
        let j = 0;
        let encryptedData = new Uint8Array(data.length);
        for (let i = 0; i < 256; i++) {
            S[i] = i;
        }
        for (let i = 0; i < 256; i++) {
            j = (j + S[i] + key[i % key.length]) % 256;
            [S[i], S[j]] = [S[j], S[i]];
        }
        let i = (j = 0);
        for (let n = 0; n < data.length; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            [S[i], S[j]] = [S[j], S[i]];
            const K = S[(S[i] + S[j]) % 256];
            encryptedData[n] = data[n] ^ K;
        }
        return encryptedData;
    }
    md5(inputData) {
        let dataToHash;
        if (typeof inputData === 'string') {
            dataToHash = inputData;
        }
        else if (Array.isArray(inputData)) {
            dataToHash = buffer_1.Buffer.from(inputData);
        }
        else {
            throw new Error('Invalid input type. Expected string or array of numbers.');
        }
        const hash = crypto.createHash('md5').update(dataToHash).digest('hex');
        return hash;
    }
    md5StrToArray(md5Str) {
        if (md5Str.length > 32) {
            return Array.from(md5Str).map((char) => char.charCodeAt(0));
        }
        else {
            const array = [];
            let idx = 0;
            while (idx < md5Str.length) {
                const num = (this.array[md5Str.charCodeAt(idx)] << 4) |
                    this.array[md5Str.charCodeAt(idx + 1)];
                array.push(num);
                idx += 2;
            }
            return array;
        }
    }
    md5Encrypt(urlPath) {
        return this.md5StrToArray(this.md5(this.md5StrToArray(this.md5(urlPath))));
    }
    encodingConversion(a, b, c, e, d, t, f, r, n, o, i, _, x, u, s, l, v, h, p) {
        const y = [a];
        y.push(Math.floor(i));
        y.push(b, _, c, x, e, u, d, s, t, l, f, v, r, h, n, p);
        const buffer = buffer_1.Buffer.from(y);
        const decoder = new TextDecoder('iso-8859-1');
        const re = decoder.decode(buffer);
        return re;
    }
    encodingConversion2(a, b, c) {
        return String.fromCharCode(a) + String.fromCharCode(b) + c;
    }
    calculation(a1, a2, a3) {
        let x1 = (a1 & 255) << 16;
        let x2 = (a2 & 255) << 8;
        let x3 = x1 | x2 | a3;
        let result = '';
        result += this.charactor[(x3 & 16515072) >> 18];
        result += this.charactor[(x3 & 258048) >> 12];
        result += this.charactor[(x3 & 4032) >> 6];
        result += this.charactor[x3 & 63];
        return result;
    }
}
exports.XBogus = XBogus;
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
const url_path = 'https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp&aid=6383&channel=channel_pc_web&sec_user_id=MS4wLjABAAAAW9FWcqS7RdQAWPd2AA5fL_ilmqsIFUCQ_Iym6Yh9_cUa6ZRqVLjVQSUjlHrfXY1Y&max_cursor=0&locate_query=false&show_live_replay_strategy=1&need_time_list=1&time_list_query=0&whale_cut_token=&cut_version=1&count=18&publish_video_strategy_type=2&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=122.0.0.0&browser_online=true&engine_name=Blink&engine_version=122.0.0.0&os_name=Windows&os_version=10&cpu_core_num=12&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7335414539335222835&msToken=p9Y7fUBuq9DKvAuN27Peml6JbaMqG2ZcXfFiyDv1jcHrCN00uidYqUgSuLsKl1onC-E_n82m-aKKYE0QGEmxIWZx9iueQ6WLbvzPfqnMk4GBAlQIHcDzxb38FLXXQxAm';
const xbs = new XBogus(ua).sign(url_path);
console.log(`xbogus: ${xbs[1]}`);
//# sourceMappingURL=xbogus.js.map