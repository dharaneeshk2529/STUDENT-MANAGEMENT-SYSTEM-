# Student Management System

A full-stack CRUD web application for managing student enrollments and academic records, built with React, Firebase Cloud Functions (Express REST API), and Google Cloud Firestore.

---

## 1. Project Overview

The **Student Management System** provides an end-to-end institutional registry for recording, searching, updating, and removing student documents. All operations strictly enforce data integrity, email format validation, duplicate identity detection, and boundary validation server-side in Firebase Cloud Functions before persisting records into Google Cloud Firestore.

Direct client-side database connections are forbidden by design: all reads and mutations pass through the authenticated Express HTTPS Cloud Function API layer.

---

## 2. System Architecture

```text
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                       React Application                         |   |
|   |  - StudentList: Live debounce search (?search=), Table/Cards    |   |
|   |  - StudentForm: Create & Edit with mirrored validation rules    |   |
|   |  - DeleteConfirmModal: Protected destruction flow               |   |
|   |  - Centralized api.js service (Axios)                           |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS REST Calls (/api/*)
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       SERVERLESS BACKEND LAYER                          |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |            Firebase Cloud Functions (Node.js / Express)         |   |
|   |                                                                 |   |
|   |  - Server-Side Validation: required fields, regex, positive age |   |
|   |  - Uniqueness Verification: duplicate email & roll number check |   |
|   |  - HTTP Status Codes: 200, 201, 204, 400, 404, 500             |   |
|   |  - Safe try/catch exception shielding (no leaked stack traces)  |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------+------------------------------------+
                                     |
                         Firebase Admin SDK (gRPC)
                                     |
                                     v
+-------------------------------------------------------------------------+
|                            DATABASE LAYER                               |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                  Google Cloud Firestore                         |   |
|   |                                                                 |   |
|   |  Collection: /students/{studentId}                              |   |
|   |  Security Rules: Direct client access disabled (allow: false)   |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Axios.
- **Backend**: Firebase Cloud Functions (v2 HTTPS callable Express app), Node.js, TypeScript.
- **Database**: Cloud Firestore (accessed via Firebase Admin SDK).
- **Testing**: Postman Collection (v2.1.0 with automated JavaScript test assertions).
- **Dev/Server Environment**: Vite 6, tsx, Express middleware.

---

## 4. Student Data Model

Collection name in Firestore: `students`

| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Auto-generated | Document identifier in Firestore |
| `firstName` | `string` | Required, non-empty | First name (1-100 characters) |
| `lastName` | `string` | Required, non-empty | Last name (1-100 characters) |
| `email` | `string` | Required, Unique | Valid email format validated by regex |
| `rollNumber` | `string` | Required, Unique | Unique institutional registration roll code |
| `course` | `string` | Required, non-empty | Degree program or academic department |
| `age` | `integer` | Required, `age > 0` | Must be a positive integer |
| `enrollmentDate` | `string` | Required, ISO date | Enrollment date in format `YYYY-MM-DD` |

---

## 5. Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Option A: Running with Full-Stack Dev Server (Default)
The repository includes a unified Express + Vite development setup:

```bash
# 1. Install root dependencies
npm install

# 2. Start the unified development server (hosts API on /api and React frontend on port 3000)
npm run dev

# 3. Open your browser at:
http://localhost:3000
```

### Option B: Running with Firebase Local Emulators

To run the backend Cloud Functions and Firestore database inside local Google Cloud emulators:

```bash
# 1. Navigate to functions directory
cd functions
npm install

# 2. Build TypeScript Cloud Functions
npm run build

# 3. Start Firebase Functions and Firestore emulators
firebase emulators:start --only functions,firestore

# 4. In a separate terminal, launch the React frontend
cd ..
npm run dev
```

---

## 6. Full REST API Documentation

Base URL: `http://localhost:3000/api` (or `https://<region>-<project-id>.cloudfunctions.net/api`)

### 1. Create a Student
- **Method**: `POST`
- **Path**: `/api/students`
- **Description**: Validates all fields, checks for duplicate email or rollNumber in Firestore, and generates a new document.
- **Status Codes**:
  - `201 Created`: Successfully registered.
  - `400 Bad Request`: Validation failure or duplicate email/rollNumber.
  - `500 Internal Server Error`: Unexpected database failure.

**Request Body Example:**
```json
{
  "firstName": "Alexander",
  "lastName": "Wright",
  "email": "alex.wright@university.edu",
  "rollNumber": "CS-2024-001",
  "course": "Computer Science",
  "age": 21,
  "enrollmentDate": "2024-09-01"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "std-seed-101",
    "firstName": "Alexander",
    "lastName": "Wright",
    "email": "alex.wright@university.edu",
    "rollNumber": "CS-2024-001",
    "course": "Computer Science",
    "age": 21,
    "enrollmentDate": "2024-09-01"
  }
}
```

**Error Response (400 Bad Request — Missing Fields or Duplicates):**
```json
{
  "success": false,
  "message": "Duplicate value detected",
  "errors": {
    "email": "A student with this email address already exists"
  }
}
```

---

### 2. List All Students / Search
- **Method**: `GET`
- **Path**: `/api/students`
- **Query Parameters**:
  - `search` *(optional)*: Filter by student first name, last name, roll number, or course.
- **Status Codes**:
  - `200 OK`: Returns array of matching students.
  - `500 Internal Server Error`.

**Request Example:**
```bash
GET /api/students?search=Alexander
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "std-seed-101",
      "firstName": "Alexander",
      "lastName": "Wright",
      "email": "alex.wright@university.edu",
      "rollNumber": "CS-2024-001",
      "course": "Computer Science",
      "age": 21,
      "enrollmentDate": "2024-09-01"
    }
  ]
}
```

---

### 3. Get Student by ID
- **Method**: `GET`
- **Path**: `/api/students/:id`
- **Description**: Retrieves a single student record by their Firestore document ID.
- **Status Codes**:
  - `200 OK`: Student found.
  - `404 Not Found`: ID does not match any record.
  - `500 Internal Server Error`.

**Request Example:**
```bash
GET /api/students/std-seed-101
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "std-seed-101",
    "firstName": "Alexander",
    "lastName": "Wright",
    "email": "alex.wright@university.edu",
    "rollNumber": "CS-2024-001",
    "course": "Computer Science",
    "age": 21,
    "enrollmentDate": "2024-09-01"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Student with ID 'invalid-id' not found"
}
```

---

### 4. Update Student (Full Update)
- **Method**: `PUT`
- **Path**: `/api/students/:id`
- **Description**: Performs a full document update. Verifies existing document, runs server-side validation, and ensures updated email/rollNumber does not conflict with another student.
- **Status Codes**:
  - `200 OK`: Student updated.
  - `400 Bad Request`: Validation failure or duplicate email/rollNumber.
  - `404 Not Found`: Student does not exist.
  - `500 Internal Server Error`.

**Request Body Example:**
```json
{
  "firstName": "Alexander",
  "lastName": "Wright",
  "email": "alex.wright@university.edu",
  "rollNumber": "CS-2024-001",
  "course": "Artificial Intelligence",
  "age": 22,
  "enrollmentDate": "2024-09-01"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": "std-seed-101",
    "firstName": "Alexander",
    "lastName": "Wright",
    "email": "alex.wright@university.edu",
    "rollNumber": "CS-2024-001",
    "course": "Artificial Intelligence",
    "age": 22,
    "enrollmentDate": "2024-09-01"
  }
}
```

---

### 5. Delete Student
- **Method**: `DELETE`
- **Path**: `/api/students/:id`
- **Description**: Deletes student document from Firestore.
- **Status Codes**:
  - `204 No Content`: Deleted successfully (empty body).
  - `404 Not Found`: Student does not exist.
  - `500 Internal Server Error`.

**Request Example:**
```bash
DELETE /api/students/std-seed-101
```

---

## 7. Postman Collection & Automated Tests

A complete Postman collection is included in the project root at:
`./postman_collection.json`

You can import this JSON directly into Postman to run automated API verification:
- **Create Tests**: Valid creation, missing fields (400), duplicate email (400), invalid email regex (400), non-positive age (400).
- **Read Tests**: List students (200), search query filtering (200), empty query results (200), get by valid ID (200), get by invalid ID (404).
- **Update Tests**: Valid full update (200), invalid ID (404), validation failure (400).
- **Delete Tests**: Valid deletion (204), invalid ID (404).

---

## 8. Security & Validation Rules

- **Strict Server-Side Validation**: Even if client validation is bypassed, Cloud Functions rejects invalid emails, missing keys, non-positive integer ages, and duplicate entries with `400 Bad Request`.
- **Zero-Trust Firestore Rules**: Client access is blocked (`allow read, write: if false;`). Only the trusted Firebase Cloud Functions backend via Firebase Admin SDK can interact with Firestore.
- **Clean Error Handling**: All database calls are wrapped in `try/catch`, outputting sanitized JSON error objects without exposing stack traces.
