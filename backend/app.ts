import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';

export const createBackendApp = () => {
  const app = express();

  // Middleware
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Health check endpoint at root of backend api
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'MindRelax Express Backend', timestamp: new Date().toISOString() });
  });

  // Mount central API router under /v1 or direct
  app.use('/v1', apiRouter);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};

export default createBackendApp();
