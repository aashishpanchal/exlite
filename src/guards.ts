import {type ErrorRequestHandler} from 'express';
import {HttpError, InternalServerError} from './errors';

type Options = {
  isDev?: boolean;
  write?: (err: unknown) => void;
};

/**
 * Creates an Express error-handling middleware function.
 *
 * This middleware handles both known errors (instances of `HttpError`) and unknown errors, providing appropriate
 * JSON responses based on the environment (development or production). In development mode (`isDev`), the middleware
 * includes detailed error messages and stack traces in the response for easier debugging. In production mode, error
 * details are omitted for security reasons.
 *
 * @param {Object} [options] - The configuration options for the error handler.
 * @param {boolean} [options.isDev=true] - A flag that indicates whether the application is running in development mode.
 * If `true`, error responses will include detailed information like the error message and stack trace. Defaults to `true`.
 * @param {(err: unknown) => void} [options.write] - An optional callback function that logs or processes unknown errors.
 * This can be used to log errors to a file or an external service for further inspection.
 *
 * @returns {ErrorRequestHandler} - An Express middleware function that intercepts errors, providing appropriate JSON
 * responses based on the error type and environment.
 *
 * @example
 * // Basic usage with default options:
 * app.use(errorHandler());
 *
 * @example
 * // Custom usage with logging in production mode:
 * app.use(errorHandler({
 *   isDev: process.env.NODE_ENV !== 'production',
 *   write: (err) => logger.error(err)
 * }));
 */
export const errorHandler =
  ({isDev, write}: Options = {isDev: true}): ErrorRequestHandler =>
  (err, req, res, next): any => {
    // Handle known HttpError instances
    if (err instanceof HttpError)
      return res.status(err.status).json(err.toJson());

    // Log unknown errors if a write function is provided
    write?.(err);

    // Create an InternalServerError for unknown errors
    const error = new InternalServerError(
      isDev ? err.message : 'Something went wrong',
      isDev ? err.stack : null,
    );
    return res.status(error.status).json(error.toJson());
  };
