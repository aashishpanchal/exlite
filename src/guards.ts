import {type ErrorRequestHandler} from 'express';
import {HttpError, InternalServerError} from './errors';

type Options = {
  dev?: boolean;
  write?: (err: unknown) => void;
};

/**
 * Express middleware to handle `HttpError` and unknown errors.
 *
 * - Sends JSON response for `HttpError` instances.
 * - Logs unknown errors and sends generic error response.
 * - Includes detailed error info in development (`dev`).
 *
 * @param {Object} [options] - Options for error handling.
 * @param {boolean} [options.dev=true] - Show detailed error info in development. default `true`
 * @param {(err: unknown) => void} [options.write] - Function to log unknown errors. `optional`
 *
 * @returns {ErrorRequestHandler} - Middleware for handling errors.
 *
 * @example
 * // Basic usage with default options:
 * app.use(errorHandler({ dev: process.env.NODE_ENV !== 'production' }));
 *
 * // Custom usage with logging in production mode:
 * app.use(errorHandler({
 *  dev: process.env.NODE_ENV !== 'production',
 *  write: err => logger.error(err)
 * }));
 */
export const errorHandler = (options: Options = {}): ErrorRequestHandler => {
  const {dev = true, write} = options;
  return (err, req, res, next): any => {
    // Handle known HttpError instances
    if (HttpError.isHttpError(err))
      return res.status(err.status).json(err.toJson());

    // Log unknown errors if a write function is provided
    write?.(err);

    // Create an InternalServerError for unknown errors
    const error = new InternalServerError(
      dev ? err.message : 'Something went wrong',
      dev ? err.stack : null,
    );
    return res.status(error.status).json(error.toJson());
  };
};

/**
 * Middleware to handle `HttpError` instances in Express.
 *
 * - Sends JSON response with the error status and message.
 * - Passes non-HttpError errors to the next middleware.
 *
 * @returns {ErrorRequestHandler} - Middleware for handling HTTP-specific errors.
 *
 * @example
 * app.use(httpErrorHandler);
 */
export const httpErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): any => {
  // Handle known HttpError instance
  if (HttpError.isHttpError(err))
    return res.status(err.status).json(err.toJson());
  // unknown error to forward next middleware
  next(err);
};
