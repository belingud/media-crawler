import { Injectable } from '@nestjs/common';
import * as playwright from 'playwright';
import { getLogger } from 'src/logger';
import { GeoCodeEnum } from './playwright.enum';

const logger = getLogger('playwright');

@Injectable()
export class PlaywrightService {
    private browser: playwright.Browser;
    private area: string = 'HK';
    private userDataDir: string = './user-data';

    private readonly GeoMap: Record<string, playwright.Geolocation> = {
        [GeoCodeEnum.Singapore]: { latitude: 1.3521, longitude: 103.8198 },
    };

    async getBrowser(headless: boolean = true): Promise<playwright.Browser> {
        if (!this.browser) {
            this.browser = await this.createBrowser(headless);
        }
        return this.browser;
    }

    /**
     * Get the Chromium context with the specified options.
     *
     * @param {object} options - The options for configuring the Chromium context.
     * @param {boolean} options.headless - Whether the browser should be launched in headless mode.
     * @param {string} options.channel - The browser channel to use.
     * @return {Promise<playwright.BrowserContext>} A Promise that resolves to the Chromium browser context.
     */
    async getPersistentChromiumContext(options?: {
        headless?: boolean;
        channel?: string;
        geolocation?: { latitude: number; longitude: number };
        proxy?: string;
    }): Promise<playwright.BrowserContext> {
        return await playwright.chromium.launchPersistentContext(
            './user-data',
            {
                channel: options ? options.channel : 'msedge',
                headless: options ? options.headless : true,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=IsolateOrigins,site-per-process',
                ],
                extraHTTPHeaders: {
                    'sec-ch-ua':
                        '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Referer: 'https://www.douyin.com/',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                },
                geolocation:
                    options && options.geolocation ? options.geolocation : null,
                proxy:
                    options && options.proxy ? { server: options.proxy } : null,
                // ...playwright.devices['Desktop Edge'],
            }
        );
    }

    async createBrowser(headless: boolean = true): Promise<playwright.Browser> {
        return await playwright.chromium.launch({
            channel: 'msedge',
            headless: headless,
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
        headless: boolean;
        url: string;
        proxy?: string;
        geolocation?: string;
    }): Promise<string> {
        // const browser = await this.getBrowser();
        let context: playwright.BrowserContext | null = null;
        let page: playwright.Page | null = null;

        try {
            context = await this.getPersistentChromiumContext({
                headless: options ? options.headless : true,
                channel: 'msedge',
                geolocation: options.geolocation
                    ? this.GeoMap[options.geolocation]
                    : null,
                proxy: options.proxy ? options.proxy : null,
            });
            page = await context.newPage();
            await page.goto(options.url, { waitUntil: 'networkidle' });
            const cookies = await context.cookies();
            logger.debug(`Cookies: ${cookies}`);
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

    async mockMouseMove(page: playwright.Page) {
        // 添加延迟和模拟用户行为
        await page.waitForTimeout(5000); // 等待5秒
        await page.mouse.move(100, 100);
        await page.waitForTimeout(2000); // 再次等待2秒
        await page.mouse.move(200, 200);
        // 在页面中执行滚动操作
        await page.evaluate(() => window.scrollBy(0, 100));
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
            'sec-ch-ua':
                '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        },
        ...playwright.devices['Desktop Edge'],
        proxy: { server: 'http://127.0.0.1:7890' },
        geolocation: { latitude: 1.3521, longitude: 103.8198 },
        javaScriptEnabled: true,
    });

    const page = await context.newPage();
    console.log('start to goto x.com');
    page.on('console', (message) => console.log(message.text()));
    page.on('request', (request) =>
        console.log(request.method(), request.url(), request.headers())
    );
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
