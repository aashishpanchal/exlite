import {type ErrorRequestHandler, Router} from 'express';
import {HttpError, InternalServerError, NotFoundError} from './errors';

/**
 * Global error handler middleware.
 * Handles HttpErrors and unknown errors, returning appropriate JSON responses.
 * @param {boolean} isDev - Indicates if the application is in development mode.
 * @returns {ErrorRequestHandler} Express error handling middleware function.
 */
export const errorHandler =
  (isDev: boolean = true): ErrorRequestHandler =>
  (err, req, res, next): any => {
    // http-error handler
    if (err instanceof HttpError)
      return res.status(err.status).json(err.toJson());
    // unknown-error handler
    if (isDev) console.error(err);
    const error = new InternalServerError(
      err.message,
      isDev ? err.stack : null,
    );
    return res.status(error.status).json(error.toJson());
  };

/**
 * Creates a router to handle 404 Not Found errors.
 * @returns {Router} Express router that catches all unmatched routes and returns a NotFoundError.
 */
export const notFoundHandler = (): Router =>
  Router().all('*', (req, res) => {
    const err = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`, {
      url: req.originalUrl,
      method: req.method,
    });
    res.status(err.status).json(err.toJson());
  });
