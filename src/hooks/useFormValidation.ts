import { useState, useCallback } from 'react';
import { ValidationResult } from '../types';
import {
  validateEmail,
  validatePhone,
  validateName,
  validateDateTime
} from '../utils/validators';

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, values[name]);
  }, [values]);

  const validateField = (name: string, value: any): boolean => {
    let result: ValidationResult = { valid: true };

    switch (name) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'name':
        result = validateName(value);
        break;
      case 'appointment':
        result = validateDateTime(value);
        break;
      default:
        return true;
    }

    if (!result.valid) {
      setErrors(prev => ({
        ...prev,
        [name]: result.error || 'Invalid input'
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
      return true;
    }
  };

  const validateAll = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {};

    Object.entries(values).forEach(([name, value]) => {
      let result: ValidationResult = { valid: true };

      if (name === 'email' && value) result = validateEmail(value);
      if (name === 'phone' && value) result = validatePhone(value);
      if (name === 'name' && value) result = validateName(value);
      if (name === 'appointment' && value) result = validateDateTime(value);

      if (!result.valid) {
        newErrors[name] = result.error || 'Invalid input';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    reset,
    setValues
  };
};
