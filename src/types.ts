export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  course: string;
  age: number;
  enrollmentDate: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  course: string;
  age: number | string;
  enrollmentDate: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  rollNumber?: string;
  course?: string;
  age?: string;
  enrollmentDate?: string;
  _general?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}
