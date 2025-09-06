export interface ShortUrl {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: string;
  referrer?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface CreateShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface UrlFormData {
  url: string;
  validity: string;
  shortcode: string;
}

export interface FormErrors {
  url?: string;
  validity?: string;
  shortcode?: string;
}
