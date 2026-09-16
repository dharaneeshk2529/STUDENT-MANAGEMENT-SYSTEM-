import { FormErrors, StudentFormData } from '../types.js';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStudentForm(data: StudentFormData): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  // Required fields check
  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.rollNumber || data.rollNumber.trim() === '') {
    errors.rollNumber = 'Roll number is required';
  }

  if (!data.course || data.course.trim() === '') {
    errors.course = 'Course name is required';
  }

  if (data.age === undefined || data.age === null || String(data.age).trim() === '') {
    errors.age = 'Age is required';
  } else {
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum <= 0) {
      errors.age = 'Age must be a positive integer';
    }
  }

  if (!data.enrollmentDate || data.enrollmentDate.trim() === '') {
    errors.enrollmentDate = 'Enrollment date is required';
  } else if (isNaN(Date.parse(data.enrollmentDate.trim()))) {
    errors.enrollmentDate = 'Please select a valid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
