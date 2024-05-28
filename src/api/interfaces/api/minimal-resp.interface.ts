export declare interface MinimalResp {
    status: string;
    message: string;
    platform: string;
    type: string;
    desc: string;
    aweme_id: string;
    nickname: string | null;
    wm_video_url: string | null;
    wm_video_url_HQ: string | null;
    nwm_video_url: string | null;
    nwm_video_url_HQ: string | null;
    no_watermark_image_list: Array<string> | null;
    watermark_image_list: Array<string> | null;
}
