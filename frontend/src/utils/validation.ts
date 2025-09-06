import { UrlFormData, FormErrors } from '../types';

export const validateUrl = (url: string): string | undefined => {
  if (!url.trim()) {
    return 'URL is required';
  }

  // Basic URL validation
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return 'URL must use HTTP or HTTPS protocol';
    }
  } catch {
    return 'Please enter a valid URL';
  }

  return undefined;
};

export const validateValidity = (validity: string): string | undefined => {
  if (!validity.trim()) {
    return undefined; // Optional field
  }

  const validityNum = parseInt(validity, 10);
  if (isNaN(validityNum) || validityNum <= 0) {
    return 'Validity must be a positive number';
  }

  if (validityNum > 10080) { // 7 days in minutes
    return 'Validity cannot exceed 7 days (10080 minutes)';
  }

  return undefined;
};

export const validateShortcode = (shortcode: string): string | undefined => {
  if (!shortcode.trim()) {
    return undefined; // Optional field
  }

  if (shortcode.length < 3 || shortcode.length > 20) {
    return 'Shortcode must be between 3 and 20 characters';
  }

  if (!/^[a-zA-Z0-9]+$/.test(shortcode)) {
    return 'Shortcode must contain only letters and numbers';
  }

  return undefined;
};

export const validateForm = (formData: UrlFormData): FormErrors => {
  const errors: FormErrors = {};

  const urlError = validateUrl(formData.url);
  if (urlError) errors.url = urlError;

  const validityError = validateValidity(formData.validity);
  if (validityError) errors.validity = validityError;

  const shortcodeError = validateShortcode(formData.shortcode);
  if (shortcodeError) errors.shortcode = shortcodeError;

  return errors;
};
