/**
 * Input Validation Utilities
 * Provides type-safe validation for user inputs and API responses
 */

import { logger } from './logger';

/**
 * Validates email address format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
}

/**
 * Validates phone number format (international support)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required and must be a string' };
  }

  // Removes formatting characters and checks minimum digit count
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { valid: false, error: 'Phone number must have at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }

  // Basic international format check
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
}

/**
 * Validates client name
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required and must be a string' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }

  // Check for reasonable name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']{2,100}$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validates ISO 8601 datetime format
 */
export function validateDateTime(dateTime: string): { valid: boolean; error?: string } {
  if (!dateTime || typeof dateTime !== 'string') {
    return { valid: false, error: 'Date/time is required and must be a string' };
  }

  // ISO 8601 format validation
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?$/;
  if (!iso8601Regex.test(dateTime)) {
    return { valid: false, error: 'Date/time must be in ISO 8601 format' };
  }

  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date/time value' };
  }

  // Check that datetime is in the future
  if (date <= new Date()) {
    return { valid: false, error: 'Appointment must be scheduled for a future date/time' };
  }

  return { valid: true };
}

/**
 * Validates case summary text
 */
export function validateCaseSummary(summary: string): { valid: boolean; error?: string } {
  if (!summary || typeof summary !== 'string') {
    return { valid: false, error: 'Case summary is required and must be a string' };
  }

  const trimmedSummary = summary.trim();
  if (trimmedSummary.length < 10) {
    return { valid: false, error: 'Case summary must be at least 10 characters' };
  }

  if (trimmedSummary.length > 5000) {
    return { valid: false, error: 'Case summary is too long (max 5000 characters)' };
  }

  return { valid: true };
}

/**
 * Validates document list
 */
export function validateDocumentList(documents: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(documents)) {
    return { valid: false, error: 'Documents must be an array' };
  }

  if (documents.length === 0) {
    return { valid: false, error: 'At least one document must be specified' };
  }

  if (documents.length > 50) {
    return { valid: false, error: 'Too many documents specified (max 50)' };
  }

  for (const doc of documents) {
    if (typeof doc !== 'string' || doc.trim().length === 0) {
      return { valid: false, error: 'Each document must be a non-empty string' };
    }
    if (doc.length > 100) {
      return { valid: false, error: 'Document name is too long' };
    }
  }

  return { valid: true };
}

/**
 * Sanitizes HTML string to prevent XSS
 * IMPORTANT: Use this before dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    logger.warn('sanitizeHtml received non-string input', typeof html);
    return '';
  }

  // Create a temporary div and use textContent to escape
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escapes special characters in strings for use in regexes or HTML
 */
export function escapeRegex(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates API response has expected structure
 */
export function validateLawyerReportStructure(report: unknown): { valid: boolean; error?: string } {
  if (typeof report !== 'object' || report === null) {
    return { valid: false, error: 'Report must be an object' };
  }

  const requiredFields = [
    'clientDetails',
    'caseSummary',
    'initialAssessment',
    'actionableNextSteps',
    'urgencyLevel',
    'documentCollection'
  ];

  for (const field of requiredFields) {
    if (!(field in report)) {
      return { valid: false, error: `Report missing required field: ${field}` };
    }
  }

  return { valid: true };
}

/**
 * Validates secure upload link format
 */
export function validateUploadLink(url: string): { valid: boolean; error?: string } {
  if (typeof url !== 'string') {
    return { valid: false, error: 'Upload link must be a string' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Upload link is not a valid URL' };
  }
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
