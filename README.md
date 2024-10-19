# ExLite

[![npm](https://img.shields.io/npm/dm/exlite.svg)](https://www.npmjs.com/package/exlite)
[![npm](https://img.shields.io/npm/v/exlite.svg)](https://www.npmjs.com/package/exlite)

`exlite` is a lightweight utility library for Express.js that simplifies common server-side tasks.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Error Handling Middleware: `errorHandler`](#error-handling-middleware-errorhandler)
- [Wrapper: Simplifying Controllers](#wrapper-simplifying-controllers)
- [Http-Error](#http-error)
- [Http-Status](#http-status)
- [Standardized JSON Responses with `ApiRes`](#standardized-json-responses-with-apires)
- [Controller Class with `createController`](#controller-class-with-createcontroller)
- [Conclusion](#conclusion)
- [Contributing](#contributing)
- [Author](#author)

### Features:

- Simplifies route and controller management with pre-built helpers.
- Integrated error handling across all routes and middleware.
- Easy-to-use wrapper for automatically catching and handling errors.
- Customizable response formatting for consistent API outputs.
- Built-in support for dependency injection with [`tsyringe`](https://github.com/Microsoft/tsyringe).
- Flexible error handling with custom error classes.
- Efficient management of HTTP status codes and responses.

### Installation

Install by **`npm`**

```bash
npm install --save exlite
```

## Quick Start

Here’s a minimal setup to get you started with `exlite`:

```tsx
import express from 'express';
import {wrapper, errorHandler} from 'exlite';

const app = express();

// Middleware
app.use(express.json());

// Example route using wrapper
const getUser = wrapper(async (req, res) => {
  const user = await getUserById(req.params.id);
  return ApiRes.ok(user); // Send user data in the response
});

// Routers
app.get('/user/:id', getUser);

// Error handling middleware
app.use(errorHandler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Error Handling Middleware: `errorHandler`

`errorHandler({isDev: boolean, write?: (err) => void}): ErrorRequestHandler` Global error handler middleware that manages `HttpErrors` and unknown errors, returning appropriate JSON responses.

**Usage:**

```tsx
import {errorHandler} from 'exlite';

app.use(errorHandler()); // Place this after route definitions
```

_Note:_

- _`isDev` A flag that indicates whether the application is running in development mode. If true, error responses will include detailed information like the error message and stack trace. Defaults to true._
- _`write` An optional callback function that logs or processes unknown errors. This can be used to log errors to a file or an external service for further inspection.._

## Wrapper: Simplifying Controllers

In Express.js applications, request handler functions typically require `try-catch` blocks for error handling. This often results in repetitive, boilerplate code across route handlers. The `wrapper` function in `exlite` solves this issue by automatically managing `try-catch` behaviour for both async and sync functions. and provide other handler of features.

**Usage:**

```tsx
import {wrapper, ApiRes} from 'exlite';

// Route without wrapper (traditional approach with try-catch)
app.get('/user/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Route using wrapper (simplified with exlite)
app.get(
  '/user/:id',
  wrapper(async (req, res) => {
    const user = await getUserById(req.params.id); // Fetch user from database
    return ApiRes.ok(user, 'User fetched successfully'); // Send success response using ApiRes
  }),
);
```

- **Example of manipulating cookies and header, etc with `ApiRes`**

```tsx
const login = wrapper(async (req, res) => {
  const {email, password} = req.body;
  const user = await loginUser(email, password);

  // Manually setting headers
  res.setHeader('X-Custom-Header', 'SomeHeaderValue');

  // Set multiple cookies for authentication
  res.cookie('access-token', user.accessToken, {
    httpOnly: true,
    secure: true, // Set to true in production with HTTPS
    maxAge: 3600000, // 1 hour
  });

  res.cookie('refresh-token', user.refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 3600000, // 1 week
  });

  // api-response with token and user info
  return ApiRes.ok(user, 'Logged in successfully');
});
```

- **Example without `ApiRes`**

```tsx
// 1. example
const getHome = wrapper(() => 'Hello World!');
// 2. example
const getHome = wrapper(() => ({message: 'Hello World!'}));
// 3. example
const login = wrapper(async (req, res) => {
  const user = await getUserById(req.params.id);

  // Manually setting headers
  res.setHeader('X-Custom-Header', 'SomeHeaderValue');

  // Setting cookies
  res.cookie('access-token', user.accessToken, {
    httpOnly: true,
    secure: true, // Set to true in production with HTTPS
    maxAge: 3600000, // 1 hour
  });

  // Sending a custom JSON response
  return res.status(200).json({
    status: 'success',
    message: 'User fetched successfully',
    data: user,
  });
});
```

- **Example as `middleware`**

```tsx
import {Role} from './constants';
import {wrapper, ForbiddenError} from 'exlite';

/** user permission middleware */
export const permission = (...roles: Role[]) =>
  wrapper(async (req, _, next) => {
    const {user} = req;

    if (!roles || !user) return false;

    const checker = user && roles.includes(user?.role);

    if (!checker)
      throw new ForbiddenError(
        `User have not permission to access ${req.originalUrl}`,
      );

    next();
  });

// all permission middleware
export const onlyAdmin = permission(Role.ADMIN);
export const adminOrUser = permission(Role.ADMIN, Role.USER);
```

## Http-Error

The `HttpError` class standardizes error handling by extending the native `Error` class. It’s used to throw HTTP-related errors, which are then caught by the `errorHandler` middleware.

**Usage:**

```tsx
import {HttpError, HttpStatus} from 'exlite';

// Example without wrapper
app.get('*', () => {
  throw new HttpError('Not Found', HttpStatus.NOT_FOUND); // Throw a 404 error
});

// Example with wrapper
app.post(
  '/example',
  wrapper(req => {
    if (!req.body.name) throw new BadRequestError('Name is required');
  }),
);
```

**HttpError(msg, status, details)**

- `msg` - this parameter accepts an error message, which can be a single string or an array of strings., `required`
- `status` - the status code of the error, mirroring `statusCode` for general compatibility, default is `500`
- `detail` - this is an `optional` plain object that contains additional information about the error.

```tsx
const err = new HttpError('Validation error.', 400, {
  username: 'Username is required',
  password: 'Password is required',
});
```

**Provide build common http-errors.**

- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `ConflictError`
- `ForbiddenError`
- `InternalServerError`

_Note: If only provides a status code, the `HttpError` class will automatically generate an appropriate error name based on that status code._

## Http-Status

The `HttpStatus` is utility to interact with HTTP status codes. **(2xx, 3xx, 4xx and 5xx)**.

**Usage:**

```tsx
import {HttpStatus} from 'exlite';

app.get('/status-example', (req, res) => {
  res.status(HttpStatus.OK).json({message: 'All good!'});
});
```

## Standardized JSON Responses with `ApiRes`

`ApiRes` provides a consistent structure for API responses. It includes several static methods that handle common response patterns, such as `ok`, `created` `paginated`.

**Usage:**

```tsx
import {ApiRes} from 'exlite';

// with paginated
const list = wrapper(async req => {
  const {data, meta} = await getUsers(req.query);
  return ApiRes.paginated(data, meta, 'Get users list successfully');
});

// with created
const create = wrapper(async req => {
  const user = await createUser(req.body);
  return ApiRes.created(user, 'User created successfully');
});

// with ok
const get = wrapper(async req => {
  const user = await getUser(req.params);
  return ApiRes.ok(user, 'Get user successfully');
});

// Routers
app.route('/').get(list).post(create);
app.route('/:id').get(get);
```

**ApiRes Methods**

- `ok(result, message)`: Returns a success response (HTTP 200).
- `created(result, message)`: Returns a resource creation response (HTTP 201).
- `paginated(data, meta, message)`: Returns a success response (HTTP 200).

## Controller Class with `createController`

Creating class-based controllers in Express.js can be complex due to the need for managing instance methods, binding this context, and handling dependencies. Traditional middleware functions typically rely on plain functions, making it challenging to encapsulate logic and state effectively in a class-based structure.

The `createController` function simplifies this process by providing an easy way to create class-based controllers and automatically handling method references internally. This allows developers to focus on their application logic rather than the boilerplate code required for class-based controllers.

`createController(cls, useTsyringe)`

- `cls` A class constructor function representing the controller.
- `useTsyringe` (optional): A boolean indicating whether to use `tsyringe` for dependency injection. Defaults to `true`.

**Usage:** without `tsyringe`

```tsx
// create a controller with a local instance.
const controller = createController(Controller, false);
...
// Retrieves and wraps a controller method for Express routes.
const handler = controller.getMethod('class-method-name');
```

- Controller `class`

```tsx
// auth.controller.ts
import {ApiRes} from 'exlite';
import {AuthService} from './auth.service';
import type {Request, Response} from 'express';

/** AuthController Class */
export class AuthController {
  #service = new AuthService(); // auth-service instance

  /** signin request handler */
  async signin(req: Request, res: Response) {
    const user = await this.#service.signin(req.body);
    return ApiRes.ok(user, 'User signed in successfully');
  }

  /** signup request handler */
  async signup(req: Request, res: Response) {
    const user = await this.#service.signup(req.body);
    return ApiRes.created(user, 'User signed up successfully');
  }
}
```

- Router configuration

```jsx
// auth.routes.ts
import {Router} from 'express';
import {createController} from 'exlite';
import {AuthController} from './auth.controller';

// Router
export const authRouter = Router();

// Create controller without using tsyrine
const auth = createController(AuthController, false);

// Initilize Routers
authRouter
  .post('/signin', auth.getMethod('signin'))
  .post('/signup', auth.getMethod('signup'));
```

### **if you want go with `tsyringe`**

you need to configure your project as follows:

1.  Install `tsyringe`:

    ```bash
    npm install tsyringe reflect-metadata
    ```

2.  Configure TypeScript:
    Add the following to your `tsconfig.json`:
    ```json
    {
      "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
      }
    }
    ```
3.  Import `reflect-metadata` in your main file (e.g., `app.ts` or `server.ts`):

    ```tsx
    import 'reflect-metadata';
    ```

**Usage:**

```jsx
// Create a controller with leverage the tsyringe dependency injection system.
const controller = createController(Controller); // Using tsyringe
...
// Retrieves and wraps a controller method for Express routes.
const handler = controller.getMethod('class-method-name');
```

- Service `class`

```tsx
// auth.service.ts
import {singleton} from 'tsyringe';

@singleton()
export class AuthService {
  async signin(data: object) {
    ''''
  }

  async signup(data: object) {
    ''''
  }
}
```

- Controller `class`

```tsx
// auth.controller.ts
import {singleton} from 'tsyringe';
import {AuthService} from './auth.service.ts';
import type {Request, Response} from 'express';

@singleton()
export class AuthController {
  constructor(private authService: AuthService) {}

  /** signin request handler */
  async signin(req: Request, res: Response) {
    const {access, refresh, user} = await this.authService.signin(req.body);
    res.cookie('access-token', access.token, {
      httpOnly: true,
      maxAge: access.maxAge,
    });
    res.cookie('refresh-token', refresh.token, {
      httpOnly: true,
      maxAge: refresh.maxAge,
    });
    return ApiRes.ok(user.id, 'User logged in successfully');
  }

  /** signup request handler */
  async signup(req: Request, res: Response) {
    const user = await this.authService.signup(req.body);
    return ApiRes.created(user.id, 'User created successfully');
  }
}
```

- Router configuration

```tsx
// auth.routes.ts
import {Router} from 'express';
import {createController} from 'exlite';
import {AuthController} from './auth.controller.ts';

// Router
export const authRouter = Router();

// Controller
const auth = createController(AuthController);

// Initilize Routers
authRouter
  .post('/signin', auth.getMethod('signin'))
  .post('/signup', auth.getMethod('signup'));
```

**_Note:_** _The `createController` is an feature that allows you to use `tsyringe` for dependency injection in your controllers. This is especially useful for larger applications where different services need to be injected into controllers._

## Conclusion

`exlite` is a powerful tool designed to simplify and enhance Express.js applications by providing essential features out of the box. Whether you’re building a simple API or a complex web application, `exlite` helps you maintain clean and manageable code.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

**Disclaimer:** This library is currently under development. While contributions are appreciated, there is no need to start begging for features or fixes.

## Author

- Aashish Panchal [@aashishpanchal](https://github.com/aashishpanchal)
