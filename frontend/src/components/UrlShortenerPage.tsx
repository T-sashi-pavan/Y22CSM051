import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { validateForm } from '../utils/validation';
import { UrlFormData, FormErrors, CreateShortUrlResponse } from '../types';
import { logger } from '../utils/logging';

interface UrlForm {
  id: number;
  data: UrlFormData;
  errors: FormErrors;
  result?: CreateShortUrlResponse;
  loading: boolean;
}

const UrlShortenerPage: React.FC = () => {
  const [forms, setForms] = useState<UrlForm[]>([
    {
      id: 1,
      data: { url: '', validity: '30', shortcode: '' },
      errors: {},
      loading: false
    }
  ]);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    logger.info('URL Shortener page loaded', 'UrlShortenerPage');
  }, []);

  const addForm = () => {
    if (forms.length >= 5) {
      setGlobalMessage({ type: 'error', text: 'Maximum 5 URLs can be shortened at once' });
      return;
    }

    const newForm: UrlForm = {
      id: Math.max(...forms.map(f => f.id)) + 1,
      data: { url: '', validity: '30', shortcode: '' },
      errors: {},
      loading: false
    };

    setForms([...forms, newForm]);
    logger.info(`Added new URL form (${forms.length + 1}/5)`, 'UrlShortenerPage');
  };

  const removeForm = (id: number) => {
    if (forms.length === 1) {
      setGlobalMessage({ type: 'error', text: 'At least one form is required' });
      return;
    }

    setForms(forms.filter(form => form.id !== id));
    logger.info(`Removed URL form (${forms.length - 1} remaining)`, 'UrlShortenerPage');
  };

  const updateForm = (id: number, field: keyof UrlFormData, value: string) => {
    setForms(forms.map(form => {
      if (form.id === id) {
        const newData = { ...form.data, [field]: value };
        const errors = validateForm(newData);
        return { ...form, data: newData, errors };
      }
      return form;
    }));
  };

  const submitForm = async (id: number) => {
    const form = forms.find(f => f.id === id);
    if (!form) return;

    const errors = validateForm(form.data);
    if (Object.keys(errors).length > 0) {
      setForms(forms.map(f => f.id === id ? { ...f, errors } : f));
      logger.warn(`Form validation failed for form ${id}`, 'UrlShortenerPage');
      return;
    }

    setForms(forms.map(f => f.id === id ? { ...f, loading: true } : f));

    try {
      const request = {
        url: form.data.url,
        validity: form.data.validity ? parseInt(form.data.validity, 10) : undefined,
        shortcode: form.data.shortcode || undefined
      };

      const result = await apiService.createShortUrl(request);
      
      setForms(forms.map(f => f.id === id ? { ...f, result, loading: false, errors: {} } : f));
      logger.info(`Successfully created short URL for form ${id}`, 'UrlShortenerPage');
      
    } catch (error: any) {
      let errorMessage = 'Failed to create short URL';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setForms(forms.map(f => f.id === id ? { ...f, loading: false, errors: { url: errorMessage } } : f));
      logger.error(`Failed to create short URL for form ${id}: ${errorMessage}`, 'UrlShortenerPage');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setGlobalMessage({ type: 'success', text: 'Copied to clipboard!' });
      logger.info('Short URL copied to clipboard', 'UrlShortenerPage');
    } catch (error) {
      setGlobalMessage({ type: 'error', text: 'Failed to copy to clipboard' });
      logger.error('Failed to copy to clipboard', 'UrlShortenerPage');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <LinkIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          URL Shortener
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create up to 5 shortened URLs with custom validity and shortcodes
        </Typography>
      </Box>

      {globalMessage && (
        <Alert 
          severity={globalMessage.type} 
          sx={{ mb: 3 }}
          onClose={() => setGlobalMessage(null)}
        >
          {globalMessage.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {forms.map((form, index) => (
          <Grid item xs={12} key={form.id}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    URL #{index + 1}
                  </Typography>
                  {forms.length > 1 && (
                    <IconButton onClick={() => removeForm(form.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    value={form.data.url}
                    onChange={(e) => updateForm(form.id, 'url', e.target.value)}
                    error={!!form.errors.url}
                    helperText={form.errors.url}
                    required
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Validity (minutes)"
                      placeholder="30"
                      value={form.data.validity}
                      onChange={(e) => updateForm(form.id, 'validity', e.target.value)}
                      error={!!form.errors.validity}
                      helperText={form.errors.validity || 'Default: 30 minutes'}
                      sx={{ flex: 1 }}
                    />

                    <TextField
                      label="Custom Shortcode (optional)"
                      placeholder="mylink123"
                      value={form.data.shortcode}
                      onChange={(e) => updateForm(form.id, 'shortcode', e.target.value)}
                      error={!!form.errors.shortcode}
                      helperText={form.errors.shortcode || 'Leave empty for auto-generation'}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => submitForm(form.id)}
                    disabled={form.loading || !form.data.url}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {form.loading ? 'Creating...' : 'Shorten URL'}
                  </Button>

                  {form.result && (
                    <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Short URL Created Successfully!
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                          {form.result.shortLink}
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(form.result!.shortLink)}
                            sx={{ color: 'inherit' }}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2">
                        <strong>Expires:</strong> {new Date(form.result.expiry).toLocaleString()}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {forms.length < 5 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addForm}
            size="large"
          >
            Add Another URL ({forms.length}/5)
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Chip 
          label={`${forms.length} of 5 URLs`} 
          color={forms.length === 5 ? 'error' : 'primary'} 
          variant="outlined" 
        />
      </Box>
    </Container>
  );
};

export default UrlShortenerPage;
