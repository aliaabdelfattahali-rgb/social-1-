import { Response } from "express";

interface SuccessResponseOptions<T> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
}

export const sendSuccess = <T>({
  res,
  statusCode,
  message,
  data,
}: SuccessResponseOptions<T>): Response => {
  const response: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
