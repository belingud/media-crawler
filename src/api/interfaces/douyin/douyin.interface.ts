export interface Douyin {}

/**抖音详情接口返回的数据 data.aweme_detail */
export interface AwemeData {
    activity_video_type: number;
    aweme_id: string;
    desc: string;
    duration: number;
    item_title: string;
    caption: string;
    comment_gid: number;
    comment_list: any[] | null;
    anchors: any[] | null;
    aweme_type: number;
    image_list: Images[] | null;
    author: {
        nickname: string;
        uid: string;
        avatar_thumb: {
            height: number;
            url_list: string[];
            uri: string;
            width: number;
        };
        cf_list: any[] | null;
        close_friend_type: number;
        contacts_status: number;
        contrail_list: any[] | null;
        cover_url: [
            {
                height: number;
                uri: string;
                url_list: string[];
                width: number;
            },
        ];
        create_time: number;
        following_count: number;
        follower_count: number;
        favoriting_count: number;
        live_high_value: number;
        is_ad_fake: boolean;
        sec_uid: string;
        short_id: string;
        signature: string;
        signature_extra: string;
    };
    auther_user_id: number;
    music: {
        id: number;
        title: string;
        author: string;
        album: string;
        audition_duration: number;
        play_url: {
            height: number;
            uri: string;
            url_list: string[];
            width: number;
            url_key: string;
        };
    };
    preview_title: string;
    region: string;
    share_url: string;
    statistics: {
        admire_count: number;
        aweme_id: string;
        collect_count: number;
        comment_count: number;
        digg_count: number;
        play_count: number;
        share_count: number;
    };
    video: Video | null;
    xigua_base_info: XiGuaBaseInfo;
}

export interface Images {
    height: number;
    width: number;
    uri: string;
    download_url_list: string[];
    url_list: string[];
}

export interface Video {
    format: string;
    duration: number;
    ratio: number;
    width: number;
    cover: {
        height: number;
        uri: string;
        url_list: string[];
        width: number;
    };
    dynamic_cover: {
        height: number;
        uri: string;
        url_list: string[];
        width: number;
    };
    original_cover: {
        height: number;
        uri: string;
        url_list: string[];
        width: number;
    };
    play_addr: {
        height: number;
        uri: string;
        url_list: string[];
        width: number;
        data_size: number;
        file_hash: string;
        url_key: string;
    };
}

export interface XiGuaBaseInfo {
    item_id: number;
    star_altar_order_id: number;
    star_altar_type: number;
    status: number;
}