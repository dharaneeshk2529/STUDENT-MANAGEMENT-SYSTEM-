import { Request, Response } from 'express';
import { studentRepository } from '../db.js';
import { validateStudentInput } from '../validation.js';

export const studentsController = {
  /**
   * POST /api/students
   * Create a new student with full server-side validation and uniqueness checks
   */
  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      // 1. Structural and field validation
      const validation = validateStudentInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      const { firstName, lastName, email, rollNumber, course, age, enrollmentDate } = req.body;

      // 2. Uniqueness check in database
      const duplicates = await studentRepository.checkDuplicates(email, rollNumber);
      const errors: Record<string, string> = {};

      if (duplicates.emailTaken) {
        errors.email = 'A student with this email address already exists';
      }
      if (duplicates.rollNumberTaken) {
        errors.rollNumber = 'A student with this roll number already exists';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          success: false,
          message: 'Duplicate value detected',
          errors,
        });
        return;
      }

      // 3. Persist to Firestore
      const newStudent = await studentRepository.create({
        firstName,
        lastName,
        email,
        rollNumber,
        course,
        age: Number(age),
        enrollmentDate,
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: newStudent,
      });
    } catch (error: any) {
      console.error('Error creating student:', error?.message || error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating student',
      });
    }
  },

  /**
   * GET /api/students
   * List all students, supporting ?search= query param filtering
   */
  async listStudents(req: Request, res: Response): Promise<void> {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const students = await studentRepository.getAll(search);

      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error: any) {
      console.error('Error listing students:', error?.message || error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching students',
      });
    }
  },

  /**
   * GET /api/students/:id
   * Fetch single student by document ID
   */
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Student ID parameter is required',
        });
        return;
      }

      const student = await studentRepository.getById(id);
      if (!student) {
        res.status(404).json({
          success: false,
          message: `Student with ID '${id}' not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error: any) {
      console.error('Error retrieving student:', error?.message || error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving student',
      });
    }
  },

  /**
   * PUT /api/students/:id
   * Update student with complete validation and duplicate checks
   */
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Student ID parameter is required',
        });
        return;
      }

      // Check if student exists
      const existingStudent = await studentRepository.getById(id);
      if (!existingStudent) {
        res.status(404).json({
          success: false,
          message: `Student with ID '${id}' not found`,
        });
        return;
      }

      // Validate incoming data
      const validation = validateStudentInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      const { firstName, lastName, email, rollNumber, course, age, enrollmentDate } = req.body;

      // Uniqueness check excluding current student ID
      const duplicates = await studentRepository.checkDuplicates(email, rollNumber, id);
      const errors: Record<string, string> = {};

      if (duplicates.emailTaken) {
        errors.email = 'Another student with this email address already exists';
      }
      if (duplicates.rollNumberTaken) {
        errors.rollNumber = 'Another student with this roll number already exists';
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          success: false,
          message: 'Duplicate value detected',
          errors,
        });
        return;
      }

      const updated = await studentRepository.update(id, {
        firstName,
        lastName,
        email,
        rollNumber,
        course,
        age: Number(age),
        enrollmentDate,
      });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Student with ID '${id}' not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating student:', error?.message || error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating student',
      });
    }
  },

  /**
   * DELETE /api/students/:id
   * Delete student by document ID. Returns 204 No Content on success.
   */
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || id.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Student ID parameter is required',
        });
        return;
      }

      const deleted = await studentRepository.delete(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Student with ID '${id}' not found`,
        });
        return;
      }

      // Return 204 No Content
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting student:', error?.message || error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting student',
      });
    }
  },
};
