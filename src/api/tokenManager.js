"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
exports.getTimeStamp = getTimeStamp;
exports.genMSToken = genMSToken;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
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
class TokenManager {
    static tokenConf = {
        magic: '538969122',
        version: 1,
        dataType: 8,
        strData: '3BvqYbNXLLOcZehvxZVbjpAu7vq82RoWmFSJHLFwzDwJIZevE0AeilQfP55LridxmdGGjknoksqIsLqlMHMif0IFK/Br7JWqxOHnYuMwVCnttFc0Y4MFvdVWM5FECiEulJC0Dc+eeVsNSrFnAc9K7fazqdglyJgGLSfXIJmgyCvvQ4pg0u5HBVVugLSWs242X42fjoWymaUCLZJQo6vi6WLyuV7l5IC3Mg+lelr5xBQD6Q7hBIFEw8zzxJ1n2DyA4xLbOHTQdKvEtsK7XzyWwjpRnojPTbBl69Zosnuru+lOBIl+tFu/+hCQ1m0jYZwTP4rVE75L3Du6+KZ5v/9TyFYjq7y3y9bGLP4d7yQueJbF90G1yrZ6htElrZ2vqZKDrIqBVbmOZr/nph12k2JKrITtN0R/pMsp0sJ4gesQnXxcD/pLOFAINHk7umgbe6LzJ7+TLUdGuO4M7xiEg/jCqhjgJX1izZ4NPoBDp35zRxj6Y6OrcstlTN/cv5sz663+Nco/mEwhGq2VwrL4gAIAPycndIsb48dPdtngmLqNDNN0ZyVRjgqVIDXXrxigXCkR9CH89Dlrrb7QQqWVgRXz9/k5ihEM43BR3sd3mMU/XgFLN1Aoxf6GzzdxP2QPBI75/ZoHoAmu54v8gTmA3ntCGlEF0zgaFGTdpkGdb+oZgyQM4pw1aAyxmFINXkpD3IKKoGev9kD9gTFnhiQMGCMemhZS7ZYdbuGu0Cb+lQKaL/QTt80FMyGmW8kzVy9xW/ja9BcdEJYRoaufuFRkBFG5ay8x4WHLR6hEapXqQial/cREbLL4sQytpjtmnndFqvT7xN5DhgsLY2Z7451MJhD6NJXKNrMafGZSbItzQWY=',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        url: 'https://mssdk-sg.tiktok.com/web/common?msToken=1Ab-7YxR9lUHSem0PraI_XzdKmpHb6j50L8AaXLAd2aWTdoJCYLfX_67rVQFE4UwwHVHmyG_NfIipqrlLT3kCXps-5PYlNAqtdwEg7TrDyTAfCKyBrOLmhMUjB55oW8SPZ4_EkNxNFUdV7MquA==',
    };
    async genRealTimeMSToken() {
        const payload = {
            magic: TokenManager.tokenConf.magic,
            version: TokenManager.tokenConf.version,
            dataType: TokenManager.tokenConf.dataType,
            strData: TokenManager.tokenConf.strData,
            tspFromClient: getTimeStamp(),
        };
        const headers = {
            'User-Agent': TokenManager.tokenConf['User-Agent'],
            'Content-Type': 'application/json',
        };
        return axios_1.default
            .post(TokenManager.tokenConf.url, payload, {
            headers: headers,
            maxRedirects: 5,
        })
            .then((response) => {
            const setCookie = response.headers['set-cookie'].find((c) => c.includes('msToken'));
            const msToken = this.parseMsToken(setCookie);
            if (!msToken || msToken.length !== 148) {
                throw new common_1.HttpException(`msToken content does not meet the requirements`, common_1.HttpStatus.BAD_REQUEST);
            }
            return msToken;
        })
            .catch((error) => {
            console.log(error);
            return this.genFakeMsToken();
        });
    }
    parseMsToken(setCookie) {
        const cookieValue = setCookie
            .split('; ')
            .find((c) => c.includes('msToken'));
        if (cookieValue && cookieValue.substring(0, 8) === 'msToken=') {
            return cookieValue.substring(8);
        }
    }
    genFakeMsToken() {
        return this.genRandomStr(126) + '==';
    }
    genRandomStr(randomLength) {
        const baseStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
        let randomStr = '';
        for (let i = 0; i < randomLength; i++) {
            const randomChoice = baseStr[Math.floor(Math.random() * baseStr.length)];
            randomStr += randomChoice;
        }
        return randomStr;
    }
}
exports.TokenManager = TokenManager;
async function genMSToken() {
    return await new TokenManager().genRealTimeMSToken();
}
//# sourceMappingURL=tokenManager.js.map