import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.set('trust proxy', 1);
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

app.use(errorHandler);

export default app;
