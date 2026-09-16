import { ValidationResult, ValidationErrors } from './types.js';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStudentInput(data: any): ValidationResult {
  const errors: ValidationErrors = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { _general: 'Request body must be a JSON object' },
    };
  }

  // 1. Required fields checks
  const requiredFields = [
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
    { key: 'email', label: 'Email' },
    { key: 'rollNumber', label: 'Roll number' },
    { key: 'course', label: 'Course' },
    { key: 'age', label: 'Age' },
    { key: 'enrollmentDate', label: 'Enrollment date' },
  ];

  for (const field of requiredFields) {
    const val = data[field.key];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      errors[field.key] = `${field.label} is required`;
    }
  }

  // 2. Email format validation
  if (data.email && typeof data.email === 'string' && data.email.trim() !== '') {
    const trimmedEmail = data.email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address';
    }
  }

  // 3. Age validation: must be positive integer (> 0)
  if (data.age !== undefined && data.age !== null && data.age !== '') {
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum <= 0) {
      errors.age = 'Age must be a positive integer';
    }
  }

  // 4. Enrollment date validation
  if (data.enrollmentDate && typeof data.enrollmentDate === 'string' && data.enrollmentDate.trim() !== '') {
    const timestamp = Date.parse(data.enrollmentDate.trim());
    if (isNaN(timestamp)) {
      errors.enrollmentDate = 'Enrollment date must be a valid date (YYYY-MM-DD)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
