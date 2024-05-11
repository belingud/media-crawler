import { genMSToken } from './tokenManager';

// export const oldDouyinParams = {
//   device_platform: 'webapp',
//   aid: '6383',
//   channel: 'channel_pc_web',
//   pc_client_type: '1',
//   version_code: '170400',
//   version_name: '17.4.0',
//   cookie_enabled: 'true',
//   screen_width: '1920',
//   screen_height: '1080',
//   browser_language: 'zh-CN',
//   browser_platform: 'Win32',
//   browser_name: 'Edge',
//   browser_version: '117.0.2045.47',
//   browser_online: 'true',
//   engine_name: 'Blink',
//   engine_version: '117.0.0.0',
//   os_name: 'Windows',
//   os_version: '10',
//   cpu_core_num: '12',
//   device_memory: '8',
//   platform: 'PC',
//   downlink: '10',
//   effective_type: '4g',
//   round_trip_time: '100',
//   msToken: encodeURIComponent('Hello From Evil0ctal!')
//     .toString()
//     .replace(/!/g, '%21'),
// };
export const oldDouyinParams = {
    device_platform: 'webapp',
    aid: '6383',
    channel: 'channel_pc_web',
    cookie_enabled: 'true',
    browser_language: 'zh-CN',
    browser_platform: 'Win32',
    browser_name: 'Firefox',
    browser_version: '110.0',
    browser_online: 'true',
    engine_name: 'Gecko',
    os_name: 'Windows',
    os_version: '10',
    engine_version: '109.0',
    platform: 'PC',
    screen_width: '1920',
    screen_height: '1200',
};
export const newDouyinParams = {
    device_platform: 'webapp',
    aid: '6383',
    channel: 'channel_pc_web',
    pc_client_type: '1',
    version_code: '190500',
    version_name: '19.5.0',
    cookie_enabled: 'true',
    screen_width: '1920',
    screen_height: '1080',
    browser_language: 'zh-CN',
    browser_platform: 'Win32',
    browser_name: 'Firefox',
    browser_version: '124.0',
    browser_online: 'true',
    engine_name: 'Gecko',
    engine_version: '122.0.0.0',
    os_name: 'Windows',
    os_version: '10',
    cpu_core_num: '12',
    device_memory: '8',
    platform: 'PC',
};

export const MACDouYinParams = {
    device_platform: 'webapp',
    aid: 6383,
    channel: 'channel_pc_web',
    detail_list: 1,
    source: 6,
    main_billboard_count: 5,
    pc_client_type: 1,
    version_code: '170400',
    version_name: '17.4.0',
    cookie_enabled: true,
    screen_width: 2560,
    screen_height: 1440,
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Safari',
    browser_version: '17.4.1',
    browser_online: true,
    engine_name: 'WebKit',
    engine_version: '605.1.15',
    os_name: 'Mac OS',
    os_version: '10.15.7',
    cpu_core_num: 8,
    device_memory: '',
    platform: 'PC',
    webid: '7361817623237494299',
};

export async function getDouyinDetailParams(
    type: string,
    awemeID: string,
): Promise<object> {
    switch (type) {
    case 'old':
            return Object.assign({ aweme_id: awemeID }, oldDouyinParams);
    case 'new':
            let n = Object.assign({}, newDouyinParams);
        n['msToken'] = await genMSToken();
            return n;
    }
}
