import type {Request, Response, NextFunction} from 'express';

// valueOf
export type ValueOf<T> = T[keyof T];
export type OnlyNumOf<K> = K extends number ? K : null;

// Define a type for the body message of HTTP errors
export type BodyMessage = string | string[];

// Define the structure of HTTP error body
export interface HttpErrorBody {
  error: string;
  detail?: any;
  status: number;
  message: BodyMessage;
}

// Define the structure of HTTP response
export interface HttpResBody {
  status: number;
  message: string;
  result: any;
}

// Define the type for request handler functions
export type ReqHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any;

// Define the type for constructors
export type Constructor<T> = new (...args: any[]) => T;
