import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DenoAdapter, type DenoRequest, type DenoResponse } from './deno-adapter.js';
import { HttpStatus } from '@nestjs/common';

// Mock Deno global
const mockDenoServer = {
  finished: Promise.resolve(),
  ref: vi.fn(),
  unref: vi.fn(),
  shutdown: vi.fn().mockResolvedValue(undefined),
  port: 3000,
  hostname: 'localhost',
};

const mockDenoServe = vi.fn().mockReturnValue(mockDenoServer);

// Mock file for static asset serving
const mockFile = {
  readable: new ReadableStream(),
  close: vi.fn(),
  stat: vi.fn().mockResolvedValue({
    isDirectory: false,
    size: 1024,
    mtime: new Date('2025-01-01'),
  }),
};

const mockDenoOpen = vi.fn().mockResolvedValue(mockFile);

// @ts-expect-error - Mocking global Deno
globalThis.Deno = {
  serve: mockDenoServe,
  open: mockDenoOpen,
};

describe('DenoAdapter', () => {
  let adapter: DenoAdapter;

  beforeEach(() => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore close errors in tests
    }
  });

  describe('constructor and factory', () => {
    it('should create an instance', () => {
      expect(adapter).toBeInstanceOf(DenoAdapter);
    });

    it('should create instance via static factory', () => {
      const instance = DenoAdapter.create();
      expect(instance).toBeInstanceOf(DenoAdapter);
    });

    it('should accept an instance in constructor', () => {
      const customInstance = { custom: 'instance' };
      const adapterWithInstance = new DenoAdapter(customInstance);
      expect(adapterWithInstance).toBeInstanceOf(DenoAdapter);
    });
  });

  describe('getType', () => {
    it('should return "deno"', () => {
      expect(adapter.getType()).toBe('deno');
    });
  });

  describe('listen', () => {
    it('should start listening on specified port', async () => {
      const callback = vi.fn();
      await adapter.listen(3000, callback);

      expect(mockDenoServe).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3000,
          hostname: '0.0.0.0',
        }),
        expect.any(Function)
      );
    });

    it('should accept port as string', async () => {
      await adapter.listen('3000');

      expect(mockDenoServe).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3000,
        }),
        expect.any(Function)
      );
    });

    it('should accept hostname parameter', async () => {
      await adapter.listen(3000, '127.0.0.1');

      expect(mockDenoServe).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: '127.0.0.1',
        }),
        expect.any(Function)
      );
    });

    it('should accept hostname and callback', async () => {
      const callback = vi.fn();
      await adapter.listen(3000, 'localhost', callback);

      expect(mockDenoServe).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 3000,
          hostname: 'localhost',
        }),
        expect.any(Function)
      );
    });
  });

  describe('close', () => {
    it('should close the server', async () => {
      await adapter.listen(3000);
      await adapter.close();
      // AbortController should be aborted
    });

    it('should handle close when not listening', async () => {
      await expect(adapter.close()).resolves.not.toThrow();
    });
  });

  describe('getHttpServer', () => {
    it('should return undefined before listening', () => {
      expect(adapter.getHttpServer()).toBeUndefined();
    });

    it('should return server after listening', async () => {
      await adapter.listen(3000);
      expect(adapter.getHttpServer()).toBe(mockDenoServer);
    });
  });

  describe('setHttpServer', () => {
    it('should set the HTTP server', () => {
      const customServer = { ...mockDenoServer, port: 4000 };
      adapter.setHttpServer(customServer as any);
      expect(adapter.getHttpServer()).toBe(customServer);
    });
  });

  describe('HTTP method handlers', () => {
    it('should register GET route with handler only', () => {
      const handler = vi.fn();
      adapter.get(handler);
      // Route should be registered at '/'
    });

    it('should register GET route with path and handler', () => {
      const handler = vi.fn();
      adapter.get('/test', handler);
    });

    it('should register POST route', () => {
      const handler = vi.fn();
      adapter.post('/test', handler);
    });

    it('should register PUT route', () => {
      const handler = vi.fn();
      adapter.put('/test', handler);
    });

    it('should register DELETE route', () => {
      const handler = vi.fn();
      adapter.delete('/test', handler);
    });

    it('should register PATCH route', () => {
      const handler = vi.fn();
      adapter.patch('/test', handler);
    });

    it('should register OPTIONS route', () => {
      const handler = vi.fn();
      adapter.options('/test', handler);
    });

    it('should register HEAD route', () => {
      const handler = vi.fn();
      adapter.head('/test', handler);
    });

    it('should register ALL route', () => {
      const handler = vi.fn();
      adapter.all('/test', handler);
    });
  });

  describe('middleware', () => {
    it('should register middleware with handler only', () => {
      const middleware = vi.fn();
      adapter.use(middleware);
    });

    it('should register middleware with path and handler', () => {
      const middleware = vi.fn();
      adapter.use('/api', middleware);
    });
  });

  describe('error and not found handlers', () => {
    it('should set error handler', () => {
      const errorHandler = vi.fn();
      adapter.setErrorHandler(errorHandler);
    });

    it('should set not found handler', () => {
      const notFoundHandler = vi.fn();
      adapter.setNotFoundHandler(notFoundHandler);
    });
  });

  describe('CORS', () => {
    it('should enable CORS with default options', () => {
      adapter.enableCors();
    });

    it('should enable CORS with custom options', () => {
      adapter.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,POST',
        credentials: true,
      });
    });

    it('should enable CORS with array of origins', () => {
      adapter.enableCors({
        origin: ['http://localhost:3000', 'http://example.com'],
      });
    });

    it('should enable CORS with boolean origin', () => {
      adapter.enableCors({
        origin: true,
      });
    });

    it('should enable CORS with function origin', () => {
      adapter.enableCors({
        origin: (origin) => origin === 'http://allowed.com',
      });
    });
  });

  describe('static assets', () => {
    it('should configure static assets', () => {
      adapter.useStaticAssets('./public');
    });

    it('should configure static assets with options', () => {
      adapter.useStaticAssets('./public', {
        prefix: '/static',
        maxAge: 3600,
        etag: true,
      });
    });
  });

  describe('request helpers', () => {
    it('should get request hostname', () => {
      const mockReq: DenoRequest = {
        raw: new Request('http://localhost/test'),
        url: 'http://localhost/test',
        method: 'GET',
        headers: new Headers(),
        params: {},
        query: {},
        hostname: 'localhost',
        path: '/test',
      };
      expect(adapter.getRequestHostname(mockReq)).toBe('localhost');
    });

    it('should get request hostname from header if not set', () => {
      const headers = new Headers();
      headers.set('host', 'example.com');
      const mockReq: DenoRequest = {
        raw: new Request('http://example.com/test'),
        url: 'http://example.com/test',
        method: 'GET',
        headers,
        params: {},
        query: {},
        hostname: undefined,
        path: '/test',
      };
      expect(adapter.getRequestHostname(mockReq)).toBe('example.com');
    });

    it('should get request method', () => {
      const mockReq: DenoRequest = {
        raw: new Request('http://localhost/test'),
        url: 'http://localhost/test',
        method: 'POST',
        headers: new Headers(),
        params: {},
        query: {},
        path: '/test',
      };
      expect(adapter.getRequestMethod(mockReq)).toBe('POST');
    });

    it('should get request URL', () => {
      const mockReq: DenoRequest = {
        raw: new Request('http://localhost/test'),
        url: 'http://localhost/test',
        method: 'GET',
        headers: new Headers(),
        params: {},
        query: {},
        path: '/test',
      };
      expect(adapter.getRequestUrl(mockReq)).toBe('/test');
    });

    it('should get request URL from url if path not set', () => {
      const mockReq: DenoRequest = {
        raw: new Request('http://localhost/api/users'),
        url: 'http://localhost/api/users',
        method: 'GET',
        headers: new Headers(),
        params: {},
        query: {},
        path: undefined,
      };
      expect(adapter.getRequestUrl(mockReq)).toBe('/api/users');
    });
  });

  describe('response helpers', () => {
    const createMockResponse = (): DenoResponse => {
      const headers = new Headers();
      let statusCode = 200;
      let body: BodyInit | null = null;
      let headersSent = false;

      return {
        get statusCode() { return statusCode; },
        set statusCode(code: number) { statusCode = code; },
        headers,
        get body() { return body; },
        set body(b: BodyInit | null | undefined) { body = b ?? null; },
        get headersSent() { return headersSent; },
        set headersSent(sent: boolean) { headersSent = sent; },
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
          if (responseBody !== undefined && responseBody !== null) {
            if (typeof responseBody === 'object') {
              headers.set('Content-Type', 'application/json');
              body = JSON.stringify(responseBody);
            } else {
              body = responseBody as BodyInit;
            }
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
        },
        end(responseBody?: BodyInit | null) {
          headersSent = true;
          body = responseBody ?? null;
        },
      };
    };

    it('should reply with body and status', () => {
      const res = createMockResponse();
      adapter.reply(res, { data: 'test' }, 201);
      expect(res.statusCode).toBe(201);
    });

    it('should reply with null body', () => {
      const res = createMockResponse();
      adapter.reply(res, null);
      expect(res.headersSent).toBe(true);
    });

    it('should reply with undefined body', () => {
      const res = createMockResponse();
      adapter.reply(res, undefined);
      expect(res.headersSent).toBe(true);
    });

    it('should reply with string body', () => {
      const res = createMockResponse();
      adapter.reply(res, 'Hello');
      expect(res.headersSent).toBe(true);
    });

    it('should set status', () => {
      const res = createMockResponse();
      adapter.status(res, 404);
      expect(res.statusCode).toBe(404);
    });

    it('should redirect', () => {
      const res = createMockResponse();
      adapter.redirect(res, 301, '/new-url');
      expect(res.statusCode).toBe(301);
      expect(res.getHeader('Location')).toBe('/new-url');
    });

    it('should set header', () => {
      const res = createMockResponse();
      adapter.setHeader(res, 'X-Custom', 'value');
      expect(res.getHeader('X-Custom')).toBe('value');
    });

    it('should get header', () => {
      const res = createMockResponse();
      res.setHeader('X-Test', 'test');
      expect(adapter.getHeader(res, 'X-Test')).toBe('test');
    });

    it('should append header', () => {
      const res = createMockResponse();
      res.setHeader('X-Values', 'one');
      adapter.appendHeader(res, 'X-Values', 'two');
      expect(res.getHeader('X-Values')).toBe('one, two');
    });

    it('should append header when not existing', () => {
      const res = createMockResponse();
      adapter.appendHeader(res, 'X-New', 'value');
      expect(res.getHeader('X-New')).toBe('value');
    });

    it('should end response', () => {
      const res = createMockResponse();
      adapter.end(res, 'done');
      expect(res.headersSent).toBe(true);
    });

    it('should end response without message', () => {
      const res = createMockResponse();
      adapter.end(res);
      expect(res.headersSent).toBe(true);
    });

    it('should check if headers sent', () => {
      const res = createMockResponse();
      expect(adapter.isHeadersSent(res)).toBe(false);
      res.headersSent = true;
      expect(adapter.isHeadersSent(res)).toBe(true);
    });
  });

  describe('view engine and render', () => {
    it('should warn about unsupported view engine', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      adapter.setViewEngine('ejs');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should warn about unsupported render', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockRes = { statusCode: 200 } as DenoResponse;
      adapter.render(mockRes, 'index', {});
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('other methods', () => {
    it('should register parser middleware (no-op)', () => {
      expect(() => adapter.registerParserMiddleware()).not.toThrow();
    });

    it('should create middleware factory', () => {
      const factory = adapter.createMiddlewareFactory(0);
      expect(typeof factory).toBe('function');
    });

    it('should use middleware factory to register middleware', async () => {
      const factory = adapter.createMiddlewareFactory(0);
      const callback = vi.fn().mockImplementation(async (req: any, res: any, next: any) => {
        await next();
      });

      factory('/test', callback);
      // Middleware should be registered
    });

    it('should initialize HTTP server (no-op)', () => {
      expect(() => adapter.initHttpServer()).not.toThrow();
    });

    it('should apply version filter', () => {
      const handler = vi.fn();
      const result = adapter.applyVersionFilter(handler, '1', {});
      expect(typeof result).toBe('function');

      // Call the returned function
      const mockReq = {} as DenoRequest;
      const mockRes = {} as DenoResponse;
      const mockNext = vi.fn();
      const returnedHandler = result(mockReq, mockRes, mockNext);
      expect(returnedHandler).toBe(handler);
    });
  });

  describe('Express middleware support', () => {
    it('should use Express middleware', () => {
      const middleware = vi.fn((req: any, res: any, next: () => void) => next());
      adapter.useExpressMiddleware(middleware);
    });

    it('should use Express middleware with path', () => {
      const middleware = vi.fn((req: any, res: any, next: () => void) => next());
      adapter.useExpressMiddleware('/api', middleware);
    });

    it('should get Express-like app', () => {
      const app = adapter.getExpressApp();
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
    });

    describe('Express app methods', () => {
      it('should handle app.use with single middleware', () => {
        const app = adapter.getExpressApp();
        const middleware = vi.fn();
        app.use(middleware);
      });

      it('should handle app.use with path and middleware', () => {
        const app = adapter.getExpressApp();
        const middleware = vi.fn();
        app.use('/api', middleware);
      });

      it('should handle app.set', () => {
        const app = adapter.getExpressApp();
        app.set('view engine', 'ejs');
        expect(app.settings['view engine']).toBe('ejs');
      });

      it('should handle app.enable', () => {
        const app = adapter.getExpressApp();
        app.enable('strict routing');
        expect(app.enabled('strict routing')).toBe(true);
      });

      it('should handle app.disable', () => {
        const app = adapter.getExpressApp();
        app.disable('x-powered-by');
        expect(app.disabled('x-powered-by')).toBe(true);
      });

      it('should handle HTTP method shortcuts', () => {
        const app = adapter.getExpressApp();
        const handler = vi.fn();

        app.get('/test', handler);
        app.post('/test', handler);
        app.put('/test', handler);
        app.delete('/test', handler);
        app.patch('/test', handler);
        app.options('/test', handler);
        app.head('/test', handler);
        app.all('/test', handler);
      });
    });
  });

  describe('Fastify middleware support', () => {
    it('should use Fastify hook', () => {
      const hook = vi.fn(async () => {});
      adapter.useFastifyHook('onRequest', hook);
    });

    it('should register Fastify plugin', async () => {
      const plugin = vi.fn(async () => {});
      await adapter.registerFastifyPlugin(plugin);
    });

    it('should get Fastify-like instance', () => {
      const fastify = adapter.getFastifyInstance();
      expect(typeof fastify.addHook).toBe('function');
      expect(typeof fastify.register).toBe('function');
      expect(typeof fastify.decorate).toBe('function');
    });

    describe('Fastify instance methods', () => {
      it('should handle decorators', () => {
        const fastify = adapter.getFastifyInstance();

        fastify.decorate('test', 'value');
        expect(fastify.hasDecorator('test')).toBe(true);

        fastify.decorateRequest('reqProp', null);
        expect(fastify.hasRequestDecorator('reqProp')).toBe(true);

        fastify.decorateReply('replyProp', null);
        expect(fastify.hasReplyDecorator('replyProp')).toBe(true);
      });

      it('should handle addHook', () => {
        const fastify = adapter.getFastifyInstance();
        const hook = vi.fn();

        fastify.addHook('onRequest', hook);
        fastify.addHook('preHandler', hook);
        fastify.addHook('onResponse', hook);
      });

      it('should handle register', () => {
        const fastify = adapter.getFastifyInstance();
        const plugin = vi.fn(async () => {});

        fastify.register(plugin);
      });

      it('should handle route registration', () => {
        const fastify = adapter.getFastifyInstance();
        const handler = vi.fn();

        fastify.route({
          method: 'GET',
          url: '/test',
          handler,
        });
      });

      it('should handle route with multiple methods', () => {
        const fastify = adapter.getFastifyInstance();
        const handler = vi.fn();

        fastify.route({
          method: ['GET', 'POST'],
          url: '/multi',
          handler,
        });
      });

      it('should handle HTTP method shortcuts', () => {
        const fastify = adapter.getFastifyInstance();
        const handler = vi.fn();

        fastify.get('/test', handler);
        fastify.post('/test', handler);
        fastify.put('/test', handler);
        fastify.delete('/test', handler);
        fastify.patch('/test', handler);
        fastify.options('/test', handler);
        fastify.head('/test', handler);
        fastify.all('/test', handler);
      });

      it('should handle HTTP method shortcuts with options', () => {
        const fastify = adapter.getFastifyInstance();
        const handler = vi.fn();

        fastify.get('/test', { preHandler: [vi.fn()] }, handler);
      });

      it('should have a logger', () => {
        const fastify = adapter.getFastifyInstance();
        expect(typeof fastify.log.info).toBe('function');
        expect(typeof fastify.log.error).toBe('function');
      });
    });
  });
});

describe('DenoAdapter request handling', () => {
  let adapter: DenoAdapter;
  let requestHandler: (request: Request) => Promise<Response>;

  beforeEach(() => {
    adapter = new DenoAdapter();

    // Capture the request handler when listen is called
    mockDenoServe.mockImplementation((options, handler) => {
      requestHandler = handler;
      return mockDenoServer;
    });
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    vi.clearAllMocks();
  });

  it('should handle GET request to registered route', async () => {
    adapter.get('/test', (req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test')
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });
  });

  it('should handle POST request with JSON body', async () => {
    adapter.post('/data', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.received).toEqual({ test: 'data' });
  });

  it('should return 404 for unregistered route', async () => {
    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/nonexistent')
    );

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should handle route parameters', async () => {
    adapter.get('/users/:id', (req, res) => {
      res.json({ userId: req.params.id });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/users/123')
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.userId).toBe('123');
  });

  it('should handle query parameters', async () => {
    adapter.get('/search', (req, res) => {
      res.json({ query: req.query });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/search?q=test&page=1')
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.query).toEqual({ q: 'test', page: '1' });
  });

  it('should run middleware before route handler', async () => {
    const middlewareOrder: string[] = [];

    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('middleware1');
      await next();
    });

    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('middleware2');
      await next();
    });

    adapter.get('/test', (req, res) => {
      middlewareOrder.push('handler');
      res.json({ order: middlewareOrder });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test')
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.order).toEqual(['middleware1', 'middleware2', 'handler']);
  });

  it('should handle middleware that sends response', async () => {
    adapter.use((_req, res, _next) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    adapter.get('/test', (_req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test')
    );

    expect(response.status).toBe(401);
  });

  it('should handle CORS preflight request', async () => {
    adapter.enableCors({
      origin: '*',
      methods: 'GET,POST',
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST');
  });

  it('should handle errors and call error handler', async () => {
    adapter.setErrorHandler((error, req, res) => {
      res.status(500).json({ error: error.message });
    });

    adapter.get('/error', () => {
      throw new Error('Test error');
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/error')
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Test error');
  });

  it('should handle custom not found handler', async () => {
    adapter.setNotFoundHandler((req, res) => {
      res.status(404).json({ message: 'Custom not found' });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/nonexistent')
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.message).toBe('Custom not found');
  });

  it('should handle form data body', async () => {
    adapter.post('/form', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const formData = new URLSearchParams();
    formData.append('name', 'John');
    formData.append('email', 'john@example.com');

    const response = await requestHandler(
      new Request('http://localhost:3000/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })
    );

    expect(response.status).toBe(200);
  });

  it('should handle text body', async () => {
    adapter.post('/text', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/text', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'Hello World',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.received).toBe('Hello World');
  });

  it('should handle malformed JSON body gracefully', async () => {
    adapter.post('/json', (req, res) => {
      res.json({ body: req.body });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.body).toBeUndefined();
  });

  it('should handle errors without error handler', async () => {
    adapter.get('/error', () => {
      throw new Error('Unhandled error');
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/error')
    );

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = await response.json();
    expect(body.message).toBe('Unhandled error');
  });

  it('should handle CORS with array of origins', async () => {
    adapter.enableCors({
      origin: ['http://allowed.com', 'http://example.com'],
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://allowed.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
  });

  it('should handle CORS with function origin', async () => {
    adapter.enableCors({
      origin: (origin) => origin === 'http://dynamic.com' ? origin : false,
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://dynamic.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://dynamic.com');
  });

  it('should apply CORS headers on regular requests', async () => {
    adapter.enableCors({
      origin: '*',
      credentials: true,
      exposedHeaders: ['X-Custom'],
      maxAge: 3600,
    });

    adapter.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('X-Custom');
    expect(response.headers.get('Access-Control-Max-Age')).toBe('3600');
  });

  it('should handle allowedHeaders from request', async () => {
    adapter.enableCors({
      origin: '*',
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://example.com',
          'Access-Control-Request-Headers': 'X-Custom, Content-Type',
        },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('X-Custom, Content-Type');
  });

  it('should handle CORS with explicit allowed headers', async () => {
    adapter.enableCors({
      origin: '*',
      allowedHeaders: ['X-Custom', 'Authorization'],
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('X-Custom,Authorization');
  });

  it('should handle CORS with exposed headers as string', async () => {
    adapter.enableCors({
      origin: '*',
      exposedHeaders: 'X-One,X-Two',
    });

    adapter.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('X-One,X-Two');
  });

  it('should handle CORS with methods as array', async () => {
    adapter.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT'],
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT');
  });

  it('should handle CORS with allowed headers as array', async () => {
    adapter.enableCors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type,Authorization');
  });

  it('should handle ALL routes matching any method', async () => {
    adapter.all('/any', (req, res) => {
      res.json({ method: req.method });
    });

    await adapter.listen(3000);

    const getResponse = await requestHandler(
      new Request('http://localhost:3000/any', { method: 'GET' })
    );
    expect(getResponse.status).toBe(200);

    const postResponse = await requestHandler(
      new Request('http://localhost:3000/any', { method: 'POST' })
    );
    expect(postResponse.status).toBe(200);
  });

  it('should handle middleware for specific path', async () => {
    adapter.use('/api', async (_req, _res, next) => {
      await next();
    });

    adapter.get('/api/test', (req, res) => {
      res.json({ ok: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/api/test')
    );

    expect(response.status).toBe(200);
  });

  it('should handle multipart form data', async () => {
    adapter.post('/upload', (req, res) => {
      res.json({ hasBody: req.body !== undefined });
    });

    await adapter.listen(3000);

    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.txt');

    const response = await requestHandler(
      new Request('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      })
    );

    expect(response.status).toBe(200);
  });

  it('should handle DELETE request with body', async () => {
    adapter.delete('/item/:id', (req, res) => {
      res.json({ id: req.params.id, body: req.body });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/item/123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'test' }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe('123');
    expect(body.body).toEqual({ reason: 'test' });
  });

  it('should handle route with regex-like path', async () => {
    adapter.get('/files/:path*', (req, res) => {
      res.json({ path: req.params.path });
    });

    await adapter.listen(3000);

    // The wildcard should match anything
    const response = await requestHandler(
      new Request('http://localhost:3000/files/deep/nested/file.txt')
    );

    // This tests the wildcard pattern matching
    expect(response.status).toBe(200);
  });

  it('should handle CORS with origin function returning string', async () => {
    adapter.enableCors({
      origin: (origin) => `allowed-${origin}`,
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://test.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('allowed-http://test.com');
  });

  it('should handle CORS origin false rejecting origin', async () => {
    adapter.enableCors({
      origin: false,
    });

    adapter.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('');
  });

  it('should handle path-specific middleware that does not match', async () => {
    adapter.use('/admin', async (_req, res, _next) => {
      res.status(403).json({ error: 'Admin only' });
    });

    adapter.get('/public', (req, res) => {
      res.json({ public: true });
    });

    await adapter.listen(3000);

    // This path should not trigger the /admin middleware
    const response = await requestHandler(
      new Request('http://localhost:3000/public')
    );

    expect(response.status).toBe(200);
  });

  it('should handle multiple route parameters', async () => {
    adapter.get('/users/:userId/posts/:postId', (req, res) => {
      res.json(req.params);
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/users/123/posts/456')
    );

    const body = await response.json();
    expect(body.userId).toBe('123');
    expect(body.postId).toBe('456');
  });

  it('should handle OPTIONS preflight with custom success status', async () => {
    adapter.enableCors({
      origin: '*',
      optionsSuccessStatus: 200,
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { Origin: 'http://example.com' },
      })
    );

    expect(response.status).toBe(200);
  });

  it('should serve static assets', async () => {
    adapter.useStaticAssets('./public', {
      prefix: '/static',
      maxAge: 3600,
      immutable: true,
      etag: true,
      lastModified: true,
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/static/file.js')
    );

    // The static asset should be served (mock returns a file)
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/javascript');
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    expect(response.headers.get('Cache-Control')).toContain('immutable');
    expect(response.headers.get('ETag')).toBeDefined();
    expect(response.headers.get('Last-Modified')).toBeDefined();
  });

  it('should handle static asset directory with index file', async () => {
    const dirFile = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn()
        .mockResolvedValueOnce({ isDirectory: true, size: 0, mtime: null })
        .mockResolvedValueOnce({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(dirFile);

    adapter.useStaticAssets('./public', { prefix: '/', index: 'index.html' });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/subdir')
    );

    // Should redirect to index.html
    expect(mockDenoOpen).toHaveBeenCalled();
  });

  it('should handle static asset not found', async () => {
    const notFoundError = new Error('File not found');
    (notFoundError as any).name = 'NotFound';
    mockDenoOpen.mockRejectedValue(notFoundError);

    adapter.useStaticAssets('./public', { prefix: '/' });

    adapter.get('/fallback', (req, res) => {
      res.json({ fallback: true });
    });

    await adapter.listen(3000);

    // Static asset fails, should fall through to routes
    const response = await requestHandler(
      new Request('http://localhost:3000/nonexistent.txt')
    );

    expect(response.status).toBe(404);
  });

  it('should handle static asset error that is not NotFound', async () => {
    const otherError = new Error('Permission denied');
    mockDenoOpen.mockRejectedValue(otherError);

    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    // The adapter catches errors and returns a 500 response
    const response = await requestHandler(
      new Request('http://localhost:3000/file.txt')
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).toBe('Permission denied');
  });

  it('should handle static asset with custom index file name', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn()
        .mockResolvedValueOnce({ isDirectory: true, size: 0, mtime: null })
        .mockResolvedValueOnce({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/', index: 'main.html' });

    await adapter.listen(3000);

    await requestHandler(new Request('http://localhost:3000/folder'));

    // Should have tried to open main.html
  });

  it('should handle static asset directory with index disabled', async () => {
    const dirFile = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: true, size: 0, mtime: null }),
    };
    mockDenoOpen.mockResolvedValue(dirFile);

    adapter.useStaticAssets('./public', { prefix: '/', index: false });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/folder')
    );

    // Should return 404 since index is disabled
    expect(response.status).toBe(404);
  });

  it('should handle static asset with various file extensions', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    // Test various file types
    const extensions = ['html', 'css', 'json', 'png', 'jpg', 'svg', 'pdf', 'txt'];
    for (const ext of extensions) {
      mockDenoOpen.mockResolvedValue(fileObj);
      const response = await requestHandler(
        new Request(`http://localhost:3000/file.${ext}`)
      );
      expect(response.status).toBe(200);
    }
  });

  it('should handle static asset without mtime', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: null }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/', lastModified: true, etag: true });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/file.txt')
    );

    expect(response.status).toBe(200);
  });

  it('should handle static asset with etag disabled', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/', etag: false });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/file.txt')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('ETag')).toBeNull();
  });

  it('should handle static asset with lastModified disabled', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/', lastModified: false });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/file.txt')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Last-Modified')).toBeNull();
  });

  it('should handle unknown file extension', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/file.unknown')
    );

    expect(response.status).toBe(200);
    // Unknown extension should default to octet-stream
    expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
  });

  it('should handle middleware created via factory', async () => {
    const factory = adapter.createMiddlewareFactory(0);
    const middlewareCallback = vi.fn().mockImplementation(
      async (_req: any, _res: any, next: () => Promise<void>) => {
        await next();
      }
    );

    factory('/api', middlewareCallback);

    adapter.get('/api/test', (req, res) => {
      res.json({ ok: true });
    });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/api/test')
    );

    expect(response.status).toBe(200);
    expect(middlewareCallback).toHaveBeenCalled();
  });

  it('should handle static assets without maxAge option', async () => {
    const fileObj = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: false, size: 100, mtime: new Date() }),
    };
    mockDenoOpen.mockResolvedValue(fileObj);

    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    const response = await requestHandler(
      new Request('http://localhost:3000/file.txt')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBeNull();
  });

  it('should handle Express middleware use with multiple handlers', () => {
    const app = adapter.getExpressApp();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    app.use(handler1, handler2);
  });

  it('should handle Fastify instance addHook for various hook types', () => {
    const fastify = adapter.getFastifyInstance();
    const hook = vi.fn();

    fastify.addHook('preParsing', hook);
    fastify.addHook('preValidation', hook);
  });
});
