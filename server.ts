import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app as cloudFunctionsApp } from './functions/src/app.js';
import { initFirestore } from './functions/src/db.js';

async function startServer() {
  // Pre-warm Firestore database connection
  await initFirestore();

  const mainApp = express();
  const PORT = 3000;

  // Delegate all /api requests to our Cloud Functions Express app
  mainApp.use(cloudFunctionsApp);

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    mainApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    mainApp.use(express.static(distPath));
    mainApp.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  mainApp.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Management System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
