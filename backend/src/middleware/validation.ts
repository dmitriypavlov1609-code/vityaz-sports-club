import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Middleware для валидации с помощью Zod схем
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Ошибка валидации данных',
          code: 'VALIDATION_ERROR',
          details: errors,
        });
      }
      next(error);
    }
  };
};
