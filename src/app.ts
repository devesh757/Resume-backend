import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.set('trust proxy', 1);
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'https://resume-frontend-beta-sooty.vercel.app',
  ...corsOrigins,
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

app.use(errorHandler);

export default app;
