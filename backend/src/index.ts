import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Загрузка переменных окружения
dotenv.config();

// Импорты
import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import childrenRoutes from './routes/children.routes';
import sessionsRoutes from './routes/sessions.routes';
import ofpRoutes from './routes/ofp.routes';
import paymentsRoutes from './routes/payments.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных
connectDatabase();

// Middleware
app.use(helmet()); // Безопасность
app.use(morgan('dev')); // Логирование
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // макс 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'API Спортивного клуба Витязь',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      children: '/api/children',
      sessions: '/api/sessions',
      ofp: '/api/ofp',
      payments: '/api/payments',
      admin: '/api/admin',
      analytics: '/api/analytics',
    },
  });
});

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/ofp', ofpRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`\n🚀 Backend сервер запущен на порту ${PORT}`);
  console.log(`📊 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API: http://localhost:${PORT}/api\n`);
});

export default app;
