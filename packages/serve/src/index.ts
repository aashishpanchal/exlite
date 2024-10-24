import path from 'path';
import express, {RequestHandler, Router} from 'express';
import {match} from 'path-to-regexp';

type Options = {
  rootPath?: string;
  renderPath?: string;
  exclude?: string[];
};

/**
 * Middleware for serving static files and handling SPA routing in Express.js.
 * Serves static files from a directory and returns an `index.html` for unmatched routes, excluding specified patterns.
 *
 * @param {Options} [options={}] - Middleware options.
 * @param {string} [options.rootPath='public'] - Directory to serve static files from.
 * @param {string} [options.renderPath='*'] - Route pattern to serve the SPA index file.
 * @param {string[]} [options.exclude=['/api{/*path}']] - Routes to exclude from SPA handling.
 *
 * @returns {Router} - Express Router for static file serving and SPA routing.
 */
export const serveStatic = ({
  rootPath = path.join(process.cwd(), 'public'),
  renderPath = '*',
  exclude = ['/api{/*path}'],
}: Options = {}): Router => {
  const indexFile = path.join(rootPath, 'index.html');
  const excludeMatchers = exclude.map(pattern => match(pattern, {end: false}));

  // Determines if the route is excluded
  const isExcluded = (pathname: string) =>
    excludeMatchers.some(matcher => matcher(pathname));

  // Renders the index file for non-excluded routes
  const renderIndex: RequestHandler = (req, res, next) =>
    isExcluded(req.originalUrl.split('?')[0])
      ? next()
      : res.sendFile(indexFile);

  return express
    .Router()
    .use(express.static(rootPath, {index: false}))
    .get(renderPath, renderIndex);
};
