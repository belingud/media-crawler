import {
    Inject,
    Injectable,
    Logger,
    UnsupportedMediaTypeException,
} from '@nestjs/common';
import { BaseCrawler } from './base.crawler';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CookieType, XOpenAPI } from './x.openapi';
import { ConfigService } from '@nestjs/config';
import { CONFIGURATION_SERVICE_TOKEN } from '@nestjs/config/dist/config.constants';
import * as i from 'twitter-openapi-typescript-generated';
import {
    TweetApiUtilsData,
    TwitterApiUtilsResponse,
} from './twitter-openapi-typescript/src';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Cache } from 'cache-manager';
import { ParsedData } from 'src/api/interfaces/api/parsed.interface';
import { Platform } from 'src/common/enum';
import { datetimeStr2TS } from 'src/common/util';
import { UserAgent } from 'src/api.config';

const logger: Logger = new Logger('TikTokCrawler');

@Injectable()
export class XCrawler extends BaseCrawler {
    // xOpenAPI: XOpenAPI;
    constructor(
        protected readonly http: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        @Inject(CONFIGURATION_SERVICE_TOKEN)
        protected readonly config: ConfigService,
        protected readonly xOpenAPI: XOpenAPI
    ) {
        super(http);
        this.xOpenAPI.setInitOverrides({
            agent: new HttpsProxyAgent(config.get<string>('PROXY_STRING')),
        });
    }
    #detailUrl: string =
        'https://api.x.com/graphql/I9GDzyCGZL2wSoYFFrrTVw/TweetResultByRestId';

    /**
     * 推文详情的接口 detailUrl使用参数
     * @param awemeID 推文id
     * @returns
     */
    getPostDetailParams(awemeID: string): object {
        return {
            variables: `{"variables":{"tweetId":"${awemeID}","withCommunity":false,"includePromotedContent":false,"withVoice":false}}`,
            features:
                '{"creator_subscriptions_tweet_preview_api_enabled":true,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false}',
            fieldToggles:
                '{"withArticleRichContentState":true,"withArticlePlainText":false,"withGrokAnalyze":false}',
        };
    }

    /**
     * 正则匹配url中的推文id
     */
    async getAwemeID(text: string): Promise<string> {
        const match = text.match(/status\/(?<id>\d+)/);
        if (!match) {
            return null;
        }
        return match.groups.id;
    }

    /**
     * 获取访客模式cookies，设置缓存1天
     * @returns
     */
    async getGuestCookie(): Promise<CookieType> {
        let value: string = await this.cache.get('X-Cookie');
        if (value) {
            return JSON.parse(value);
        }
        let cookie: CookieType = {};
        try {
            cookie = await this.xOpenAPI.getGustCookieByAPI();
        } catch (error) {
            logger.error(
                `Fetch ${XOpenAPI.twitter} guest cookie error: ${error}`
            );
            return cookie;
        }
        value = JSON.stringify(cookie);
        this.cache.set('X-Cookie', value, 10 * 60 * 1000); // 10 minutes
        return cookie;
    }

    async getAwemeData(awemeID: string, url: string): Promise<i.Tweet> {
        const client = await this.xOpenAPI.getClientFromCookies(
            await this.getGuestCookie()
        );
        // const tweetAPI = client.getTweetApi();
        const tweetAPI = client.getDefaultApi();
        const response: TwitterApiUtilsResponse<TweetApiUtilsData | undefined> =
            await tweetAPI.getTweetResultByRestId({
                tweetId: awemeID,
            });
        return response.data.tweet;
    }

    formatData(awemeData: i.Tweet): object | PromiseLike<ParsedData> {
        if (!awemeData) {
            return awemeData;
        }
        if (
            !awemeData.legacy ||
            !awemeData.legacy.entities ||
            !awemeData.legacy.entities.media
        ) {
            throw new UnsupportedMediaTypeException(
                'This Tweet not contain a video or image'
            );
        }
        // TODO: 多个media的情况，同时有image和video的情况
        const firstMediaType = awemeData.legacy.entities.media[0].type;
        const legacy: i.TweetLegacy = awemeData.legacy;
        const firstMedia: i.Media = awemeData.legacy.entities.media[0];
        const mediaUrl: string = firstMedia.videoInfo.variants.at(-1).url;
        const user: i.User = awemeData.core.userResults.result as i.User;
        const data: ParsedData = {
            status: 'success',
            message: '',
            type: firstMediaType,
            platform: Platform.x,
            aweme_id: firstMedia.idStr,
            thread_id: legacy.idStr,
            desc: legacy.fullText,
            create_time: datetimeStr2TS(legacy.createdAt),
            official_api_url: {
                'User-Agent': UserAgent,
                api_url: firstMedia.url,
            },
            video_data: {
                wm_video_url: mediaUrl,
                wm_video_url_HQ: mediaUrl,
                nwm_video_url: mediaUrl,
                nwm_video_url_HQ: mediaUrl,
            },
            image_data: null,
            author: {
                screen_name: user.legacy.screenName,
                uid: user.id,
                nickname: user.legacy.name,
            },
            statistics: {
                comment_count: legacy.replyCount,
                digg_count: legacy.favoriteCount,
                share_count: legacy.retweetCount,
                play_count: Number(awemeData.views?.count || 0),
            },
            cover_data: {
                cover: {
                    url_list: [firstMedia.mediaUrlHttps],
                    width: firstMedia.originalInfo.width,
                    height: firstMedia.originalInfo.height,
                },
                origin_cover: {
                    url_list: [firstMedia.mediaUrlHttps],
                    width: firstMedia.originalInfo.width,
                    height: firstMedia.originalInfo.height,
                },
            },
            music: null,
        };
        return data;
    }
}
