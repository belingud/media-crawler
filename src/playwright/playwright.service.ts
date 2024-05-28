import { Injectable } from '@nestjs/common';
import * as playwright from 'playwright';
import { getLogger } from 'src/logger';
import { GeoCodeEnum } from './playwright.enum';

const logger = getLogger('playwright');

@Injectable()
export class PlaywrightService {
    private browser: playwright.Browser;
    private area: string = 'HK';

    private readonly GeoMap: Record<string, playwright.Geolocation> = {
        [GeoCodeEnum.Singapore]: { latitude: 1.3521, longitude: 103.8198 },
    };

    async getBrowser(): Promise<playwright.Browser> {
        if (!this.browser) {
            this.browser = await this.createBrowser();
        }
        return this.browser;
    }

    async createBrowser(): Promise<playwright.Browser> {
        return await playwright.chromium.launch({
            channel: 'msedge',
            headless: true,
            args: ['--disable-blink-features=AutomationControlled'],
        });
    }

    async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async getContent(options: {
        url: string;
        proxy?: string;
        geolocation?: string;
    }): Promise<string> {
        const browser = await this.getBrowser();
        let context: playwright.BrowserContext | null = null;
        let page: playwright.Page | null = null;

        try {
            context = await browser.newContext(
                this.getContextOptions({
                    proxy: options.proxy,
                    geolocation: options.geolocation,
                })
            );
            page = await context.newPage();
            await page.goto(options.url, { waitUntil: 'networkidle' });
            return await page.content();
        } catch (error) {
            logger.error('Failed to get content:', error);
            throw error;
        } finally {
            if (page) {
                await page.close();
            }
            if (context) {
                await context.close();
            }
        }
    }

    private getContextOptions(options?: {
        proxy?: string;
        geolocation?: string;
    }): playwright.BrowserContextOptions {
        const contextOptions: playwright.BrowserContextOptions = {};
        if (options?.proxy) {
            contextOptions.proxy = { server: options.proxy };
        }
        if (options?.geolocation) {
            contextOptions.geolocation =
                this.GeoMap[options.geolocation] || null;
            contextOptions.permissions = ['geolocation'];
        }
        return contextOptions;
    }

    // Ensure the browser is closed when the module is destroyed
    async onModuleDestroy(): Promise<void> {
        await this.closeBrowser();
    }
}

// 使用示例
export async function gotoxcom() {
    const browser = await playwright.chromium.launch({
        channel: 'msedge',
        headless: true,
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
        extraHTTPHeaders: {
            'sec-ch-ua': '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        },
        ...playwright.devices['Desktop Edge'],
        proxy: { server: 'http://127.0.0.1:7890' },
        geolocation: { latitude: 1.3521, longitude: 103.8198 },
        javaScriptEnabled: true,
    });

    const page = await context.newPage();
    console.log('start to goto x.com');
    page.on('console', message => console.log(message.text()));
    page.on('request', request => console.log(request.method(), request.url(), request.headers()));
    await page.goto(
        'https://x.com/cooltechtipz/status/1794678910065717563?t=EUfvkW8koOkFh8p_hqrkgw&s=19'
    );
    await page.waitForLoadState('networkidle'); // 确保页面完全加载
    const content = await page.content();
    // 使用 CSS 选择器查找 <video> 标签中的 <source> 标签
    const sourceUrls = await page.$$eval('//video/source', (sources) =>
        sources.map((source) => (source as HTMLSourceElement).src)
    );

    console.log(sourceUrls);

    await page.close();
    await context.close();
    await browser.close();
    // await playwrightService.closeBrowser();
}
