import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { logger } from './middleware/logging';
import shortUrlRoutes from './routes/shorturl';
import redirectRoutes from './routes/redirect';
import { UrlService } from './services/urlService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for accurate IP addresses)
app.set('trust proxy', 1);

// Logging middleware
app.use(logger.middleware());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested', 'HealthCheck');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', shortUrlRoutes);

// Redirect routes (must be after API routes)
app.use('/', redirectRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, 'Server');
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
    statusCode: 404
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, 'Server', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
    statusCode: 500
  });
});

// Cleanup expired URLs every hour
const urlService = UrlService.getInstance();
setInterval(() => {
  urlService.cleanupExpiredUrls();
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  logger.info(`URL Shortener Microservice started on port ${PORT}`, 'Server');
  logger.info(`Health check available at http://localhost:${PORT}/health`, 'Server');
  logger.info(`API documentation: POST /api/shorturls, GET /api/shorturls/:shortcode`, 'Server');
});

export default app;
