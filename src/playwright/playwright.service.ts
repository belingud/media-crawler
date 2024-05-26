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
        return await playwright.chromium.launch({ headless: true });
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
