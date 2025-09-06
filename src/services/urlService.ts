import { nanoid } from 'nanoid';
import validator from 'validator';
import geoip from 'geoip-lite';
import { ShortUrl, ClickData, CreateShortUrlRequest } from '../types';
import { logger } from '../middleware/logging';

export class UrlService {
  private static instance: UrlService;
  private urls: Map<string, ShortUrl> = new Map();
  private customShortcodes: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): UrlService {
    if (!UrlService.instance) {
      UrlService.instance = new UrlService();
    }
    return UrlService.instance;
  }

  public createShortUrl(request: CreateShortUrlRequest, baseUrl: string): { shortLink: string; expiry: string } {
    const { url, validity = 30, shortcode } = request;

    // Validate URL
    if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
      logger.error(`Invalid URL provided: ${url}`, 'UrlService');
      throw new Error('Invalid URL format');
    }

    // Generate or validate shortcode
    let finalShortcode: string;
    if (shortcode) {
      if (!this.isValidShortcode(shortcode)) {
        logger.error(`Invalid shortcode format: ${shortcode}`, 'UrlService');
        throw new Error('Invalid shortcode format. Must be alphanumeric and 3-20 characters long');
      }
      if (this.customShortcodes.has(shortcode) || this.urls.has(shortcode)) {
        logger.error(`Shortcode already exists: ${shortcode}`, 'UrlService');
        throw new Error('Shortcode already exists');
      }
      finalShortcode = shortcode;
      this.customShortcodes.add(shortcode);
    } else {
      finalShortcode = this.generateUniqueShortcode();
    }

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60 * 1000);

    // Create short URL entry
    const shortUrl: ShortUrl = {
      id: nanoid(),
      shortcode: finalShortcode,
      originalUrl: url,
      createdAt: now,
      expiresAt,
      clickCount: 0,
      clicks: []
    };

    this.urls.set(finalShortcode, shortUrl);
    
    logger.info(`Created short URL: ${finalShortcode} -> ${url}`, 'UrlService');

    return {
      shortLink: `${baseUrl}/${finalShortcode}`,
      expiry: expiresAt.toISOString()
    };
  }

  public getOriginalUrl(shortcode: string, ip?: string, referrer?: string, userAgent?: string): string | null {
    const shortUrl = this.urls.get(shortcode);
    
    if (!shortUrl) {
      logger.warn(`Shortcode not found: ${shortcode}`, 'UrlService');
      return null;
    }

    // Check if expired
    if (new Date() > shortUrl.expiresAt) {
      logger.warn(`Expired shortcode accessed: ${shortcode}`, 'UrlService');
      return null;
    }

    // Record click
    const clickData: ClickData = {
      timestamp: new Date(),
      referrer,
      userAgent,
      ip
    };

    // Add location data if IP is available
    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      const geo = geoip.lookup(ip);
      if (geo) {
        clickData.location = {
          country: geo.country,
          region: geo.region,
          city: geo.city
        };
      }
    }

    shortUrl.clicks.push(clickData);
    shortUrl.clickCount++;

    logger.info(`Redirecting ${shortcode} to ${shortUrl.originalUrl} (click #${shortUrl.clickCount})`, 'UrlService');

    return shortUrl.originalUrl;
  }

  public getUrlStats(shortcode: string): ShortUrl | null {
    const shortUrl = this.urls.get(shortcode);
    if (!shortUrl) {
      logger.warn(`Stats requested for non-existent shortcode: ${shortcode}`, 'UrlService');
      return null;
    }
    return shortUrl;
  }

  public getAllUrls(): ShortUrl[] {
    return Array.from(this.urls.values());
  }

  private generateUniqueShortcode(): string {
    let shortcode: string;
    do {
      shortcode = nanoid(6);
    } while (this.urls.has(shortcode) || this.customShortcodes.has(shortcode));
    return shortcode;
  }

  private isValidShortcode(shortcode: string): boolean {
    // Must be alphanumeric and 3-20 characters
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(shortcode);
  }

  // Cleanup expired URLs (can be called periodically)
  public cleanupExpiredUrls(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [shortcode, shortUrl] of this.urls.entries()) {
      if (now > shortUrl.expiresAt) {
        this.urls.delete(shortcode);
        this.customShortcodes.delete(shortcode);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} expired URLs`, 'UrlService');
    }

    return cleaned;
  }
}
