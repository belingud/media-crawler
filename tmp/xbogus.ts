import { Buffer } from 'buffer';
import * as crypto from 'crypto';

export class XBogus {
  private array: Array<number> = [
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
  private charactor =
    'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=';
  private usKey: Uint8Array = new Uint8Array([0x00, 0x01, 0x0c]);
  private userAgent: string;
  params: string;
  xb: string;

  /**
   * Initializes a new instance of the class.
   * @param {string} user_agent - The user agent string.
   * @return {void}
   */
  constructor(user_agent: string = null) {
    this.userAgent =
      user_agent !== null && user_agent !== ''
        ? user_agent
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0';
  }
  sign(urlPath: string): string[] {
    // rc4加密
    const rc4ByteArray = this.rc4Encrypt(
      this.usKey,
      new TextEncoder().encode(this.userAgent),
    );
    const base64EncodedString = Buffer.from(rc4ByteArray).toString('base64');
    const md5String: string = this.md5(base64EncodedString);
    const md5Array1 = this.md5StrToArray(md5String);
    const md5Array2 = this.md5StrToArray(
      this.md5(this.md5StrToArray('d41d8cd98f00b204e9800998ecf8427e')),
    );
    const urlPathArray: number[] = this.md5Encrypt(urlPath);

    let timer: number = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒）
    const ct: number = 536919696; // 常量ct，根据实际情况使用
    let array3: number[] = []; // 创建空数组array3
    let array4: number[] = []; // 创建空数组array4
    let xb_: string = ''; // 初始化xb_为空字符串

    const newArray: number[] = [
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

    let idx: number = 0;

    for (; idx < newArray.length; idx += 2) {
      array3.push(newArray[idx]);

      // 检查索引是否越界
      if (idx + 1 < newArray.length) {
        array4.push(newArray[idx + 1]);
      }
    }

    let mergeArray: number[] = array3.concat(array4);
    const decoder = new TextDecoder('iso-8859-1');
    const encoder = new TextEncoder();
    let tmpRc4 = this.rc4Encrypt(
      encoder.encode('ÿ'),
      encoder.encode(
        this.encodingConversion(
          mergeArray[0],
          mergeArray[1],
          mergeArray[2],
          mergeArray[3],
          mergeArray[4],
          mergeArray[5],
          mergeArray[6],
          mergeArray[7],
          mergeArray[8],
          mergeArray[9],
          mergeArray[10],
          mergeArray[11],
          mergeArray[12],
          mergeArray[13],
          mergeArray[14],
          mergeArray[15],
          mergeArray[16],
          mergeArray[17],
          mergeArray[18],
        ),
      ),
    );
    const garbledCode = this.encodingConversion2(
      2,
      225,
      decoder.decode(tmpRc4),
    );

    let inx: number = 0;
    for (; inx < garbledCode.length; inx += 2) {
      xb_ += this.calculation(
        garbledCode.charCodeAt(inx),
        garbledCode.charCodeAt(inx + 1),
        garbledCode.charCodeAt(inx + 2),
      );
      inx += 3;
    }
    this.params = `${urlPath}&X-Bogus=${xb_}`;
    this.xb = xb_;
    // 返回一个包含params, xb, 和user_agent的数组
    return [this.params, this.xb, this.userAgent];
  }

  /**
   * 使用RC4算法对数据进行加密。
   * Encrypt data using the RC4 algorithm.
   * @param (Uint8Array) key - The encryption key.
   * @param (Uint8Array) data - The data to be encrypted.
   * @returns The encrypted data.
   */
  private rc4Encrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
    let S = new Uint8Array(256);
    let j = 0;
    let encryptedData = new Uint8Array(data.length);

    // init S box
    for (let i = 0; i < 256; i++) {
      S[i] = i;
    }

    // KSA (Key Scheduling Algorithm)
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + key[i % key.length]) % 256;
      [S[i], S[j]] = [S[j], S[i]];
    }

    // PRGA (Pseudo-Random Generation Algorithm)
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

  private md5(inputData: string | number[]): string {
    let dataToHash: string | Buffer;

    if (typeof inputData === 'string') {
      // 如果输入是字符串，则直接使用
      dataToHash = inputData;
    } else if (Array.isArray(inputData)) {
      // 如果输入是数字数组，将其转换为Buffer
      dataToHash = Buffer.from(inputData);
    } else {
      throw new Error(
        'Invalid input type. Expected string or array of numbers.',
      );
    }

    // 使用crypto模块生成MD5哈希值
    const hash = crypto.createHash('md5').update(dataToHash).digest('hex');

    return hash;
  }

  /**
   * Converts an MD5 hash string to an array of numbers.
   *
   * @param {string} md5Str - The MD5 hash string to convert.
   * @return {number[]} An array of numbers representing the MD5 hash string.
   */
  private md5StrToArray(md5Str: string): number[] {
    if (md5Str.length > 32) {
      // 直接将字符串的每个字符转换为它的Unicode编码
      return Array.from(md5Str).map((char) => char.charCodeAt(0));
    } else {
      // 处理MD5哈希字符串，转换为整数数组
      const array: number[] = [];
      let idx = 0;
      while (idx < md5Str.length) {
        // 使用Array查找表来转换每两个十六进制字符
        const num =
          (this.array[md5Str.charCodeAt(idx)] << 4) |
          this.array[md5Str.charCodeAt(idx + 1)];
        array.push(num);
        idx += 2;
      }
      return array;
    }
  }

  /**
   * Encrypts the given URL path using the MD5 algorithm.
   *
   * @param {string} urlPath - The URL path to be encrypted.
   * @return {number[]} An array of numbers representing the encrypted URL path.
   */
  private md5Encrypt(urlPath: string): number[] {
    return this.md5StrToArray(this.md5(this.md5StrToArray(this.md5(urlPath))));
  }

  public encodingConversion(
    a: number,
    b: number,
    c: number,
    e: number,
    d: number,
    t: number,
    f: number,
    r: number,
    n: number,
    o: number,
    i: number,
    _: number,
    x: number,
    u: number,
    s: number,
    l: number,
    v: number,
    h: number,
    p: number,
  ): string {
    const y: number[] = [a];
    y.push(Math.floor(i)); // 确保i是整数
    y.push(b, _, c, x, e, u, d, s, t, l, f, v, r, h, n, p);

    // 使用Buffer来处理字节数据，然后使用TextDecoder进行解码
    const buffer = Buffer.from(y);
    const decoder = new TextDecoder('iso-8859-1');
    const re = decoder.decode(buffer);

    return re;
  }

  private encodingConversion2(a: number, b: number, c: string): string {
    // 直接使用 String.fromCharCode 来根据字符的 Unicode 编码得到字符
    return String.fromCharCode(a) + String.fromCharCode(b) + c;
  }

  /**
   * Perform a calculation based on input numbers and return a string result.
   *
   * @param {number} a1 - The first input number.
   * @param {number} a2 - The second input number.
   * @param {number} a3 - The third input number.
   * @return {string} The calculated result as a string.
   */
  private calculation(a1: number, a2: number, a3: number): string {
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

const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
const url_path =
  'https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp&aid=6383&channel=channel_pc_web&sec_user_id=MS4wLjABAAAAW9FWcqS7RdQAWPd2AA5fL_ilmqsIFUCQ_Iym6Yh9_cUa6ZRqVLjVQSUjlHrfXY1Y&max_cursor=0&locate_query=false&show_live_replay_strategy=1&need_time_list=1&time_list_query=0&whale_cut_token=&cut_version=1&count=18&publish_video_strategy_type=2&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=122.0.0.0&browser_online=true&engine_name=Blink&engine_version=122.0.0.0&os_name=Windows&os_version=10&cpu_core_num=12&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7335414539335222835&msToken=p9Y7fUBuq9DKvAuN27Peml6JbaMqG2ZcXfFiyDv1jcHrCN00uidYqUgSuLsKl1onC-E_n82m-aKKYE0QGEmxIWZx9iueQ6WLbvzPfqnMk4GBAlQIHcDzxb38FLXXQxAm';

const xbs = new XBogus(ua).sign(url_path);
// console.log(`url: ${xbs[0]}\n xbogus: ${xbs[1]}\n ua: ${xbs[2]}`);
console.log(`xbogus: ${xbs[1]}`);
