/**
 * Form validation utilities for client intake and settings forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: false, error: 'Email is required' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) return { isValid: false, error: 'Phone number is required' };

  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

/**
 * Validate name (at least 2 characters)
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) return { isValid: false, error: 'Name is required' };

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  return { isValid: true };
};

/**
 * Validate URL
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url) return { isValid: false, error: 'URL is required' };

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Validate required field
 */
export const validateRequired = (value: string | undefined | null, fieldName: string = 'This field'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string = 'This field'): ValidationResult => {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string = 'This field'): ValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { isValid: true };
};

/**
 * Validate form object
 */
export interface FormValidationRules {
  [key: string]: {
    validators: ((value: any) => ValidationResult)[];
  };
}

export const validateForm = (
  formData: Record<string, any>,
  rules: FormValidationRules
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [field, config] of Object.entries(rules)) {
    const value = formData[field];

    for (const validator of config.validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors[field] = result.error || `${field} is invalid`;
        break; // Only show first error per field
      }
    }
  }

  return errors;
};
