import { Request, Response, NextFunction } from "express";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (
  schema: Record<string, (value: unknown) => string | null>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    for (const field of Object.keys(schema)) {
      const value = req.body[field];
      const error = schema[field](value);
      if (error) {
        errors.push({ field, message: error });
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    next();
  };
};

export const validateObjectId = (id: string): boolean => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};
