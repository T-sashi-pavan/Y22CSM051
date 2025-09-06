export interface ShortUrl {
  id: string;
  shortcode: string;
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface CreateShortUrlRequest {
  url: string;
  validity?: number; // in minutes
  shortcode?: string;
}

export interface CreateShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ShortUrlStatsResponse {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: {
    timestamp: string;
    referrer?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  }[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
