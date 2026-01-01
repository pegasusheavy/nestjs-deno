import { AbstractHttpAdapter } from '@nestjs/core';
import { RequestMethod, INestApplication } from '@nestjs/common';

/**
 * Options for configuring the Deno HTTP server
 */
interface DenoHttpOptions {
    /**
     * The port to listen on
     */
    port?: number;
    /**
     * The hostname to bind to
     */
    hostname?: string;
    /**
     * TLS certificate configuration
     */
    cert?: string;
    /**
     * TLS key configuration
     */
    key?: string;
    /**
     * Handler for when the server starts listening
     */
    onListen?: (params: {
        hostname: string;
        port: number;
    }) => void;
    /**
     * Signal for aborting the server
     */
    signal?: AbortSignal;
    /**
     * Enable HTTP/2
     */
    alpnProtocols?: string[];
}
/**
 * Represents a Deno HTTP server instance
 */
interface DenoHttpServer {
    /**
     * The port the server is listening on
     */
    port: number;
    /**
     * The hostname the server is bound to
     */
    hostname: string;
    /**
     * Promise that resolves when the server finishes
     */
    finished: Promise<void>;
    /**
     * Reference to the underlying Deno server
     */
    ref(): void;
    /**
     * Unreference the server
     */
    unref(): void;
    /**
     * Shutdown the server gracefully
     */
    shutdown(): Promise<void>;
}
/**
 * CORS options for the Deno adapter
 */
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
/**
 * Static assets options
 */
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
/**
 * Body parser options
 */
interface DenoBodyParserOptions {
    limit?: number | string;
    type?: string | string[];
}

/**
 * Express-compatible Request interface
 * Provides a compatibility layer for Express middleware
 */
interface ExpressCompatRequest {
    method: string;
    url: string;
    originalUrl: string;
    baseUrl: string;
    path: string;
    hostname: string;
    ip: string | undefined;
    protocol: string;
    secure: boolean;
    headers: Record<string, string | string[] | undefined>;
    params: Record<string, string>;
    query: Record<string, string>;
    body: unknown;
    get(name: string): string | undefined;
    header(name: string): string | undefined;
    is(type: string | string[]): string | false | null;
    accepts(...types: string[]): string | false;
    acceptsEncodings(...encodings: string[]): string | false;
    acceptsCharsets(...charsets: string[]): string | false;
    acceptsLanguages(...langs: string[]): string | false;
    raw: Request;
    cookies?: Record<string, string>;
    signedCookies?: Record<string, string>;
    fresh?: boolean;
    stale?: boolean;
    xhr?: boolean;
    subdomains?: string[];
    [key: string]: unknown;
}
/**
 * Express-compatible Response interface
 * Provides a compatibility layer for Express middleware
 */
interface ExpressCompatResponse {
    statusCode: number;
    statusMessage: string;
    headersSent: boolean;
    status(code: number): this;
    sendStatus(code: number): this;
    set(field: string, value: string | string[]): this;
    set(field: Record<string, string | string[]>): this;
    header(field: string, value?: string | string[]): this | string | undefined;
    get(field: string): string | undefined;
    append(field: string, value: string | string[]): this;
    send(body?: unknown): this;
    json(body?: unknown): this;
    jsonp(body?: unknown): this;
    end(data?: unknown, encoding?: string): this;
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    type(type: string): this;
    contentType(type: string): this;
    cookie(name: string, value: string, options?: CookieOptions): this;
    clearCookie(name: string, options?: CookieOptions): this;
    location(url: string): this;
    links(links: Record<string, string>): this;
    vary(field: string): this;
    format(obj: Record<string, () => void>): this;
    [key: string]: unknown;
}
/**
 * Cookie options interface
 */
interface CookieOptions {
    domain?: string;
    encode?: (value: string) => string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    secure?: boolean;
    signed?: boolean;
}
/**
 * Express NextFunction type
 */
type ExpressNextFunction = (err?: unknown) => void;
/**
 * Express middleware function signature
 */
type ExpressMiddleware = (req: ExpressCompatRequest, res: ExpressCompatResponse, next: ExpressNextFunction) => void | Promise<void>;
/**
 * Express error-handling middleware function signature
 */
type ExpressErrorMiddleware = (err: unknown, req: ExpressCompatRequest, res: ExpressCompatResponse, next: ExpressNextFunction) => void | Promise<void>;
/**
 * Create an Express-compatible request wrapper from a DenoRequest
 */
declare function createExpressRequest(denoReq: DenoRequest): ExpressCompatRequest;
/**
 * Create an Express-compatible response wrapper from a DenoResponse
 */
declare function createExpressResponse(denoRes: DenoResponse): ExpressCompatResponse;
/**
 * Wrap an Express middleware to work with the Deno adapter
 */
declare function wrapExpressMiddleware(middleware: ExpressMiddleware | ExpressErrorMiddleware): (req: DenoRequest, res: DenoResponse, next: () => Promise<void>) => Promise<void>;
/**
 * Create an Express-like app object for middleware that expects app.use()
 */
interface ExpressLikeApp {
    use: (...args: unknown[]) => void;
    get: (path: string, ...handlers: ExpressMiddleware[]) => void;
    post: (path: string, ...handlers: ExpressMiddleware[]) => void;
    put: (path: string, ...handlers: ExpressMiddleware[]) => void;
    delete: (path: string, ...handlers: ExpressMiddleware[]) => void;
    patch: (path: string, ...handlers: ExpressMiddleware[]) => void;
    options: (path: string, ...handlers: ExpressMiddleware[]) => void;
    head: (path: string, ...handlers: ExpressMiddleware[]) => void;
    all: (path: string, ...handlers: ExpressMiddleware[]) => void;
    locals: Record<string, unknown>;
    settings: Record<string, unknown>;
    set: (key: string, value: unknown) => void;
    enable: (key: string) => void;
    disable: (key: string) => void;
    enabled: (key: string) => boolean;
    disabled: (key: string) => boolean;
}

/**
 * Fastify-compatible Request interface
 * Provides a compatibility layer for Fastify middleware and hooks
 */
interface FastifyCompatRequest {
    id: string;
    params: Record<string, string>;
    query: Record<string, string>;
    body: unknown;
    headers: Record<string, string | string[] | undefined>;
    raw: Request;
    url: string;
    originalUrl: string;
    method: string;
    hostname: string;
    ip: string | undefined;
    protocol: 'http' | 'https';
    routerPath?: string;
    routerMethod?: string;
    validationError?: Error;
    [key: string]: unknown;
}
/**
 * Fastify-compatible Reply interface
 * Provides a compatibility layer for Fastify middleware and hooks
 */
interface FastifyCompatReply {
    statusCode: number;
    sent: boolean;
    code(statusCode: number): this;
    status(statusCode: number): this;
    header(key: string, value: string | number | boolean): this;
    headers(headers: Record<string, string | number | boolean>): this;
    getHeader(key: string): string | undefined;
    getHeaders(): Record<string, string | undefined>;
    removeHeader(key: string): this;
    hasHeader(key: string): boolean;
    send(payload?: unknown): this;
    serialize(payload: unknown): string;
    serializer(fn: (payload: unknown) => string): this;
    type(contentType: string): this;
    redirect(url: string): this;
    redirect(statusCode: number, url: string): this;
    callNotFound(): void;
    getResponseTime(): number;
    raw: DenoResponse;
    [key: string]: unknown;
}
/**
 * Fastify hook types
 */
type FastifyHookName = 'onRequest' | 'preParsing' | 'preValidation' | 'preHandler' | 'preSerialization' | 'onSend' | 'onResponse' | 'onError' | 'onTimeout' | 'onReady' | 'onClose';
/**
 * Fastify done callback
 */
type FastifyDoneCallback = (err?: Error) => void;
/**
 * Fastify hook function (callback style)
 */
type FastifyHookCallback = (request: FastifyCompatRequest, reply: FastifyCompatReply, done: FastifyDoneCallback) => void;
/**
 * Fastify hook function (async style)
 */
type FastifyHookAsync = (request: FastifyCompatRequest, reply: FastifyCompatReply) => Promise<void>;
/**
 * Fastify hook function (either style)
 */
type FastifyHook = FastifyHookCallback | FastifyHookAsync;
/**
 * Fastify onError hook
 */
type FastifyErrorHook = (request: FastifyCompatRequest, reply: FastifyCompatReply, error: Error, done: FastifyDoneCallback) => void;
/**
 * Fastify onSend hook with payload
 */
type FastifyOnSendHook = (request: FastifyCompatRequest, reply: FastifyCompatReply, payload: unknown, done: (err?: Error, payload?: unknown) => void) => void;
/**
 * Fastify plugin function
 */
type FastifyPlugin<Options = Record<string, unknown>> = (instance: FastifyLikeInstance, opts: Options, done: FastifyDoneCallback) => void;
/**
 * Fastify async plugin function
 */
type FastifyPluginAsync<Options = Record<string, unknown>> = (instance: FastifyLikeInstance, opts: Options) => Promise<void>;
/**
 * Fastify route handler
 */
type FastifyRouteHandler = (request: FastifyCompatRequest, reply: FastifyCompatReply) => unknown | Promise<unknown>;
/**
 * Fastify route options
 */
interface FastifyRouteOptions {
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
interface FastifyLikeInstance {
    decorate(name: string, value: unknown): this;
    decorateRequest(name: string, value: unknown): this;
    decorateReply(name: string, value: unknown): this;
    hasDecorator(name: string): boolean;
    hasRequestDecorator(name: string): boolean;
    hasReplyDecorator(name: string): boolean;
    addHook(name: 'onRequest', hook: FastifyHook): this;
    addHook(name: 'preParsing', hook: FastifyHook): this;
    addHook(name: 'preValidation', hook: FastifyHook): this;
    addHook(name: 'preHandler', hook: FastifyHook): this;
    addHook(name: 'preSerialization', hook: FastifyOnSendHook): this;
    addHook(name: 'onSend', hook: FastifyOnSendHook): this;
    addHook(name: 'onResponse', hook: FastifyHook): this;
    addHook(name: 'onError', hook: FastifyErrorHook): this;
    addHook(name: FastifyHookName, hook: FastifyHook | FastifyErrorHook | FastifyOnSendHook): this;
    register<Options = Record<string, unknown>>(plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>, opts?: Options): this;
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
    log: FastifyLogger;
    prefix: string;
}
/**
 * Fastify logger interface
 */
interface FastifyLogger {
    info(msg: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
    debug(msg: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
    trace(msg: string, ...args: unknown[]): void;
    fatal(msg: string, ...args: unknown[]): void;
    child(bindings: Record<string, unknown>): FastifyLogger;
}
/**
 * Create a Fastify-compatible request from a DenoRequest
 */
declare function createFastifyRequest(denoReq: DenoRequest): FastifyCompatRequest;
/**
 * Create a Fastify-compatible reply from a DenoResponse
 */
declare function createFastifyReply(denoRes: DenoResponse): FastifyCompatReply;
/**
 * Wrap a Fastify hook to work with the Deno adapter middleware system
 */
declare function wrapFastifyHook(hook: FastifyHook): (req: DenoRequest, res: DenoResponse, next: () => Promise<void>) => Promise<void>;
/**
 * Wrap a Fastify plugin for use with the Deno adapter
 * This allows using Fastify plugins that add hooks or decorators
 */
declare function wrapFastifyPlugin<Options = Record<string, unknown>>(plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>, instance: FastifyLikeInstance, opts?: Options): Promise<void>;
/**
 * Create a simple logger that matches Fastify's logger interface
 */
declare function createFastifyLogger(): FastifyLogger;

type RequestHandler = (req: DenoRequest, res: DenoResponse) => Promise<void> | void;
/**
 * Extended Request object for Deno adapter
 */
interface DenoRequest {
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
interface DenoResponse {
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
/**
 * DenoAdapter - NestJS HTTP adapter for Deno runtime
 *
 * This adapter allows NestJS applications to run on Deno's native HTTP server
 * (Deno.serve) without requiring Express, Fastify, or other Node.js frameworks.
 */
declare class DenoAdapter extends AbstractHttpAdapter<DenoHttpServer | undefined, DenoRequest, DenoResponse> {
    private readonly routes;
    private readonly middlewares;
    private server;
    private abortController;
    private corsOptions;
    private errorHandler;
    private notFoundHandler;
    private staticAssetsPath;
    private staticAssetsOptions;
    constructor(instance?: unknown);
    /**
     * Create a new DenoAdapter instance
     */
    static create(): DenoAdapter;
    /**
     * Start listening on the specified port
     */
    listen(port: string | number, callback?: () => void): Promise<void>;
    listen(port: string | number, hostname: string, callback?: () => void): Promise<void>;
    /**
     * Handle incoming HTTP requests
     */
    private handleRequest;
    /**
     * Create a DenoRequest object from a native Request
     */
    private createRequest;
    /**
     * Create a DenoResponse object
     */
    private createResponse;
    /**
     * Build a Response object from DenoResponse
     */
    private buildResponse;
    /**
     * Run all matching middlewares
     */
    private runMiddlewares;
    /**
     * Find a matching route
     */
    private findRoute;
    /**
     * Extract route parameters from path
     */
    private extractParams;
    /**
     * Convert a path pattern to a RegExp
     */
    private pathToRegex;
    /**
     * Extract parameter keys from path pattern
     */
    private extractKeys;
    /**
     * Register a route handler
     */
    private registerRoute;
    get(handler: RequestHandler): void;
    get(path: string, handler: RequestHandler): void;
    post(handler: RequestHandler): void;
    post(path: string, handler: RequestHandler): void;
    put(handler: RequestHandler): void;
    put(path: string, handler: RequestHandler): void;
    delete(handler: RequestHandler): void;
    delete(path: string, handler: RequestHandler): void;
    patch(handler: RequestHandler): void;
    patch(path: string, handler: RequestHandler): void;
    options(handler: RequestHandler): void;
    options(path: string, handler: RequestHandler): void;
    head(handler: RequestHandler): void;
    head(path: string, handler: RequestHandler): void;
    all(handler: RequestHandler): void;
    all(path: string, handler: RequestHandler): void;
    /**
     * Add middleware
     */
    use(handler: (req: DenoRequest, res: DenoResponse, next: () => Promise<void>) => Promise<void> | void): void;
    use(path: string, handler: (req: DenoRequest, res: DenoResponse, next: () => Promise<void>) => Promise<void> | void): void;
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
    useExpressMiddleware(middleware: ExpressMiddleware | ExpressErrorMiddleware): void;
    useExpressMiddleware(path: string, middleware: ExpressMiddleware | ExpressErrorMiddleware): void;
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
    getExpressApp(): ExpressLikeApp;
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
    useFastifyHook(_name: FastifyHookName, hook: FastifyHook): void;
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
    registerFastifyPlugin<Options = Record<string, unknown>>(plugin: FastifyPlugin<Options> | FastifyPluginAsync<Options>, opts?: Options): Promise<void>;
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
    getFastifyInstance(): FastifyLikeInstance;
    /**
     * Get the underlying HTTP server
     */
    getHttpServer(): DenoHttpServer | undefined;
    /**
     * Set the HTTP server instance
     */
    setHttpServer(server: DenoHttpServer): void;
    /**
     * Close the server
     */
    close(): Promise<void>;
    /**
     * Set error handler
     */
    setErrorHandler(handler: (error: Error, req: DenoRequest, res: DenoResponse) => void): void;
    /**
     * Set 404 handler
     */
    setNotFoundHandler(handler: (req: DenoRequest, res: DenoResponse) => void): void;
    /**
     * Enable CORS
     */
    enableCors(options?: DenoCorsOptions): void;
    /**
     * Handle CORS preflight requests
     */
    private handleCors;
    /**
     * Apply CORS headers to response
     */
    private applyCorsHeaders;
    /**
     * Use static assets
     */
    useStaticAssets(path: string, options?: DenoStaticAssetsOptions): void;
    /**
     * Serve static asset
     */
    private serveStaticAsset;
    /**
     * Set view engine (not implemented for base adapter)
     */
    setViewEngine(_engine: string): void;
    /**
     * Render view (not implemented for base adapter)
     */
    render(_response: DenoResponse, _view: string, _options: object): void;
    /**
     * Get request hostname
     */
    getRequestHostname(request: DenoRequest): string;
    /**
     * Get request method
     */
    getRequestMethod(request: DenoRequest): string;
    /**
     * Get request URL
     */
    getRequestUrl(request: DenoRequest): string;
    /**
     * Send a reply
     */
    reply(response: DenoResponse, body: unknown, statusCode?: number): void;
    /**
     * Set response status
     */
    status(response: DenoResponse, statusCode: number): void;
    /**
     * Redirect response
     */
    redirect(response: DenoResponse, statusCode: number, url: string): void;
    /**
     * Set response header
     */
    setHeader(response: DenoResponse, name: string, value: string): void;
    /**
     * Get response header
     */
    getHeader(response: DenoResponse, name: string): string | null;
    /**
     * Append value to header
     */
    appendHeader(response: DenoResponse, name: string, value: string): void;
    /**
     * End response
     */
    end(response: DenoResponse, message?: string): void;
    /**
     * Check if headers have been sent
     */
    isHeadersSent(response: DenoResponse): boolean;
    /**
     * Register body parser middleware
     */
    registerParserMiddleware(): void;
    /**
     * Create middleware factory
     */
    createMiddlewareFactory(_requestMethod: RequestMethod): (path: string, callback: Function) => void;
    /**
     * Initialize the adapter
     */
    initHttpServer(): void;
    /**
     * Get the adapter type
     */
    getType(): string;
    /**
     * Apply version filter
     */
    applyVersionFilter(handler: Function, _version: unknown, _versioningOptions: unknown): (req: DenoRequest, res: DenoResponse, next: () => void) => Function;
}

/**
 * Interface for a NestJS application running on the Deno adapter
 */
interface NestDenoApplication extends INestApplication {
    /**
     * Get the underlying Deno HTTP server
     */
    getHttpServer(): DenoHttpServer | undefined;
    /**
     * Enable CORS for the application
     * @param options CORS configuration options
     */
    enableCors(options?: DenoCorsOptions): this;
    /**
     * Serve static assets from a directory
     * @param path Path to the static assets directory
     * @param options Static assets options
     */
    useStaticAssets(path: string, options?: DenoStaticAssetsOptions): this;
    /**
     * Set a custom error handler
     * @param handler Error handler function
     */
    setErrorHandler(handler: (error: Error, req: DenoRequest, res: DenoResponse) => void): this;
    /**
     * Set a custom 404 handler
     * @param handler Not found handler function
     */
    setNotFoundHandler(handler: (req: DenoRequest, res: DenoResponse) => void): this;
    /**
     * Start listening for connections
     * @param port Port number to listen on
     * @param callback Callback when server starts
     */
    listen(port: number | string, callback?: () => void): Promise<void>;
    /**
     * Start listening for connections
     * @param port Port number to listen on
     * @param hostname Hostname to bind to
     * @param callback Callback when server starts
     */
    listen(port: number | string, hostname: string, callback?: () => void): Promise<void>;
}

export { type CookieOptions, DenoAdapter, type DenoBodyParserOptions, type DenoCorsOptions, type DenoHttpOptions, type DenoHttpServer, type DenoRequest, type DenoResponse, type DenoStaticAssetsOptions, type ExpressCompatRequest, type ExpressCompatResponse, type ExpressErrorMiddleware, type ExpressLikeApp, type ExpressMiddleware, type ExpressNextFunction, type FastifyCompatReply, type FastifyCompatRequest, type FastifyDoneCallback, type FastifyErrorHook, type FastifyHook, type FastifyHookAsync, type FastifyHookCallback, type FastifyHookName, type FastifyLikeInstance, type FastifyLogger, type FastifyOnSendHook, type FastifyPlugin, type FastifyPluginAsync, type FastifyRouteHandler, type FastifyRouteOptions, type NestDenoApplication, createExpressRequest, createExpressResponse, createFastifyLogger, createFastifyReply, createFastifyRequest, wrapExpressMiddleware, wrapFastifyHook, wrapFastifyPlugin };
