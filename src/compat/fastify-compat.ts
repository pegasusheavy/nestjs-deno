import type { DenoRequest, DenoResponse } from '../adapters/deno-adapter.js';

/**
 * Fastify-compatible Request interface
 * Provides a compatibility layer for Fastify middleware and hooks
 */
export interface FastifyCompatRequest {
  // Core properties
  id: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  raw: Request;

  // URL info
  url: string;
  originalUrl: string;
  method: string;
  hostname: string;
  ip: string | undefined;
  protocol: 'http' | 'https';

  // Routing
  routerPath?: string;
  routerMethod?: string;

  // Validation
  validationError?: Error;

  // Custom properties storage
  [key: string]: unknown;
}

/**
 * Fastify-compatible Reply interface
 * Provides a compatibility layer for Fastify middleware and hooks
 */
export interface FastifyCompatReply {
  // Status
  statusCode: number;
  sent: boolean;

  // Methods - all return this for chaining
  code(statusCode: number): this;
  status(statusCode: number): this;

  // Headers
  header(key: string, value: string | number | boolean): this;
  headers(headers: Record<string, string | number | boolean>): this;
  getHeader(key: string): string | undefined;
  getHeaders(): Record<string, string | undefined>;
  removeHeader(key: string): this;
  hasHeader(key: string): boolean;

  // Body
  send(payload?: unknown): this;

  // Serialization
  serialize(payload: unknown): string;
  serializer(fn: (payload: unknown) => string): this;

  // Type
  type(contentType: string): this;

  // Redirect
  redirect(url: string): this;
  redirect(statusCode: number, url: string): this;

  // Utility
  callNotFound(): void;
  getResponseTime(): number;

  // Raw access
  raw: DenoResponse;

  // Custom properties
  [key: string]: unknown;
}

/**
 * Fastify hook types
 */
export type FastifyHookName =
  | 'onRequest'
  | 'preParsing'
  | 'preValidation'
  | 'preHandler'
  | 'preSerialization'
  | 'onSend'
  | 'onResponse'
  | 'onError'
  | 'onTimeout'
  | 'onReady'
  | 'onClose';

/**
 * Fastify done callback
 */
export type FastifyDoneCallback = (err?: Error) => void;

/**
 * Fastify hook function (callback style)
 */
export type FastifyHookCallback = (
  request: FastifyCompatRequest,
  reply: FastifyCompatReply,
  done: FastifyDoneCallback,
) => void;

/**
 * Fastify hook function (async style)
 */
export type FastifyHookAsync = (
  request: FastifyCompatRequest,
  reply: FastifyCompatReply,
) => Promise<void>;

/**
 * Fastify hook function (either style)
 */
export type FastifyHook = FastifyHookCallback | FastifyHookAsync;

/**
 * Fastify onError hook
 */
export type FastifyErrorHook = (
  request: FastifyCompatRequest,
  reply: FastifyCompatReply,
  error: Error,
  done: FastifyDoneCallback,
) => void;

/**
 * Fastify onSend hook with payload
 */
export type FastifyOnSendHook = (
  request: FastifyCompatRequest,
  reply: FastifyCompatReply,
  payload: unknown,
  done: (err?: Error, payload?: unknown) => void,
) => void;

/**
 * Fastify plugin function
 */
export type FastifyPlugin<Options = Record<string, unknown>> = (
  instance: FastifyLikeInstance,
  opts: Options,
  done: FastifyDoneCallback,
) => void;

/**
 * Fastify async plugin function
 */
export type FastifyPluginAsync<Options = Record<string, unknown>> = (
  instance: FastifyLikeInstance,
  opts: Options,
) => Promise<void>;

/**
 * Fastify route handler
 */
export type FastifyRouteHandler = (
  request: FastifyCompatRequest,
  reply: FastifyCompatReply,
) => unknown | Promise<unknown>;

/**
 * Fastify route options
 */
export interface FastifyRouteOptions {
  method: string | string[];
  url: string;
  handler: FastifyRouteHandler;
  schema?: unknown;
  preValidation?: FastifyHook | FastifyHook[];
  preHandler?: FastifyHook | FastifyHook[];
  preSerialization?: FastifyOnSendHook | FastifyOnSendHook[];
  onRequest?: FastifyHook | FastifyHook[];
  onResponse?: FastifyHook | FastifyHook[];
  onSend?: FastifyOnSendHook | FastifyOnSendHook[];
  onError?: FastifyErrorHook | FastifyErrorHook[];
}

/**
 * Fastify-like instance interface
 */
export interface FastifyLikeInstance {
  // Decorators
  decorate(name: string, value: unknown): this;
  decorateRequest(name: string, value: unknown): this;
  decorateReply(name: string, value: unknown): this;
  hasDecorator(name: string): boolean;
  hasRequestDecorator(name: string): boolean;
  hasReplyDecorator(name: string): boolean;

  // Hooks
  addHook(name: 'onRequest', hook: FastifyHook): this;
  addHook(name: 'preParsing', hook: FastifyHook): this;
  addHook(name: 'preValidation', hook: FastifyHook): this;
  addHook(name: 'preHandler', hook: FastifyHook): this;
  addHook(name: 'preSerialization', hook: FastifyOnSendHook): this;
  addHook(name: 'onSend', hook: FastifyOnSendHook): this;
  addHook(name: 'onResponse', hook: FastifyHook): this;
  addHook(name: 'onError', hook: FastifyErrorHook): this;
  addHook(name: FastifyHookName, hook: FastifyHook | FastifyErrorHook | FastifyOnSendHook): this;

  // Plugin registration
  register<Options = Record<string, unknown>>(
    plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>,
    opts?: Options,
  ): this;

  // Routes
  route(opts: FastifyRouteOptions): this;
  get(path: string, handler: FastifyRouteHandler): this;
  get(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  post(path: string, handler: FastifyRouteHandler): this;
  post(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  put(path: string, handler: FastifyRouteHandler): this;
  put(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  delete(path: string, handler: FastifyRouteHandler): this;
  delete(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  patch(path: string, handler: FastifyRouteHandler): this;
  patch(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  options(path: string, handler: FastifyRouteHandler): this;
  options(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  head(path: string, handler: FastifyRouteHandler): this;
  head(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;
  all(path: string, handler: FastifyRouteHandler): this;
  all(path: string, opts: Partial<FastifyRouteOptions>, handler: FastifyRouteHandler): this;

  // Settings
  log: FastifyLogger;
  prefix: string;
}

/**
 * Fastify logger interface
 */
export interface FastifyLogger {
  info(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
  debug(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  trace(msg: string, ...args: unknown[]): void;
  fatal(msg: string, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): FastifyLogger;
}

// Generate unique request IDs
let requestIdCounter = 0;
function generateRequestId(): string {
  return `req-${Date.now()}-${++requestIdCounter}`;
}

/**
 * Convert Deno Headers to Fastify-style headers object
 */
function headersToObject(headers: Headers): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = {};
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    const existing = result[lowerKey];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[lowerKey] = [existing, value];
      }
    } else {
      result[lowerKey] = value;
    }
  });
  return result;
}

/**
 * Create a Fastify-compatible request from a DenoRequest
 */
export function createFastifyRequest(denoReq: DenoRequest): FastifyCompatRequest {
  const headersObj = headersToObject(denoReq.headers);

  const req: FastifyCompatRequest = {
    id: generateRequestId(),
    params: denoReq.params,
    query: denoReq.query,
    body: denoReq.body,
    headers: headersObj,
    raw: denoReq.raw,
    url: denoReq.originalUrl || denoReq.path || '/',
    originalUrl: denoReq.originalUrl || denoReq.path || '/',
    method: denoReq.method,
    hostname: denoReq.hostname || '',
    ip: denoReq.ip,
    protocol: denoReq.secure ? 'https' : 'http',
    routerPath: denoReq.path,
    routerMethod: denoReq.method,
  };

  return req;
}

/**
 * Create a Fastify-compatible reply from a DenoResponse
 */
export function createFastifyReply(denoRes: DenoResponse): FastifyCompatReply {
  let serializer: (payload: unknown) => string = JSON.stringify;
  const startTime = Date.now();

  const reply: FastifyCompatReply = {
    get statusCode() {
      return denoRes.statusCode;
    },
    set statusCode(code: number) {
      denoRes.statusCode = code;
    },
    get sent() {
      return denoRes.headersSent;
    },

    raw: denoRes,

    code(statusCode: number) {
      denoRes.status(statusCode);
      return this;
    },

    status(statusCode: number) {
      return this.code(statusCode);
    },

    header(key: string, value: string | number | boolean) {
      denoRes.setHeader(key, String(value));
      return this;
    },

    headers(headers: Record<string, string | number | boolean>) {
      Object.entries(headers).forEach(([key, value]) => {
        denoRes.setHeader(key, String(value));
      });
      return this;
    },

    getHeader(key: string) {
      return denoRes.getHeader(key) || undefined;
    },

    getHeaders() {
      const result: Record<string, string | undefined> = {};
      denoRes.headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    },

    removeHeader(key: string) {
      denoRes.removeHeader(key);
      return this;
    },

    hasHeader(key: string) {
      return denoRes.getHeader(key) !== null;
    },

    send(payload?: unknown) {
      if (payload === undefined) {
        denoRes.end();
      } else if (typeof payload === 'string') {
        if (!denoRes.getHeader('Content-Type')) {
          denoRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
        denoRes.send(payload);
      } else if (payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
        if (!denoRes.getHeader('Content-Type')) {
          denoRes.setHeader('Content-Type', 'application/octet-stream');
        }
        denoRes.send(payload as BodyInit);
      } else if (typeof payload === 'object') {
        if (!denoRes.getHeader('Content-Type')) {
          denoRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        denoRes.send(serializer(payload));
      } else {
        denoRes.send(String(payload));
      }
      return this;
    },

    serialize(payload: unknown) {
      return serializer(payload);
    },

    serializer(fn: (payload: unknown) => string) {
      serializer = fn;
      return this;
    },

    type(contentType: string) {
      denoRes.setHeader('Content-Type', contentType);
      return this;
    },

    redirect(statusCodeOrUrl: number | string, url?: string) {
      if (typeof statusCodeOrUrl === 'number' && url) {
        denoRes.redirect(url, statusCodeOrUrl);
      } else if (typeof statusCodeOrUrl === 'string') {
        denoRes.redirect(statusCodeOrUrl, 302);
      }
      return this;
    },

    callNotFound() {
      denoRes.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: 'Route not found',
      });
    },

    getResponseTime() {
      return Date.now() - startTime;
    },
  };

  return reply;
}

/**
 * Check if a hook function is async (no done callback)
 */
function isAsyncHook(hook: FastifyHook): hook is FastifyHookAsync {
  return hook.length <= 2;
}

/**
 * Wrap a Fastify hook to work with the Deno adapter middleware system
 */
export function wrapFastifyHook(
  hook: FastifyHook,
): (
  req: DenoRequest,
  res: DenoResponse,
  next: () => Promise<void>,
) => Promise<void> {
  return async (denoReq: DenoRequest, denoRes: DenoResponse, next: () => Promise<void>) => {
    const fastifyReq = createFastifyRequest(denoReq);
    const fastifyReply = createFastifyReply(denoRes);

    if (isAsyncHook(hook)) {
      await hook(fastifyReq, fastifyReply);
      if (!fastifyReply.sent) {
        await next();
      }
    } else {
      return new Promise<void>((resolve, reject) => {
        const done: FastifyDoneCallback = (err?: Error) => {
          if (err) {
            reject(err);
          } else if (!fastifyReply.sent) {
            next().then(resolve).catch(reject);
          } else {
            resolve();
          }
        };

        try {
          (hook as FastifyHookCallback)(fastifyReq, fastifyReply, done);
        } catch (err) {
          reject(err);
        }
      });
    }
  };
}

/**
 * Wrap a Fastify plugin for use with the Deno adapter
 * This allows using Fastify plugins that add hooks or decorators
 */
export function wrapFastifyPlugin<Options = Record<string, unknown>>(
  plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>,
  instance: FastifyLikeInstance,
  opts: Options = {} as Options,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (plugin.length <= 2) {
      // Async plugin
      const result = (plugin as FastifyPluginAsync<Options>)(instance, opts);
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        resolve();
      }
    } else {
      // Callback plugin
      try {
        (plugin as FastifyPlugin<Options>)(instance, opts, (err?: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Create a simple logger that matches Fastify's logger interface
 */
export function createFastifyLogger(): FastifyLogger {
  const createLogFn = (level: string) => (msg: string, ...args: unknown[]) => {
    console.log(`[${level.toUpperCase()}] ${msg}`, ...args);
  };

  return {
    info: createLogFn('info'),
    error: createLogFn('error'),
    debug: createLogFn('debug'),
    warn: createLogFn('warn'),
    trace: createLogFn('trace'),
    fatal: createLogFn('fatal'),
    child(bindings: Record<string, unknown>) {
      const prefix = Object.entries(bindings)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ');
      const childLog = createFastifyLogger();
      const wrap = (fn: (msg: string, ...args: unknown[]) => void) =>
        (msg: string, ...args: unknown[]) => fn(`[${prefix}] ${msg}`, ...args);
      return {
        ...childLog,
        info: wrap(childLog.info),
        error: wrap(childLog.error),
        debug: wrap(childLog.debug),
        warn: wrap(childLog.warn),
        trace: wrap(childLog.trace),
        fatal: wrap(childLog.fatal),
      };
    },
  };
}
