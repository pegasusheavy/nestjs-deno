/**
 * @module @pegasus-heavy/nestjs-platform-deno
 *
 * NestJS HTTP adapter for the Deno runtime.
 *
 * This package provides a platform adapter that allows NestJS applications
 * to run on Deno's native HTTP server (Deno.serve) without requiring
 * Express, Fastify, or other Node.js HTTP frameworks.
 *
 * @example
 * ```typescript
 * import { NestFactory } from '@nestjs/core';
 * import { DenoAdapter } from '@pegasus-heavy/nestjs-platform-deno';
 * import { AppModule } from './app.module.ts';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule, new DenoAdapter());
 *   await app.listen(3000);
 * }
 * bootstrap();
 * ```
 *
 * @example Express Middleware Support
 * ```typescript
 * import helmet from 'helmet';
 * import compression from 'compression';
 *
 * const adapter = new DenoAdapter();
 * adapter.useExpressMiddleware(helmet());
 * adapter.useExpressMiddleware(compression());
 *
 * const app = await NestFactory.create(AppModule, adapter);
 * await app.listen(3000);
 * ```
 */

// Main adapter export
export { DenoAdapter } from './adapters/deno-adapter.js';
export type { DenoRequest, DenoResponse } from './adapters/deno-adapter.js';

// Interface exports
export type {
  DenoHttpOptions,
  DenoHttpServer,
  DenoCorsOptions,
  DenoStaticAssetsOptions,
  DenoBodyParserOptions,
} from './interfaces/deno-http-options.interface.js';

export type { NestDenoApplication } from './interfaces/nest-deno-application.interface.js';

// Express compatibility exports
export {
  wrapExpressMiddleware,
  createExpressRequest,
  createExpressResponse,
} from './compat/express-compat.js';

export type {
  ExpressCompatRequest,
  ExpressCompatResponse,
  ExpressMiddleware,
  ExpressErrorMiddleware,
  ExpressNextFunction,
  ExpressLikeApp,
  CookieOptions,
} from './compat/express-compat.js';

// Fastify compatibility exports
export {
  wrapFastifyHook,
  wrapFastifyPlugin,
  createFastifyRequest,
  createFastifyReply,
  createFastifyLogger,
} from './compat/fastify-compat.js';

export type {
  FastifyCompatRequest,
  FastifyCompatReply,
  FastifyHook,
  FastifyHookAsync,
  FastifyHookCallback,
  FastifyHookName,
  FastifyDoneCallback,
  FastifyErrorHook,
  FastifyOnSendHook,
  FastifyPlugin,
  FastifyPluginAsync,
  FastifyRouteHandler,
  FastifyRouteOptions,
  FastifyLikeInstance,
  FastifyLogger,
} from './compat/fastify-compat.js';
