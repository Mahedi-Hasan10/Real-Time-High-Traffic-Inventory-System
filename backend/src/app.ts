import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import ApiError from './utils/ApiError.js';
import logger from './utils/logger.js';

// Import routes
import routes from './routes/index.js';

const app: Express = express();

// Security HTTP headers
app.use((helmet as any)());

// Parse json request body
app.use(express.json({ limit: '16kb' }));

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Gzip compression
app.use(compression());

// Enable cors
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// HTTP request logger
app.use(morgan(config.env === 'development' ? 'dev' : 'combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// API Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/v1', routes);

// Handle unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found'));
});

// Global error handler
app.use(errorHandler);

export default app;
