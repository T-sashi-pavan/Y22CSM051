import axios from 'axios';
import { CreateShortUrlRequest, CreateShortUrlResponse, ShortUrl } from '../types';
import { logger } from '../utils/logging';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async createShortUrl(request: CreateShortUrlRequest): Promise<CreateShortUrlResponse> {
    try {
      logger.info(`Creating short URL for: ${request.url}`, 'ApiService');
      
      const response = await axios.post<CreateShortUrlResponse>(
        `${API_BASE_URL}/api/shorturls`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Short URL created successfully: ${response.data.shortLink}`, 'ApiService');
      return response.data;
    } catch (error) {
      logger.error(`Failed to create short URL: ${error}`, 'ApiService', error as Error);
      throw error;
    }
  }

  public async getShortUrlStats(shortcode: string): Promise<ShortUrl> {
    try {
      logger.info(`Fetching stats for shortcode: ${shortcode}`, 'ApiService');
      
      const response = await axios.get<ShortUrl>(
        `${API_BASE_URL}/api/shorturls/${shortcode}`
      );

      logger.info(`Stats retrieved for shortcode: ${shortcode}`, 'ApiService');
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch stats for shortcode ${shortcode}: ${error}`, 'ApiService', error as Error);
      throw error;
    }
  }

  public async getAllShortUrls(): Promise<ShortUrl[]> {
    try {
      logger.info('Fetching all short URLs', 'ApiService');
      
      const response = await axios.get<ShortUrl[]>(
        `${API_BASE_URL}/api/shorturls`
      );

      logger.info(`Retrieved ${response.data.length} short URLs`, 'ApiService');
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch all short URLs: ${error}`, 'ApiService', error as Error);
      throw error;
    }
  }

  public async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    try {
      logger.info('Performing health check', 'ApiService');
      
      const response = await axios.get(`${API_BASE_URL}/health`);
      
      logger.info('Health check successful', 'ApiService');
      return response.data;
    } catch (error) {
      logger.error(`Health check failed: ${error}`, 'ApiService', error as Error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();
