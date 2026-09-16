import axios from 'axios';

/**
 * Axios client configured exclusively for the Cloud Functions Express REST API.
 * The React frontend communicates ONLY via this client.
 * There are zero direct Firestore or Firebase SDK calls in the frontend.
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Helper to normalize backend REST error responses into user-readable messages and field errors
 */
export function extractErrorMessage(error) {
  if (error.response) {
    const data = error.response.data;
    if (data && data.errors) {
      return {
        message: data.message || 'Validation error',
        errors: data.errors,
      };
    }
    if (data && data.message) {
      return {
        message: data.message,
        errors: {},
      };
    }
    return {
      message: `Request failed with status ${error.response.status}`,
      errors: {},
    };
  }
  if (error.request) {
    return {
      message: 'Network error: Unable to reach the server. Please verify the Cloud Functions REST API is running.',
      errors: {},
    };
  }
  return {
    message: error.message || 'An unexpected error occurred.',
    errors: {},
  };
}

/**
 * GET /api/students
 * Fetch all students with optional search query (?search=)
 */
export async function getStudents(search = '') {
  const config = search && search.trim() !== '' ? { params: { search: search.trim() } } : {};
  const response = await apiClient.get('/students', config);
  return response.data;
}

/**
 * GET /api/students/:id
 * Fetch a single student by Firestore document ID
 */
export async function getStudent(id) {
  const response = await apiClient.get(`/students/${id}`);
  return response.data;
}

// Alias for backwards compatibility with any existing components
export const getStudentById = getStudent;

/**
 * POST /api/students
 * Create a new student record
 */
export async function createStudent(studentData) {
  const response = await apiClient.post('/students', studentData);
  return response.data;
}

/**
 * PUT /api/students/:id
 * Update an existing student record (full update)
 */
export async function updateStudent(id, studentData) {
  const response = await apiClient.put(`/students/${id}`, studentData);
  return response.data;
}

/**
 * DELETE /api/students/:id
 * Delete a student record by ID (returns 204 No Content)
 */
export async function deleteStudent(id) {
  const response = await apiClient.delete(`/students/${id}`);
  return response.data;
}

export default {
  getStudents,
  getStudent,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  extractErrorMessage,
};
