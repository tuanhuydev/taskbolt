/**
 * Form validation utilities
 * Simple validation helpers for form fields
 */

export function isRequired(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return 'taskForm.requiredField';
  }
  return null;
}

export function isValidNumber(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null; // Empty is valid for optional fields
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  return null;
}

export function isPositiveNumber(value: string | number | null | undefined): string | null {
  const numError = isValidNumber(value);
  if (numError) return numError;
  
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num <= 0) {
    return 'Please enter a positive number';
  }
  
  return null;
}
