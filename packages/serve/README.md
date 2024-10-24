# @exlite/serve

[@exlite/serve](https://github.com/aashishpanchal/exlite/tree/main/packages/serve) is an Express.js middleware designed for serving static files and handling routing in Single Page Applications (SPA). Inspired by [`@nestjs/serve-static`](https://docs.nestjs.com/recipes/serve-static), it simplifies the process of serving static assets and routing client-side navigation to an index file, making it ideal for projects that rely on frameworks like React, Angular, or Vue.

## Features

- **Serve Static Files**: Easily serve static assets like HTML, CSS, JavaScript, and images.
- **SPA Routing Support**: Automatically serve the `index.html` file for any unmatched routes, allowing client-side routing in SPAs.
- **Exclude Specific Routes**: Flexibly exclude specific routes (e.g., `/api`) from SPA handling, so they can be handled by other middleware or routers.
- **Customizable**: Adjust the root directory for static files and define routes that need to be excluded.

## Installation

To install `@exlite/serve`, run:

```bash
npm install @exlite/serve
```

## Basic Usage

Here’s a simple example that shows how to use `@exlite/serve` in an Express application:

```typescript
import express from 'express';
import {serveStatic} from '@exlite/serve';

const app = express();

// Serve static files and handle SPA routing
app.use(serveStatic());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

In this basic setup:

- Static files are served from the default `public` directory.
- Any route not starting with `/api` will return the `index.html` file, allowing an SPA to handle routing.

## Options

`@exlite/serve` accepts an options object to customize its behavior:

### `rootPath` (optional)

Specifies the directory to serve static files from. Defaults to a `public` directory in the current working directory.

```typescript
app.use(serveStatic({rootPath: path.join(__dirname, 'dist')}));
```

In this case, static files are served from the `dist` folder.

### `renderPath` (optional)

Defines which routes should return the `index.html` file. By default, all routes (`*`) return the SPA’s index file if they aren’t excluded.

```typescript
app.use(serveStatic({renderPath: '*'}));
```

This will serve the `index.html` file for all unmatched routes.

### `exclude` (optional)

An array of route patterns to exclude from SPA handling. These routes can be reserved for APIs or other server-side routes. The default is `['/api{/*path}']`, which excludes any routes starting with `/api`.

```typescript
app.use(serveStatic({exclude: ['/auth{/*path}', '/api{/*path}']}));
```

This setup ensures that both `/auth` and `/api` routes are excluded from SPA routing and can be handled separately.

## Advanced Usage

### Serving Static Files from a Custom Directory

If your static assets are located in a different directory (e.g., `dist`), you can specify it using the `rootPath` option:

```typescript
app.use(
  serveStatic({
    rootPath: path.join(__dirname, 'dist'),
  }),
);
```

This serves static files from the `dist` folder and uses `index.html` in that folder for routing.

### Excluding Multiple Routes

You can exclude multiple patterns, like API routes or authentication-related routes, from being handled as part of your SPA. This ensures those routes can be handled by different routers or middleware:

```typescript
app.use(
  serveStatic({
    exclude: ['/api{/*path}', '/auth{/*path}'],
  }),
);
```

This configuration excludes routes that start with `/api` and `/auth`, allowing them to be processed separately.

## Example with API Integration

Here’s an example of how `@exlite/serve` works alongside API routes in an Express.js application:

```typescript
import express from 'express';
import {serveStatic} from '@exlite/serve';

const app = express();

// Serve static files and handle SPA routing, excluding `/api` routes
app.use(
  serveStatic({
    rootPath: path.join(__dirname, 'public'),
    exclude: ['/api{/*path}'],
  }),
);

// Define API routes
app.get('/api/users', (req, res) => {
  res.json([{id: 1, name: 'John Doe'}]);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

In this example:

- API routes starting with `/api` are excluded from SPA handling and processed separately.
- All other routes serve the `index.html` file from the `public` directory, allowing the SPA to handle client-side routing.

## Inspiration

This library is inspired by [`@nestjs/serve-static`](https://docs.nestjs.com/recipes/serve-static), bringing similar static file serving functionality to Express.js environments in a lightweight and flexible way.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/aashishpanchal/exlite/blob/main/LICENSE) file for more information.
