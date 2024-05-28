export declare interface ParsedData {
    status: string;
    message: string;
    type: string;
    platform: string;
    aweme_id: string;
    thread_id?: string | null;
    official_api_url: OfficialApiUrl;
    desc: string;
    create_time: number;
    author?: Author;
    music?: Music;
    statistics?: Statistics;
    cover_data?: CoverData;
    hash_tags?: HashTag[];
    video_data: VideoData;
    image_data?: AwemeImageData;
}

export declare interface VideoData {
    wm_video_url: string;
    wm_video_url_HQ: string;
    nwm_video_url: string;
    nwm_video_url_HQ: string;
}

export declare interface AwemeImageData {
    no_watermark_image_list: string[];
    watermark_image_list: string[];
}

export declare interface HashTag {
    type?: number;
    hashtag_name: string;
}

export declare interface OfficialApiUrl {
    'User-Agent'?: string;
    api_url?: string;
}

interface Author {
    uid?: string;
    short_id?: string;
    nickname?: string;
    screen_name?: string;
    signature?: string;
    avatar_thumb?: Avatar;
    avatar_medium?: Avatar;
    follow_status?: number;
    is_block?: boolean;
    custom_verify?: string;
    unique_id?: string;
    room_id?: number;
    authority_status?: number;
    verify_info?: string;
    share_info?: ShareInfo;
    with_commerce_entry?: boolean;
    verification_type?: number;
    enterprise_verify_reason?: string;
    is_ad_fake?: boolean;
    followers_detail?: any;
    region?: string;
    commerce_user_level?: number;
    platform_sync_info?: any;
    is_discipline_member?: boolean;
    secret?: number;
    prevent_download?: boolean;
    geofencing?: any;
    video_icon?: Avatar;
    follower_status?: number;
    comment_setting?: number;
    duet_setting?: number;
    download_setting?: number;
    cover_url?: Cover[];
    language?: string;
    item_list?: any;
    is_star?: boolean;
    type_label?: any[];
    ad_cover_url?: any;
    comment_filter_status?: number;
    avatar_168x168?: Avatar;
    avatar_300x300?: Avatar;
    relative_users?: any;
    cha_list?: any;
    sec_uid?: string;
    need_points?: any;
    homepage_bottom_toast?: any;
    can_set_geofencing?: any;
    white_cover_url?: any;
    user_tags?: any;
    bold_fields?: any;
    search_highlight?: any;
    mutual_relation_avatars?: any;
    events?: any;
    matched_friend?: MatchedFriend;
    advance_feature_item_order?: any;
    advanced_feature_info?: any;
    user_profile_guide?: any;
    shield_edit_field_info?: any;
    can_message_follow_status_list?: any;
    account_labels?: any;
}

interface Avatar {
    uri?: string;
    url_list?: string[];
    width?: number;
    height?: number;
    url_prefix?: any;
}

interface ShareInfo {
    share_url?: string;
    share_desc?: string;
    share_title?: string;
    share_qrcode_url?: Avatar;
    share_title_myself?: string;
    share_title_other?: string;
    share_desc_info?: string;
    now_invitation_card_image_urls?: any;
}

interface MatchedFriend {
    video_items?: any;
}

interface Music {
    id?: number;
    id_str?: string;
    title?: string;
    author?: string;
    album?: string;
    cover_large?: Avatar;
    cover_medium?: Avatar;
    cover_thumb?: Avatar;
    play_url?: PlayUrl;
    source_platform?: number;
    duration?: number;
    extra?: string;
    user_count?: number;
    position?: any;
    collect_stat?: number;
    status?: number;
    offline_desc?: string;
    owner_id?: string;
    owner_nickname?: string;
    is_original?: boolean;
    mid?: string;
    binded_challenge_id?: number;
    author_deleted?: boolean;
    owner_handle?: string;
    author_position?: any;
    prevent_download?: boolean;
    external_song_info?: any[];
    sec_uid?: string;
    avatar_thumb?: Avatar;
    avatar_medium?: Avatar;
    preview_start_time?: number;
    preview_end_time?: number;
    is_commerce_music?: boolean;
    is_original_sound?: boolean;
    artists?: any;
    lyric_short_position?: any;
    mute_share?: boolean;
    tag_list?: any;
    is_author_artist?: boolean;
    is_pgc?: boolean;
    search_highlight?: any;
    multi_bit_rate_play_info?: any;
    tt_to_dsp_song_infos?: any;
    recommend_status?: number;
    uncert_artists?: any;
}

interface PlayUrl {
    uri?: string;
    url_list?: string[];
    width?: number;
    height?: number;
    url_prefix?: any;
}

interface Statistics {
    aweme_id?: string;
    comment_count?: number;
    digg_count?: number;
    download_count?: number;
    play_count?: number;
    share_count?: number;
    forward_count?: number;
    lose_count?: number;
    lose_comment_count?: number;
    whatsapp_share_count?: number;
    collect_count?: number;
    repost_count?: number;
}

interface CoverData {
    cover?: Cover;
    origin_cover?: Cover;
}

interface Cover {
    uri?: string;
    url_list?: string[];
    width?: number;
    height?: number;
    url_prefix?: any;
}
