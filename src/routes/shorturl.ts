import { Router, Request, Response } from 'express';
import { UrlService } from '../services/urlService';
import { CreateShortUrlRequest, CreateShortUrlResponse, ErrorResponse } from '../types';
import { logger } from '../middleware/logging';

const router = Router();
const urlService = UrlService.getInstance();

// Create short URL
router.post('/shorturls', (req: Request, res: Response) => {
  try {
    logger.info('Creating short URL request received', 'ShortUrlRoutes');
    
    const { url, validity, shortcode }: CreateShortUrlRequest = req.body;

    if (!url) {
      logger.warn('Missing URL in request body', 'ShortUrlRoutes');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL is required',
        statusCode: 400
      } as ErrorResponse);
    }

    // Validate validity if provided
    if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
      logger.warn(`Invalid validity provided: ${validity}`, 'ShortUrlRoutes');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Validity must be a positive integer representing minutes',
        statusCode: 400
      } as ErrorResponse);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = urlService.createShortUrl({ url, validity, shortcode }, baseUrl);

    logger.info(`Short URL created successfully: ${result.shortLink}`, 'ShortUrlRoutes');
    
    res.status(201).json(result as CreateShortUrlResponse);
  } catch (error) {
    logger.error(`Error creating short URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ShortUrlRoutes');
    
    let statusCode = 500;
    let message = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('Invalid URL format')) {
        statusCode = 400;
        message = error.message;
      } else if (error.message.includes('already exists') || error.message.includes('Invalid shortcode format')) {
        statusCode = 409;
        message = error.message;
      }
    }

    res.status(statusCode).json({
      error: statusCode === 400 ? 'Bad Request' : statusCode === 409 ? 'Conflict' : 'Internal Server Error',
      message,
      statusCode
    } as ErrorResponse);
  }
});

// Get URL statistics
router.get('/shorturls/:shortcode', (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;
    
    logger.info(`Stats requested for shortcode: ${shortcode}`, 'ShortUrlRoutes');

    const shortUrl = urlService.getUrlStats(shortcode);

    if (!shortUrl) {
      logger.warn(`Stats requested for non-existent shortcode: ${shortcode}`, 'ShortUrlRoutes');
      return res.status(404).json({
        error: 'Not Found',
        message: 'Short URL not found',
        statusCode: 404
      } as ErrorResponse);
    }

    const response = {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt.toISOString(),
      expiresAt: shortUrl.expiresAt.toISOString(),
      clickCount: shortUrl.clickCount,
      clicks: shortUrl.clicks.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        location: click.location
      }))
    };

    logger.info(`Stats retrieved for shortcode: ${shortcode}`, 'ShortUrlRoutes');
    res.json(response);
  } catch (error) {
    logger.error(`Error retrieving stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ShortUrlRoutes');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error retrieving URL statistics',
      statusCode: 500
    } as ErrorResponse);
  }
});

// Get all URLs (for the frontend)
router.get('/shorturls', (req: Request, res: Response) => {
  try {
    logger.info('All URLs list requested', 'ShortUrlRoutes');
    
    const allUrls = urlService.getAllUrls();
    const response = allUrls.map(shortUrl => ({
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt.toISOString(),
      expiresAt: shortUrl.expiresAt.toISOString(),
      clickCount: shortUrl.clickCount,
      clicks: shortUrl.clicks.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        location: click.location
      }))
    }));

    res.json(response);
  } catch (error) {
    logger.error(`Error retrieving all URLs: ${error instanceof Error ? error.message : 'Unknown error'}`, 'ShortUrlRoutes');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error retrieving URLs',
      statusCode: 500
    } as ErrorResponse);
  }
});

export default router;
