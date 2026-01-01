import { AbstractHttpAdapter } from '@nestjs/core';
import { type RequestMethod, HttpStatus } from '@nestjs/common';
import type {
  DenoHttpServer,
  DenoCorsOptions,
  DenoStaticAssetsOptions,
} from '../interfaces/deno-http-options.interface.js';
import {
  wrapExpressMiddleware,
  createExpressRequest,
  createExpressResponse,
  type ExpressMiddleware,
  type ExpressErrorMiddleware,
  type ExpressLikeApp,
} from '../compat/express-compat.js';
import {
  wrapFastifyHook,
  wrapFastifyPlugin,
  createFastifyRequest,
  createFastifyReply,
  createFastifyLogger,
  type FastifyHook,
  type FastifyPlugin,
  type FastifyPluginAsync,
  type FastifyLikeInstance,
  type FastifyRouteHandler,
  type FastifyRouteOptions,
  type FastifyErrorHook,
  type FastifyOnSendHook,
  type FastifyHookName,
} from '../compat/fastify-compat.js';

// Declare Deno namespace for type safety when running in Deno
declare const Deno: {
  serve: (
    options: {
      port?: number;
      hostname?: string;
      signal?: AbortSignal;
      onListen?: (params: { port: number; hostname: string }) => void;
    },
    handler: (request: Request) => Response | Promise<Response>,
  ) => DenoHttpServer;
  open: (
    path: string,
    options: { read: boolean },
  ) => Promise<{
    readable: ReadableStream;
    close: () => void;
    stat: () => Promise<{
      isDirectory: boolean;
      size: number;
      mtime: Date | null;
    }>;
  }>;
};

type RequestHandler = (req: DenoRequest, res: DenoResponse) => Promise<void> | void;

/**
 * Extended Request object for Deno adapter
 */
export interface DenoRequest {
  readonly raw: Request;
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
  params: Record<string, string>;
  readonly query: Record<string, string>;
  body?: unknown;
  ip?: string;
  hostname?: string;
  protocol?: string;
  secure?: boolean;
  originalUrl?: string;
  baseUrl?: string;
  path?: string;
}

/**
 * Extended Response object for Deno adapter
 */
export interface DenoResponse {
  statusCode: number;
  headers: Headers;
  body?: BodyInit | null;
  headersSent: boolean;
  status(code: number): this;
  setHeader(name: string, value: string): this;
  getHeader(name: string): string | null;
  removeHeader(name: string): this;
  send(body?: BodyInit | object | null): void;
  json(body: unknown): void;
  redirect(url: string, statusCode?: number): void;
  end(body?: BodyInit | null): void;
}

interface RouteHandler {
  path: string | RegExp;
  method: string;
  handler: RequestHandler;
  keys: string[];
}

interface Middleware {
  path: string;
  handler: (
    req: DenoRequest,
    res: DenoResponse,
    next: () => Promise<void>,
  ) => Promise<void> | void;
}

/**
 * DenoAdapter - NestJS HTTP adapter for Deno runtime
 *
 * This adapter allows NestJS applications to run on Deno's native HTTP server
 * (Deno.serve) without requiring Express, Fastify, or other Node.js frameworks.
 */
export class DenoAdapter extends AbstractHttpAdapter<
  DenoHttpServer | undefined,
  DenoRequest,
  DenoResponse
> {
  private readonly routes: RouteHandler[] = [];
  private readonly middlewares: Middleware[] = [];
  private server: DenoHttpServer | undefined;
  private abortController: AbortController | undefined;
  private corsOptions: DenoCorsOptions | undefined;
  private errorHandler:
    | ((error: Error, req: DenoRequest, res: DenoResponse) => void)
    | undefined;
  private notFoundHandler:
    | ((req: DenoRequest, res: DenoResponse) => void)
    | undefined;
  private staticAssetsPath: string | undefined;
  private staticAssetsOptions: DenoStaticAssetsOptions | undefined;

  constructor(instance?: unknown) {
    super(instance || {});
  }

  /**
   * Create a new DenoAdapter instance
   */
  public static create(): DenoAdapter {
    return new DenoAdapter();
  }

  /**
   * Start listening on the specified port
   */
  public async listen(
    port: string | number,
    callback?: () => void,
  ): Promise<void>;
  public async listen(
    port: string | number,
    hostname: string,
    callback?: () => void,
  ): Promise<void>;
  public async listen(
    port: string | number,
    hostnameOrCallback?: string | (() => void),
    callback?: () => void,
  ): Promise<void> {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    const hostname =
      typeof hostnameOrCallback === 'string' ? hostnameOrCallback : '0.0.0.0';
    const cb =
      typeof hostnameOrCallback === 'function' ? hostnameOrCallback : callback;

    this.abortController = new AbortController();

    const serveOptions = {
      port: portNum,
      hostname,
      signal: this.abortController.signal,
      onListen: () => {
        cb?.();
      },
    };

    this.server = Deno.serve(
      serveOptions,
      this.handleRequest.bind(this),
    );
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Create Deno request object
    const req = await this.createRequest(request, url);

    // Create Deno response object
    const res = this.createResponse();

    try {
      // Handle CORS preflight
      if (this.corsOptions && method === 'OPTIONS') {
        this.handleCors(req, res);
        return this.buildResponse(res);
      }

      // Apply CORS headers for all requests
      if (this.corsOptions) {
        this.applyCorsHeaders(req, res);
      }

      // Serve static assets
      if (this.staticAssetsPath && path.startsWith(this.staticAssetsOptions?.prefix || '/')) {
        const staticResponse = await this.serveStaticAsset(path);
        if (staticResponse) {
          return staticResponse;
        }
      }

      // Run middlewares
      await this.runMiddlewares(req, res, path);

      if (res.headersSent) {
        return this.buildResponse(res);
      }

      // Find and execute route handler
      const route = this.findRoute(path, method);

      if (route) {
        req.params = this.extractParams(route, path);
        await route.handler(req, res);
      } else if (this.notFoundHandler) {
        this.notFoundHandler(req, res);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cannot ' + method + ' ' + path,
          error: 'Not Found',
        });
      }

      return this.buildResponse(res);
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error as Error, req, res);
        return this.buildResponse(res);
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: (error as Error).message || 'Internal Server Error',
        error: 'Internal Server Error',
      });

      return this.buildResponse(res);
    }
  }

  /**
   * Create a DenoRequest object from a native Request
   */
  private async createRequest(
    request: Request,
    url: URL,
  ): Promise<DenoRequest> {
    let body: unknown = undefined;

    // Parse body for methods that typically have a body
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          body = await request.json();
        } catch {
          body = undefined;
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const formData = await request.formData();
          const entries: Record<string, FormDataEntryValue> = {};
          formData.forEach((value, key) => {
            entries[key] = value;
          });
          body = entries;
        } catch {
          body = undefined;
        }
      } else if (contentType.includes('text/')) {
        try {
          body = await request.text();
        } catch {
          body = undefined;
        }
      } else if (contentType.includes('multipart/form-data')) {
        try {
          body = await request.formData();
        } catch {
          body = undefined;
        }
      }
    }

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      raw: request,
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: {},
      query,
      body,
      ip: undefined, // Deno doesn't expose client IP in the same way
      hostname: url.hostname,
      protocol: url.protocol.replace(':', ''),
      secure: url.protocol === 'https:',
      originalUrl: url.pathname + url.search,
      baseUrl: '',
      path: url.pathname,
    };
  }

  /**
   * Create a DenoResponse object
   */
  private createResponse(): DenoResponse {
    const headers = new Headers();
    let statusCode = 200;
    let body: BodyInit | null = null;
    let headersSent = false;

    const res: DenoResponse = {
      get statusCode() {
        return statusCode;
      },
      set statusCode(code: number) {
        statusCode = code;
      },
      headers,
      get body() {
        return body;
      },
      set body(b: BodyInit | null | undefined) {
        body = b ?? null;
      },
      get headersSent() {
        return headersSent;
      },
      set headersSent(sent: boolean) {
        headersSent = sent;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      setHeader(name: string, value: string) {
        headers.set(name, value);
        return this;
      },
      getHeader(name: string) {
        return headers.get(name);
      },
      removeHeader(name: string) {
        headers.delete(name);
        return this;
      },
      send(responseBody?: BodyInit | object | null) {
        headersSent = true;
        if (responseBody === undefined || responseBody === null) {
          body = null;
        } else if (typeof responseBody === 'object' && !(responseBody instanceof Blob) && !(responseBody instanceof ReadableStream) && !(responseBody instanceof FormData) && !(responseBody instanceof URLSearchParams) && !(responseBody instanceof ArrayBuffer)) {
          headers.set('Content-Type', 'application/json');
          body = JSON.stringify(responseBody);
        } else {
          body = responseBody as BodyInit;
        }
      },
      json(responseBody: unknown) {
        headersSent = true;
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(responseBody);
      },
      redirect(url: string, code = 302) {
        headersSent = true;
        statusCode = code;
        headers.set('Location', url);
        body = null;
      },
      end(responseBody?: BodyInit | null) {
        headersSent = true;
        body = responseBody ?? null;
      },
    };

    return res;
  }

  /**
   * Build a Response object from DenoResponse
   */
  private buildResponse(res: DenoResponse): Response {
    return new Response(res.body, {
      status: res.statusCode,
      headers: res.headers,
    });
  }

  /**
   * Run all matching middlewares
   */
  private async runMiddlewares(
    req: DenoRequest,
    res: DenoResponse,
    path: string,
  ): Promise<void> {
    const matchingMiddlewares = this.middlewares.filter(
      (m) => path.startsWith(m.path) || m.path === '*' || m.path === '/',
    );

    let index = 0;

    const next = async (): Promise<void> => {
      if (index < matchingMiddlewares.length && !res.headersSent) {
        const middleware = matchingMiddlewares[index++];
        await middleware.handler(req, res, next);
      }
    };

    await next();
  }

  /**
   * Find a matching route
   */
  private findRoute(path: string, method: string): RouteHandler | undefined {
    return this.routes.find((route) => {
      const methodMatch = route.method === method || route.method === 'ALL';

      if (typeof route.path === 'string') {
        const pattern = this.pathToRegex(route.path);
        return methodMatch && pattern.test(path);
      }

      return methodMatch && route.path.test(path);
    });
  }

  /**
   * Extract route parameters from path
   */
  private extractParams(
    route: RouteHandler,
    path: string,
  ): Record<string, string> {
    const params: Record<string, string> = {};

    if (typeof route.path === 'string') {
      const pattern = this.pathToRegex(route.path);
      const match = path.match(pattern);

      if (match) {
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1] || '';
        });
      }
    }

    return params;
  }

  /**
   * Convert a path pattern to a RegExp
   */
  private pathToRegex(path: string): RegExp {
    const escaped = path
      .replace(/([.+?^${}()|[\]\\])/g, '\\$1')
      .replace(/:(\w+)/g, '([^/]+)')
      .replace(/\*/g, '.*');

    return new RegExp(`^${escaped}$`);
  }

  /**
   * Extract parameter keys from path pattern
   */
  private extractKeys(path: string): string[] {
    const keys: string[] = [];
    const regex = /:(\w+)/g;
    let match;

    while ((match = regex.exec(path)) !== null) {
      keys.push(match[1]);
    }

    return keys;
  }

  /**
   * Register a route handler
   */
  private registerRoute(
    method: string,
    path: string,
    handler: RequestHandler,
  ): void {
    this.routes.push({
      path,
      method,
      handler,
      keys: this.extractKeys(path),
    });
  }

  // HTTP Method Handlers - implementing the AbstractHttpAdapter signatures
  public get(handler: RequestHandler): void;
  public get(path: string, handler: RequestHandler): void;
  public get(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('GET', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('GET', pathOrHandler, handler);
    }
  }

  public post(handler: RequestHandler): void;
  public post(path: string, handler: RequestHandler): void;
  public post(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('POST', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('POST', pathOrHandler, handler);
    }
  }

  public put(handler: RequestHandler): void;
  public put(path: string, handler: RequestHandler): void;
  public put(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('PUT', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('PUT', pathOrHandler, handler);
    }
  }

  public delete(handler: RequestHandler): void;
  public delete(path: string, handler: RequestHandler): void;
  public delete(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('DELETE', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('DELETE', pathOrHandler, handler);
    }
  }

  public patch(handler: RequestHandler): void;
  public patch(path: string, handler: RequestHandler): void;
  public patch(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('PATCH', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('PATCH', pathOrHandler, handler);
    }
  }

  public options(handler: RequestHandler): void;
  public options(path: string, handler: RequestHandler): void;
  public options(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('OPTIONS', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('OPTIONS', pathOrHandler, handler);
    }
  }

  public head(handler: RequestHandler): void;
  public head(path: string, handler: RequestHandler): void;
  public head(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('HEAD', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('HEAD', pathOrHandler, handler);
    }
  }

  public all(handler: RequestHandler): void;
  public all(path: string, handler: RequestHandler): void;
  public all(pathOrHandler: string | RequestHandler, handler?: RequestHandler): void {
    if (typeof pathOrHandler === 'function') {
      this.registerRoute('ALL', '/', pathOrHandler);
    } else if (handler) {
      this.registerRoute('ALL', pathOrHandler, handler);
    }
  }

  /**
   * Add middleware
   */
  public use(
    handler: (
      req: DenoRequest,
      res: DenoResponse,
      next: () => Promise<void>,
    ) => Promise<void> | void,
  ): void;
  public use(
    path: string,
    handler: (
      req: DenoRequest,
      res: DenoResponse,
      next: () => Promise<void>,
    ) => Promise<void> | void,
  ): void;
  public use(
    pathOrHandler:
      | string
      | ((
          req: DenoRequest,
          res: DenoResponse,
          next: () => Promise<void>,
        ) => Promise<void> | void),
    handler?: (
      req: DenoRequest,
      res: DenoResponse,
      next: () => Promise<void>,
    ) => Promise<void> | void,
  ): void {
    if (typeof pathOrHandler === 'function') {
      this.middlewares.push({
        path: '*',
        handler: pathOrHandler,
      });
    } else if (handler) {
      this.middlewares.push({
        path: pathOrHandler,
        handler,
      });
    }
  }

  /**
   * Use Express middleware with the Deno adapter
   *
   * This method wraps Express middleware to be compatible with the Deno adapter,
   * allowing you to use existing Express middleware packages.
   *
   * @example
   * ```typescript
   * import helmet from 'helmet';
   * import compression from 'compression';
   *
   * const adapter = new DenoAdapter();
   * adapter.useExpressMiddleware(helmet());
   * adapter.useExpressMiddleware('/api', compression());
   * ```
   */
  public useExpressMiddleware(middleware: ExpressMiddleware | ExpressErrorMiddleware): void;
  public useExpressMiddleware(
    path: string,
    middleware: ExpressMiddleware | ExpressErrorMiddleware,
  ): void;
  public useExpressMiddleware(
    pathOrMiddleware: string | ExpressMiddleware | ExpressErrorMiddleware,
    middleware?: ExpressMiddleware | ExpressErrorMiddleware,
  ): void {
    if (typeof pathOrMiddleware === 'function') {
      const wrappedMiddleware = wrapExpressMiddleware(pathOrMiddleware);
      this.middlewares.push({
        path: '*',
        handler: wrappedMiddleware,
      });
    } else if (middleware) {
      const wrappedMiddleware = wrapExpressMiddleware(middleware);
      this.middlewares.push({
        path: pathOrMiddleware,
        handler: wrappedMiddleware,
      });
    }
  }

  /**
   * Create an Express-like app instance for middleware that requires app.use()
   *
   * Some Express middleware (like express-session) require an Express app instance.
   * This creates a compatible shim that routes middleware through the Deno adapter.
   *
   * @example
   * ```typescript
   * import session from 'express-session';
   *
   * const adapter = new DenoAdapter();
   * const expressApp = adapter.getExpressApp();
   *
   * expressApp.use(session({ secret: 'keyboard cat' }));
   * ```
   */
  public getExpressApp(): ExpressLikeApp {
    const self = this;
    const settings: Record<string, unknown> = {};

    const app: ExpressLikeApp = {
      locals: {},
      settings,

      use(...args: unknown[]) {
        if (args.length === 1 && typeof args[0] === 'function') {
          self.useExpressMiddleware(args[0] as ExpressMiddleware);
        } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'function') {
          self.useExpressMiddleware(args[0], args[1] as ExpressMiddleware);
        } else if (args.length >= 2) {
          // Multiple middleware handlers
          const path = typeof args[0] === 'string' ? args[0] : '*';
          const handlers = typeof args[0] === 'string' ? args.slice(1) : args;
          handlers.forEach((handler) => {
            if (typeof handler === 'function') {
              self.useExpressMiddleware(path, handler as ExpressMiddleware);
            }
          });
        }
      },

      get(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.get(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      post(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.post(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      put(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.put(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      delete(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.delete(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      patch(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.patch(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      options(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.options(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      head(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.head(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      all(path: string, ...handlers: ExpressMiddleware[]) {
        handlers.forEach((handler) => {
          self.all(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {});
          });
        });
      },

      set(key: string, value: unknown) {
        settings[key] = value;
      },

      enable(key: string) {
        settings[key] = true;
      },

      disable(key: string) {
        settings[key] = false;
      },

      enabled(key: string) {
        return Boolean(settings[key]);
      },

      disabled(key: string) {
        return !settings[key];
      },
    };

    return app;
  }

  /**
   * Use Fastify middleware/hooks with the Deno adapter
   *
   * This method wraps Fastify hooks to be compatible with the Deno adapter,
   * allowing you to use Fastify-style middleware.
   *
   * @example
   * ```typescript
   * const adapter = new DenoAdapter();
   *
   * // Use a Fastify hook
   * adapter.useFastifyHook('onRequest', async (request, reply) => {
   *   console.log('Request received:', request.url);
   * });
   *
   * // Use with callback style
   * adapter.useFastifyHook('preHandler', (request, reply, done) => {
   *   // Do something
   *   done();
   * });
   * ```
   */
  public useFastifyHook(_name: FastifyHookName, hook: FastifyHook): void {
    // Note: Hook name is preserved for future hook-specific handling
    const wrappedHook = wrapFastifyHook(hook);
    this.middlewares.push({
      path: '*',
      handler: wrappedHook,
    });
  }

  /**
   * Register a Fastify plugin with the Deno adapter
   *
   * This allows using Fastify plugins that add hooks, decorators, or routes.
   *
   * @example
   * ```typescript
   * import fastifyCors from '@fastify/cors';
   * import fastifyHelmet from '@fastify/helmet';
   *
   * const adapter = new DenoAdapter();
   * const fastify = adapter.getFastifyInstance();
   *
   * // Register plugins
   * await adapter.registerFastifyPlugin(fastifyCors, { origin: '*' });
   * await adapter.registerFastifyPlugin(fastifyHelmet);
   * ```
   */
  public async registerFastifyPlugin<Options = Record<string, unknown>>(
    plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>,
    opts?: Options,
  ): Promise<void> {
    const instance = this.getFastifyInstance();
    await wrapFastifyPlugin(plugin, instance, opts);
  }

  /**
   * Get a Fastify-like instance for plugins that require it
   *
   * This creates a Fastify-compatible interface that routes hooks and routes
   * through the Deno adapter.
   *
   * @example
   * ```typescript
   * const adapter = new DenoAdapter();
   * const fastify = adapter.getFastifyInstance();
   *
   * // Add hooks
   * fastify.addHook('onRequest', async (request, reply) => {
   *   console.log('Request:', request.method, request.url);
   * });
   *
   * // Add decorators
   * fastify.decorateRequest('user', null);
   * ```
   */
  public getFastifyInstance(): FastifyLikeInstance {
    const self = this;
    const decorators: Record<string, unknown> = {};
    const requestDecorators: Record<string, unknown> = {};
    const replyDecorators: Record<string, unknown> = {};

    const instance: FastifyLikeInstance = {
      log: createFastifyLogger(),
      prefix: '',

      // Decorators
      decorate(name: string, value: unknown) {
        decorators[name] = value;
        return this;
      },

      decorateRequest(name: string, value: unknown) {
        requestDecorators[name] = value;
        return this;
      },

      decorateReply(name: string, value: unknown) {
        replyDecorators[name] = value;
        return this;
      },

      hasDecorator(name: string) {
        return name in decorators;
      },

      hasRequestDecorator(name: string) {
        return name in requestDecorators;
      },

      hasReplyDecorator(name: string) {
        return name in replyDecorators;
      },

      // Hooks
      addHook(name: FastifyHookName, hook: FastifyHook | FastifyErrorHook | FastifyOnSendHook) {
        if (['onRequest', 'preParsing', 'preValidation', 'preHandler', 'onResponse'].includes(name)) {
          self.useFastifyHook(name, hook as FastifyHook);
        }
        // Note: preSerialization, onSend, onError need special handling
        return this;
      },

      // Plugin registration
      register<Options = Record<string, unknown>>(
        plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>,
        opts?: Options,
      ) {
        // Queue plugin registration (will be async)
        wrapFastifyPlugin(plugin, this, opts).catch(console.error);
        return this;
      },

      // Routes
      route(opts: FastifyRouteOptions) {
        const methods = Array.isArray(opts.method) ? opts.method : [opts.method];

        methods.forEach((method) => {
          const handler = async (req: DenoRequest, res: DenoResponse) => {
            const fastifyReq = createFastifyRequest(req);
            const fastifyReply = createFastifyReply(res);

            // Apply request decorators
            Object.entries(requestDecorators).forEach(([key, value]) => {
              fastifyReq[key] = typeof value === 'function' ? value() : value;
            });

            // Apply reply decorators
            Object.entries(replyDecorators).forEach(([key, value]) => {
              fastifyReply[key] = typeof value === 'function' ? value() : value;
            });

            // Run route-specific hooks
            const hooks = [
              ...(opts.onRequest ? (Array.isArray(opts.onRequest) ? opts.onRequest : [opts.onRequest]) : []),
              ...(opts.preValidation ? (Array.isArray(opts.preValidation) ? opts.preValidation : [opts.preValidation]) : []),
              ...(opts.preHandler ? (Array.isArray(opts.preHandler) ? opts.preHandler : [opts.preHandler]) : []),
            ];

            for (const hook of hooks) {
              if (fastifyReply.sent) break;
              await new Promise<void>((resolve, reject) => {
                if (hook.length <= 2) {
                  (hook as (req: unknown, rep: unknown) => Promise<void>)(fastifyReq, fastifyReply)
                    .then(resolve)
                    .catch(reject);
                } else {
                  (hook as (req: unknown, rep: unknown, done: (err?: Error) => void) => void)(
                    fastifyReq,
                    fastifyReply,
                    (err?: Error) => (err ? reject(err) : resolve()),
                  );
                }
              });
            }

            if (!fastifyReply.sent) {
              const result = await opts.handler(fastifyReq, fastifyReply);
              if (result !== undefined && !fastifyReply.sent) {
                fastifyReply.send(result);
              }
            }
          };

          switch (method.toUpperCase()) {
            case 'GET':
              self.get(opts.url, handler);
              break;
            case 'POST':
              self.post(opts.url, handler);
              break;
            case 'PUT':
              self.put(opts.url, handler);
              break;
            case 'DELETE':
              self.delete(opts.url, handler);
              break;
            case 'PATCH':
              self.patch(opts.url, handler);
              break;
            case 'OPTIONS':
              self.options(opts.url, handler);
              break;
            case 'HEAD':
              self.head(opts.url, handler);
              break;
            default:
              self.all(opts.url, handler);
          }
        });

        return this;
      },

      // HTTP method shortcuts
      get(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'GET', url: path, handler: h });
      },

      post(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'POST', url: path, handler: h });
      },

      put(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'PUT', url: path, handler: h });
      },

      delete(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'DELETE', url: path, handler: h });
      },

      patch(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'PATCH', url: path, handler: h });
      },

      options(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'OPTIONS', url: path, handler: h });
      },

      head(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: 'HEAD', url: path, handler: h });
      },

      all(path: string, optsOrHandler?: Partial<FastifyRouteOptions> | FastifyRouteHandler, handler?: FastifyRouteHandler) {
        const h = typeof optsOrHandler === 'function' ? optsOrHandler : handler!;
        const opts = typeof optsOrHandler === 'object' ? optsOrHandler : {};
        return this.route({ ...opts, method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], url: path, handler: h });
      },
    };

    return instance;
  }

  /**
   * Get the underlying HTTP server
   */
  public getHttpServer(): DenoHttpServer | undefined {
    return this.server;
  }

  /**
   * Set the HTTP server instance
   */
  public setHttpServer(server: DenoHttpServer): void {
    this.server = server;
  }

  /**
   * Close the server
   */
  public async close(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      await this.server?.finished;
    }
  }

  /**
   * Set error handler
   */
  public setErrorHandler(
    handler: (error: Error, req: DenoRequest, res: DenoResponse) => void,
  ): void {
    this.errorHandler = handler;
  }

  /**
   * Set 404 handler
   */
  public setNotFoundHandler(
    handler: (req: DenoRequest, res: DenoResponse) => void,
  ): void {
    this.notFoundHandler = handler;
  }

  /**
   * Enable CORS
   */
  public enableCors(options?: DenoCorsOptions): void {
    this.corsOptions = options || {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: false,
    };
  }

  /**
   * Handle CORS preflight requests
   */
  private handleCors(req: DenoRequest, res: DenoResponse): void {
    this.applyCorsHeaders(req, res);
    res.status(this.corsOptions?.optionsSuccessStatus || 204).end();
  }

  /**
   * Apply CORS headers to response
   */
  private applyCorsHeaders(req: DenoRequest, res: DenoResponse): void {
    if (!this.corsOptions) return;

    const origin = req.headers.get('origin') || '*';
    let allowOrigin = '*';

    if (typeof this.corsOptions.origin === 'string') {
      allowOrigin = this.corsOptions.origin;
    } else if (typeof this.corsOptions.origin === 'boolean') {
      allowOrigin = this.corsOptions.origin ? origin : '';
    } else if (Array.isArray(this.corsOptions.origin)) {
      allowOrigin = this.corsOptions.origin.includes(origin) ? origin : '';
    } else if (typeof this.corsOptions.origin === 'function') {
      const result = this.corsOptions.origin(origin);
      allowOrigin = typeof result === 'string' ? result : result ? origin : '';
    }

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);

    if (this.corsOptions.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const methods = Array.isArray(this.corsOptions.methods)
      ? this.corsOptions.methods.join(',')
      : this.corsOptions.methods || 'GET,HEAD,PUT,PATCH,POST,DELETE';

    res.setHeader('Access-Control-Allow-Methods', methods);

    if (this.corsOptions.allowedHeaders) {
      const headers = Array.isArray(this.corsOptions.allowedHeaders)
        ? this.corsOptions.allowedHeaders.join(',')
        : this.corsOptions.allowedHeaders;
      res.setHeader('Access-Control-Allow-Headers', headers);
    } else {
      const requestHeaders = req.headers.get('access-control-request-headers');
      if (requestHeaders) {
        res.setHeader('Access-Control-Allow-Headers', requestHeaders);
      }
    }

    if (this.corsOptions.exposedHeaders) {
      const exposed = Array.isArray(this.corsOptions.exposedHeaders)
        ? this.corsOptions.exposedHeaders.join(',')
        : this.corsOptions.exposedHeaders;
      res.setHeader('Access-Control-Expose-Headers', exposed);
    }

    if (this.corsOptions.maxAge) {
      res.setHeader('Access-Control-Max-Age', String(this.corsOptions.maxAge));
    }
  }

  /**
   * Use static assets
   */
  public useStaticAssets(path: string, options?: DenoStaticAssetsOptions): void {
    this.staticAssetsPath = path;
    this.staticAssetsOptions = options;
  }

  /**
   * Serve static asset
   */
  private async serveStaticAsset(urlPath: string): Promise<Response | null> {
    if (!this.staticAssetsPath) return null;

    const prefix = this.staticAssetsOptions?.prefix || '/';
    const relativePath = urlPath.replace(prefix, '').replace(/^\//, '');
    const filePath = `${this.staticAssetsPath}/${relativePath}`;

    try {
      const file = await Deno.open(filePath, { read: true });
      const stat = await file.stat();

      if (stat.isDirectory) {
        file.close();
        if (this.staticAssetsOptions?.index !== false) {
          const indexFile = typeof this.staticAssetsOptions?.index === 'string'
            ? this.staticAssetsOptions.index
            : 'index.html';
          return this.serveStaticAsset(`${urlPath}/${indexFile}`);
        }
        return null;
      }

      const headers = new Headers();

      // Set content type based on extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        eot: 'application/vnd.ms-fontobject',
        txt: 'text/plain',
        xml: 'application/xml',
        pdf: 'application/pdf',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
      };

      headers.set('Content-Type', mimeTypes[ext || ''] || 'application/octet-stream');

      if (this.staticAssetsOptions?.etag !== false) {
        headers.set('ETag', `"${stat.size}-${stat.mtime?.getTime() || 0}"`);
      }

      if (this.staticAssetsOptions?.lastModified !== false && stat.mtime) {
        headers.set('Last-Modified', stat.mtime.toUTCString());
      }

      if (this.staticAssetsOptions?.maxAge) {
        let cacheControl = `max-age=${this.staticAssetsOptions.maxAge}`;
        if (this.staticAssetsOptions.immutable) {
          cacheControl += ', immutable';
        }
        headers.set('Cache-Control', cacheControl);
      }

      return new Response(file.readable, {
        status: 200,
        headers,
      });
    } catch (error) {
      if ((error as { name?: string }).name === 'NotFound') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Set view engine (not implemented for base adapter)
   */
  public setViewEngine(_engine: string): void {
    console.warn('View engine is not supported in the base Deno adapter');
  }

  /**
   * Render view (not implemented for base adapter)
   */
  public render(_response: DenoResponse, _view: string, _options: object): void {
    console.warn('Render is not supported in the base Deno adapter');
  }

  /**
   * Get request hostname
   */
  public getRequestHostname(request: DenoRequest): string {
    return request.hostname || request.headers.get('host') || '';
  }

  /**
   * Get request method
   */
  public getRequestMethod(request: DenoRequest): string {
    return request.method;
  }

  /**
   * Get request URL
   */
  public getRequestUrl(request: DenoRequest): string {
    return request.path || new URL(request.url).pathname;
  }

  /**
   * Send a reply
   */
  public reply(
    response: DenoResponse,
    body: unknown,
    statusCode?: number,
  ): void {
    if (statusCode) {
      response.status(statusCode);
    }

    if (body === undefined || body === null) {
      response.end();
    } else if (typeof body === 'object') {
      response.json(body);
    } else {
      response.send(String(body));
    }
  }

  /**
   * Set response status
   */
  public status(response: DenoResponse, statusCode: number): void {
    response.status(statusCode);
  }

  /**
   * Redirect response
   */
  public redirect(
    response: DenoResponse,
    statusCode: number,
    url: string,
  ): void {
    response.redirect(url, statusCode);
  }

  /**
   * Set response header
   */
  public setHeader(response: DenoResponse, name: string, value: string): void {
    response.setHeader(name, value);
  }

  /**
   * Get response header
   */
  public getHeader(response: DenoResponse, name: string): string | null {
    return response.getHeader(name);
  }

  /**
   * Append value to header
   */
  public appendHeader(response: DenoResponse, name: string, value: string): void {
    const existing = response.getHeader(name);
    if (existing) {
      response.setHeader(name, `${existing}, ${value}`);
    } else {
      response.setHeader(name, value);
    }
  }

  /**
   * End response
   */
  public end(response: DenoResponse, message?: string): void {
    response.end(message);
  }

  /**
   * Check if headers have been sent
   */
  public isHeadersSent(response: DenoResponse): boolean {
    return response.headersSent;
  }

  /**
   * Register body parser middleware
   */
  public registerParserMiddleware(): void {
    // Body parsing is handled in createRequest
  }

  /**
   * Create middleware factory
   */
  public createMiddlewareFactory(
    _requestMethod: RequestMethod,
  ): (path: string, callback: Function) => void {
    return (path: string, callback: Function) => {
      this.use(path, async (req, res, next) => {
        await callback(req, res, next);
      });
    };
  }

  /**
   * Initialize the adapter
   */
  public initHttpServer(): void {
    // Initialization is handled in listen()
  }

  /**
   * Get the adapter type
   */
  public getType(): string {
    return 'deno';
  }

  /**
   * Apply version filter
   */
  public applyVersionFilter(
    handler: Function,
    _version: unknown,
    _versioningOptions: unknown,
  ): (req: DenoRequest, res: DenoResponse, next: () => void) => Function {
    return (_req: DenoRequest, _res: DenoResponse, _next: () => void) => {
      // Version filtering can be implemented here if needed
      return handler;
    };
  }
}
