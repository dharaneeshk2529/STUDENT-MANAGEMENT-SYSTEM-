import { onRequest } from 'firebase-functions/v2/https';
import { app } from './app.js';

/**
 * Firebase Cloud Function exposing the Express REST API as an HTTPS function
 * Endpoints are available under /api/*
 */
export const api = onRequest(
  {
    cors: true,
    region: 'us-central1',
    maxInstances: 10,
  },
  app
);

export { app };
