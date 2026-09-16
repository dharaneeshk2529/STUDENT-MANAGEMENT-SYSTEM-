import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { studentsController } from './controllers/studentsController.js';

export function createExpressApp() {
  const app = express();

  // Standard middleware
  app.use(cors({ origin: true }));
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Student Management System Cloud Functions API',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API: Student CRUD Routes
  app.post('/api/students', studentsController.createStudent);
  app.get('/api/students', studentsController.listStudents);
  app.get('/api/students/:id', studentsController.getStudentById);
  app.put('/api/students/:id', studentsController.updateStudent);
  app.delete('/api/students/:id', studentsController.deleteStudent);

  // 404 handler for unknown API routes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.method} ${req.originalUrl}' does not exist`,
    });
  });

  // Centralized error handler — never leak stack traces
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err?.message || err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });

  return app;
}

export const app = createExpressApp();
