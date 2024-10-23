import path from 'path';
import express from 'express';
import {match} from 'path-to-regexp';
import type {Request, RequestHandler, Router} from 'express';

type Options = {
  root?: string;
  render?: string;
  exclude?: string[];
};

/**
 * Creates an Express middleware to serve static files and handle routing for a Single Page Application (SPA).
 *
 * This middleware serves static content from a specified directory and returns an index file
 * for any unmatched routes, except those defined in the exclude patterns.
 *
 * @param {Options} [options={}] - Configuration options.
 * @param {string} [options.root='public'] - Directory for static files (default: '`public`' in the current working directory).
 * @param {string} [options.render='*'] - Route pattern to render the index file (default: '`*`').
 * @param {string[]} [options.exclude=['/api{/*path}']] - Routes to exclude from SPA handling (default: excludes `API` routes).
 *
 * @returns {Router} - An Express Router instance for serving static files and SPA routing.
 *
 * @example
 * app.use(serveStatic());
 */
export const serveStatic = (options: Options = {}): Router => {
  const {
    root = path.join(process.cwd(), 'public'),
    render = '*',
    exclude = ['/api{/*path}'],
  } = options;

  const indexFile = path.join(root, 'index.html');
  const excludeMatchers = exclude.map(pattern => match(pattern, {end: false}));

  /**
   * Checks if the request's URL matches any excluded patterns.
   * @param {Request} req - The incoming request.
   * @returns {boolean} True if the route is excluded, false otherwise.
   */
  const isRouteExcluded = (req: Request) => {
    const pathname = req.originalUrl.split('?')[0]; // Use split to get pathname efficiently
    return excludeMatchers.some(matcher => matcher(pathname));
  };

  const renderFile: RequestHandler = (req, res, next) => {
    if (!isRouteExcluded(req)) {
      res.sendFile(indexFile);
    } else {
      next();
    }
  };

  return express
    .Router()
    .use(express.static(root, {index: false}))
    .get(render, renderFile);
};
