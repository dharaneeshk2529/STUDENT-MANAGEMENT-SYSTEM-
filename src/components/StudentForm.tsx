import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Hash,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { StudentFormData, FormErrors } from '../types.js';
import api from '../services/api.js';
import { validateStudentForm } from '../utils/validation.js';

interface StudentFormProps {
  isOpen: boolean;
  studentId: string | null; // null for Create, string ID for Edit
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const INITIAL_FORM_STATE: StudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  rollNumber: '',
  course: '',
  age: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
};

const AVAILABLE_COURSES = [
  'Computer Science',
  'Software Engineering',
  'Data Science',
  'Cybersecurity',
  'Information Technology',
  'Artificial Intelligence',
  'Electrical Engineering',
  'Business Administration',
];

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  studentId,
  onClose,
  onSuccess,
  onError,
}) => {
  const isEditMode = Boolean(studentId);
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [bypassClientValidation, setBypassClientValidation] = useState<boolean>(false);

  // When opening in Edit mode, pre-fill form using GET /api/students/:id
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setGeneralError(null);

      if (studentId) {
        setIsLoadingDetails(true);
        api
          .getStudentById(studentId)
          .then((res) => {
            if (res.data) {
              setFormData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                email: res.data.email || '',
                rollNumber: res.data.rollNumber || '',
                course: res.data.course || '',
                age: res.data.age ?? '',
                enrollmentDate: res.data.enrollmentDate || '',
              });
            }
          })
          .catch((err) => {
            const errorInfo = api.extractErrorMessage(err);
            onError(`Failed to load student details: ${errorInfo.message}`);
            onClose();
          })
          .finally(() => {
            setIsLoadingDetails(false);
          });
      } else {
        setFormData(INITIAL_FORM_STATE);
        setIsLoadingDetails(false);
      }
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user modifies it
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Client-side validation check (can be bypassed to test server enforcement)
    if (!bypassClientValidation) {
      const validation = validateStudentForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        rollNumber: formData.rollNumber,
        course: formData.course,
        age: formData.age === '' ? '' : Number(formData.age),
        enrollmentDate: formData.enrollmentDate,
      };

      if (isEditMode && studentId) {
        const response = await api.updateStudent(studentId, payload);
        onSuccess(response.message || 'Student updated successfully!');
        onClose();
      } else {
        const response = await api.createStudent(payload);
        onSuccess(response.message || 'Student created successfully!');
        onClose();
      }
    } catch (err: any) {
      const errPayload = api.extractErrorMessage(err);
      if (errPayload.errors && Object.keys(errPayload.errors).length > 0) {
        setErrors(errPayload.errors);
      }
      setGeneralError(errPayload.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="student-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="student-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              {isEditMode ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="student-form-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isEditMode ? 'Edit Student Record' : 'Enroll New Student'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isEditMode
                  ? 'Updates are verified on Cloud Functions and saved to Firestore'
                  : 'Validated server-side in Cloud Functions before persistence'}
              </p>
            </div>
          </div>

          <button
            id="close-student-form-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isLoadingDetails ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-sm text-zinc-500">Fetching student data from API...</span>
          </div>
        ) : (
          <form id="student-record-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* General Server Error Banner */}
            {generalError && (
              <div
                id="form-server-error-banner"
                role="alert"
                className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Server Error</strong>
                  <span>{generalError}</span>
                </div>
              </div>
            )}

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-firstName-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="student-firstName-input"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Liam"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.firstName
                        ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p id="student-firstName-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-lastName-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-lastName-input"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Vance"
                  className={`w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.lastName
                      ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
                {errors.lastName && (
                  <p id="student-lastName-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="student-email-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address <span className="text-rose-500">*</span> (Must be unique)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="student-email-input"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student.name@university.edu"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="student-email-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Roll Number and Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-rollNumber-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Roll Number <span className="text-rose-500">*</span> (Must be unique)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="student-rollNumber-input"
                    name="rollNumber"
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CS-2024-042"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono ${
                      errors.rollNumber
                        ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                    }`}
                  />
                </div>
                {errors.rollNumber && (
                  <p id="student-rollNumber-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.rollNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-course-select" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Course / Program <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    id="student-course-select"
                    name="course"
                    type="text"
                    list="course-options"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Select or enter course..."
                    className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.course
                        ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                    }`}
                  />
                  <datalist id="course-options">
                    {AVAILABLE_COURSES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                {errors.course && (
                  <p id="student-course-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.course}
                  </p>
                )}
              </div>
            </div>

            {/* Age & Enrollment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-age-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Age <span className="text-rose-500">*</span> (Positive integer &gt; 0)
                </label>
                <input
                  id="student-age-input"
                  name="age"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  className={`w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.age
                      ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                      : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                  }`}
                />
                {errors.age && (
                  <p id="student-age-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="student-enrollmentDate-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Enrollment Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="student-enrollmentDate-input"
                    name="enrollmentDate"
                    type="date"
                    required
                    value={formData.enrollmentDate}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/70 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      errors.enrollmentDate
                        ? 'border-rose-400 focus:ring-rose-400 text-rose-900 dark:text-rose-100'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100'
                    }`}
                  />
                </div>
                {errors.enrollmentDate && (
                  <p id="student-enrollmentDate-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.enrollmentDate}
                  </p>
                )}
              </div>
            </div>

            {/* Test Helper: Bypass Client Validation */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Server Enforcement Test:</strong> Bypass client validation to test Cloud Functions 400 responses
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                <input
                  id="bypass-client-validation-checkbox"
                  type="checkbox"
                  checked={bypassClientValidation}
                  onChange={(e) => setBypassClientValidation(e.target.checked)}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Bypass</span>
              </label>
            </div>

            {/* Form Actions Footer */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                id="cancel-student-form-btn"
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="submit-student-form-btn"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Student' : 'Save Student'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
