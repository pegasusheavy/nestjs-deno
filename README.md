# @pegasus-heavy/nestjs-platform-deno

A NestJS HTTP adapter for the Deno runtime, similar to `@nestjs/platform-express` and `@nestjs/platform-fastify`.

This adapter allows you to run your NestJS applications directly on Deno's native HTTP server (`Deno.serve`) without requiring Express, Fastify, or any other Node.js HTTP framework.

## Features

- 🦕 Native Deno HTTP server support via `Deno.serve`
- 🚀 Full NestJS compatibility
- 📦 Zero external HTTP framework dependencies
- 🔒 Built-in CORS support
- 📁 Static file serving
- 🔄 Middleware support
- 💪 TypeScript first

## Installation

```bash
# Using Deno
deno add jsr:@pegasus-heavy/nestjs-platform-deno npm:@nestjs/common npm:@nestjs/core

# Using npm/pnpm (for Node.js + Deno interop)
pnpm add @pegasus-heavy/nestjs-platform-deno @nestjs/common @nestjs/core
```

## Usage

### Basic Usage

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new DenoAdapter());
  await app.listen(3000);
}

bootstrap();
```

### With CORS

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new DenoAdapter());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://myapp.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
```

### Serving Static Assets

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new DenoAdapter());

  const adapter = app.getHttpAdapter() as DenoAdapter;
  adapter.useStaticAssets('./public', {
    prefix: '/static',
    maxAge: 3600,
  });

  await app.listen(3000);
}

bootstrap();
```

### Custom Error Handler

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new DenoAdapter());

  const adapter = app.getHttpAdapter() as DenoAdapter;
  adapter.setErrorHandler((error, req, res) => {
    console.error('Error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  });

  await app.listen(3000);
}

bootstrap();
```

### Using Express Middleware

The Deno adapter provides full compatibility with Express middleware, allowing you to use the vast ecosystem of existing Express middleware packages.

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

async function bootstrap() {
  const adapter = new DenoAdapter();

  // Use Express middleware directly
  adapter.useExpressMiddleware(helmet());
  adapter.useExpressMiddleware(compression());
  adapter.useExpressMiddleware(morgan('combined'));

  // Apply middleware to specific paths
  adapter.useExpressMiddleware('/api', someApiMiddleware());

  const app = await NestFactory.create(AppModule, adapter);
  await app.listen(3000);
}

bootstrap();
```

### Using Express-style App Object

For middleware that requires an Express app instance (like `express-session`), you can use `getExpressApp()`:

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';
import session from 'express-session';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const adapter = new DenoAdapter();

  // Get an Express-like app interface
  const expressApp = adapter.getExpressApp();

  // Use with middleware that needs app.use()
  expressApp.use(cookieParser());
  expressApp.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }));

  const app = await NestFactory.create(AppModule, adapter);
  await app.listen(3000);
}

bootstrap();
```

### Using Fastify Middleware/Hooks

The Deno adapter also supports Fastify-style hooks and plugins:

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const adapter = new DenoAdapter();

  // Use Fastify hooks directly
  adapter.useFastifyHook('onRequest', async (request, reply) => {
    console.log('Request:', request.method, request.url);
  });

  adapter.useFastifyHook('preHandler', (request, reply, done) => {
    // Validate something
    done();
  });

  const app = await NestFactory.create(AppModule, adapter);
  await app.listen(3000);
}

bootstrap();
```

### Using Fastify Plugins

For Fastify plugins that require a Fastify instance:

```typescript
import { NestFactory } from '@nestjs/core';
import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
import { AppModule } from './app.module.ts';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  const adapter = new DenoAdapter();

  // Register Fastify plugins
  await adapter.registerFastifyPlugin(fastifyCors, { origin: '*' });
  await adapter.registerFastifyPlugin(fastifyHelmet);

  // Or use the Fastify instance directly
  const fastify = adapter.getFastifyInstance();

  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  fastify.decorateRequest('user', null);

  const app = await NestFactory.create(AppModule, adapter);
  await app.listen(3000);
}

bootstrap();
```

## API Reference

### DenoAdapter

The main adapter class that extends NestJS's `AbstractHttpAdapter`.

#### Constructor

```typescript
new DenoAdapter(instance?: unknown)
```

#### Static Methods

- `DenoAdapter.create(options?: NestApplicationOptions): DenoAdapter` - Factory method to create a new adapter instance

#### Instance Methods

- `listen(port: number, callback?: () => void): Promise<void>` - Start the server
- `listen(port: number, hostname: string, callback?: () => void): Promise<void>` - Start the server on a specific hostname
- `close(): Promise<void>` - Gracefully shutdown the server
- `enableCors(options?: DenoCorsOptions): void` - Enable CORS
- `useStaticAssets(path: string, options?: DenoStaticAssetsOptions): void` - Serve static files
- `useExpressMiddleware(middleware: ExpressMiddleware): void` - Use Express middleware
- `useExpressMiddleware(path: string, middleware: ExpressMiddleware): void` - Use Express middleware for a path
- `getExpressApp(): ExpressLikeApp` - Get an Express-compatible app object for middleware
- `useFastifyHook(name: FastifyHookName, hook: FastifyHook): void` - Use a Fastify hook
- `registerFastifyPlugin(plugin, opts?): Promise<void>` - Register a Fastify plugin
- `getFastifyInstance(): FastifyLikeInstance` - Get a Fastify-compatible instance
- `setErrorHandler(handler: Function): void` - Set custom error handler
- `setNotFoundHandler(handler: Function): void` - Set custom 404 handler
- `getHttpServer(): DenoHttpServer | undefined` - Get the underlying Deno server
- `getType(): string` - Returns `'deno'`

### DenoCorsOptions

```typescript
interface DenoCorsOptions {
  origin?: string | string[] | boolean | ((origin: string) => boolean | string);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}
```

### DenoStaticAssetsOptions

```typescript
interface DenoStaticAssetsOptions {
  prefix?: string;
  index?: string | boolean;
  redirect?: boolean;
  maxAge?: number;
  immutable?: boolean;
  dotfiles?: 'allow' | 'deny' | 'ignore';
  etag?: boolean;
  lastModified?: boolean;
}
```

## Requirements

- Deno 1.40+ (for `Deno.serve` API)
- NestJS 10.0.0+ or 11.0.0+

## Compatibility

This adapter is designed to be a drop-in replacement for the Express or Fastify adapters. Most NestJS features work out of the box:

- ✅ Controllers and routing
- ✅ Dependency injection
- ✅ Middleware (native + Express + Fastify)
- ✅ Express middleware compatibility (helmet, compression, morgan, etc.)
- ✅ Fastify hooks and plugins (@fastify/cors, @fastify/helmet, etc.)
- ✅ Guards
- ✅ Interceptors
- ✅ Pipes
- ✅ Exception filters
- ✅ CORS
- ✅ Static file serving
- ✅ Cookie handling
- ✅ Request/Reply decorators (Fastify-style)
- ⚠️ View engines (not implemented in base adapter)
- ⚠️ WebSockets (requires separate adapter)

## License

MIT © Pegasus Heavy Industries LLC
