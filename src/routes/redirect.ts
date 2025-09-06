import { Router, Request, Response } from 'express';
import { UrlService } from '../services/urlService';
import { logger } from '../middleware/logging';

const router = Router();
const urlService = UrlService.getInstance();

// Redirect to original URL
router.get('/:shortcode', (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;
    const ip = req.ip || req.connection.remoteAddress;
    const referrer = req.get('Referer');
    const userAgent = req.get('User-Agent');

    logger.info(`Redirect request for shortcode: ${shortcode}`, 'RedirectRoutes');

    const originalUrl = urlService.getOriginalUrl(shortcode, ip, referrer, userAgent);

    if (!originalUrl) {
      logger.warn(`Redirect failed for shortcode: ${shortcode} (not found or expired)`, 'RedirectRoutes');
      return res.status(404).json({
        error: 'Not Found',
        message: 'Short URL not found or has expired',
        statusCode: 404
      });
    }

    logger.info(`Redirecting ${shortcode} to ${originalUrl}`, 'RedirectRoutes');
    res.redirect(301, originalUrl);
  } catch (error) {
    logger.error(`Error during redirect: ${error instanceof Error ? error.message : 'Unknown error'}`, 'RedirectRoutes');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error processing redirect',
      statusCode: 500
    });
  }
});

export default router;
