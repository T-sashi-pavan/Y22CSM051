import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Tooltip,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { ShortUrl } from '../types';
import { logger } from '../utils/logging';

interface ExpandedRows {
  [key: string]: boolean;
}

const StatisticsPage: React.FC = () => {
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    logger.info('Statistics page loaded', 'StatisticsPage');
    fetchAllUrls();
  }, []);

  const fetchAllUrls = async () => {
    try {
      setLoading(true);
      const urls = await apiService.getAllShortUrls();
      setShortUrls(urls);
      logger.info(`Loaded ${urls.length} short URLs for statistics`, 'StatisticsPage');
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load statistics';
      setError(errorMessage);
      logger.error(`Failed to load statistics: ${errorMessage}`, 'StatisticsPage');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (shortcode: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [shortcode]: !prev[shortcode]
    }));
    logger.debug(`Toggled row expansion for shortcode: ${shortcode}`, 'StatisticsPage');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copied to clipboard!' });
      logger.info('Short URL copied to clipboard', 'StatisticsPage');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
      logger.error('Failed to copy to clipboard', 'StatisticsPage');
    }
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date() > new Date(expiresAt);
  };

  const formatLocation = (location?: { country?: string; region?: string; city?: string }): string => {
    if (!location) return 'Unknown';
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <AnalyticsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          URL Statistics
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View detailed analytics for all shortened URLs
        </Typography>
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {shortUrls.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No shortened URLs found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create some URLs on the shortener page to see statistics here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Short URL</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Original URL</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expires</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clicks</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortUrls.map((url) => (
                <React.Fragment key={url.shortcode}>
                  <TableRow hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          /{url.shortcode}
                        </Typography>
                        <Tooltip title="Copy short URL">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(`http://localhost:8080/${url.shortcode}`)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                        <Tooltip title="Open original URL">
                          <IconButton 
                            size="small" 
                            component={Link}
                            href={url.originalUrl}
                            target="_blank"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(url.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(url.expiresAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(url.expiresAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={url.clickCount}
                        color={url.clickCount > 0 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isExpired(url.expiresAt) ? 'Expired' : 'Active'}
                        color={isExpired(url.expiresAt) ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => toggleRow(url.shortcode)}
                        disabled={url.clicks.length === 0}
                      >
                        {expandedRows[url.shortcode] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={expandedRows[url.shortcode]} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Click Details ({url.clicks.length} clicks)
                          </Typography>
                          
                          {url.clicks.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No clicks yet
                            </Typography>
                          ) : (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Timestamp</strong></TableCell>
                                    <TableCell><strong>Referrer</strong></TableCell>
                                    <TableCell><strong>Location</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {url.clicks.map((click, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {new Date(click.timestamp).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(click.timestamp).toLocaleTimeString()}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {click.referrer || 'Direct'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {formatLocation(click.location)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total URLs: {shortUrls.length} | 
          Active: {shortUrls.filter(url => !isExpired(url.expiresAt)).length} | 
          Total Clicks: {shortUrls.reduce((sum, url) => sum + url.clickCount, 0)}
        </Typography>
      </Box>
    </Container>
  );
};

export default StatisticsPage;
