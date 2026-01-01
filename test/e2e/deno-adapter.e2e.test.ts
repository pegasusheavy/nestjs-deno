import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DenoAdapter, type DenoRequest, type DenoResponse } from '../../src/index.js';
import { HttpStatus } from '@nestjs/common';

// Mock Deno global for testing
let serverHandler: ((request: Request) => Promise<Response>) | null = null;
let serverPort = 3000;

const mockFile = {
  readable: new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('file content'));
      controller.close();
    },
  }),
  close: vi.fn(),
  stat: vi.fn().mockResolvedValue({
    isDirectory: false,
    size: 12,
    mtime: new Date('2025-01-01'),
  }),
};

const mockDenoOpen = vi.fn().mockResolvedValue(mockFile);

const mockDenoServer = {
  finished: Promise.resolve(),
  ref: vi.fn(),
  unref: vi.fn(),
  shutdown: vi.fn().mockResolvedValue(undefined),
  port: 3000,
  hostname: 'localhost',
};

const mockDenoServe = vi.fn().mockImplementation((options, handler) => {
  serverHandler = handler;
  serverPort = options.port || 3000;
  return mockDenoServer;
});

// @ts-expect-error - Mocking global Deno
globalThis.Deno = {
  serve: mockDenoServe,
  open: mockDenoOpen,
};

// Helper function to make requests
async function makeRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!serverHandler) {
    throw new Error('Server not started');
  }

  const url = `http://localhost:${serverPort}${path}`;
  const request = new Request(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return serverHandler(request);
}

describe('DenoAdapter E2E - HTTP Methods', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
    mockDenoOpen.mockResolvedValue(mockFile);
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should handle GET requests', async () => {
    adapter.get('/api/hello', (_req, res) => {
      res.json({ message: 'Hello World' });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/hello');
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Hello World');
  });

  it('should handle POST requests with body', async () => {
    adapter.post('/api/items', (req, res) => {
      res.status(201).json({ created: true, ...req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Item', price: 99.99 }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.created).toBe(true);
    expect(body.name).toBe('Test Item');
    expect(body.price).toBe(99.99);
  });

  it('should handle PUT requests', async () => {
    adapter.put('/api/items/:id', (req, res) => {
      res.json({ updated: true, id: req.params.id, ...req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items/123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Item' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.updated).toBe(true);
    expect(body.id).toBe('123');
    expect(body.name).toBe('Updated Item');
  });

  it('should handle DELETE requests', async () => {
    adapter.delete('/api/items/:id', (req, res) => {
      res.json({ deleted: true, id: req.params.id });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items/456', {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.deleted).toBe(true);
    expect(body.id).toBe('456');
  });

  it('should handle PATCH requests', async () => {
    adapter.patch('/api/items/:id', (req, res) => {
      res.json({ patched: true, id: req.params.id, ...req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items/789', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.patched).toBe(true);
    expect(body.id).toBe('789');
    expect(body.status).toBe('active');
  });

  it('should handle OPTIONS requests', async () => {
    adapter.options('/api/items', (_req, res) => {
      res.setHeader('Allow', 'GET, POST, PUT, DELETE');
      res.status(204).end();
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items', {
      method: 'OPTIONS',
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Allow')).toBe('GET, POST, PUT, DELETE');
  });

  it('should handle HEAD requests', async () => {
    adapter.head('/api/items', (_req, res) => {
      res.setHeader('X-Total-Count', '42');
      res.status(200).end();
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/items', {
      method: 'HEAD',
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Total-Count')).toBe('42');
  });

  it('should handle ALL routes matching any method', async () => {
    adapter.all('/api/any', (req, res) => {
      res.json({ method: req.method, path: '/api/any' });
    });

    await adapter.listen(3000);

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    for (const method of methods) {
      const response = await makeRequest('/api/any', {
        method,
        body: method !== 'GET' ? JSON.stringify({}) : undefined,
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.method).toBe(method);
    }
  });
});

describe('DenoAdapter E2E - Route Parameters', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should extract single route parameter', async () => {
    adapter.get('/users/:id', (req, res) => {
      res.json({ userId: req.params.id });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/users/user-123');
    const body = await response.json();
    expect(body.userId).toBe('user-123');
  });

  it('should extract multiple route parameters', async () => {
    adapter.get('/users/:userId/posts/:postId', (req, res) => {
      res.json({
        userId: req.params.userId,
        postId: req.params.postId,
      });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/users/user-1/posts/post-42');
    const body = await response.json();
    expect(body.userId).toBe('user-1');
    expect(body.postId).toBe('post-42');
  });

  it('should handle deeply nested routes', async () => {
    adapter.get('/api/v1/users/:userId/posts/:postId/comments/:commentId', (req, res) => {
      res.json({
        userId: req.params.userId,
        postId: req.params.postId,
        commentId: req.params.commentId,
      });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/v1/users/1/posts/2/comments/3');
    const body = await response.json();
    expect(body.userId).toBe('1');
    expect(body.postId).toBe('2');
    expect(body.commentId).toBe('3');
  });
});

describe('DenoAdapter E2E - Query Parameters', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should parse query parameters', async () => {
    adapter.get('/search', (req, res) => {
      res.json(req.query);
    });

    await adapter.listen(3000);

    const response = await makeRequest('/search?q=test&page=1&limit=10');
    const body = await response.json();
    expect(body.q).toBe('test');
    expect(body.page).toBe('1');
    expect(body.limit).toBe('10');
  });

  it('should handle special characters in query params', async () => {
    adapter.get('/search', (req, res) => {
      res.json(req.query);
    });

    await adapter.listen(3000);

    const response = await makeRequest('/search?name=John%20Doe&email=test%40example.com');
    const body = await response.json();
    expect(body.name).toBe('John Doe');
    expect(body.email).toBe('test@example.com');
  });

  it('should handle empty query string', async () => {
    adapter.get('/search', (req, res) => {
      res.json({ query: req.query, empty: Object.keys(req.query).length === 0 });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/search');
    const body = await response.json();
    expect(body.empty).toBe(true);
  });
});

describe('DenoAdapter E2E - Middleware', () => {
  let adapter: DenoAdapter;
  let middlewareOrder: string[];

  beforeEach(async () => {
    adapter = new DenoAdapter();
    middlewareOrder = [];
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should execute global middleware', async () => {
    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('global');
      await next();
    });

    adapter.get('/test', (_req, res) => {
      middlewareOrder.push('handler');
      res.json({ order: middlewareOrder });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    const body = await response.json();
    expect(body.order).toEqual(['global', 'handler']);
  });

  it('should execute multiple middleware in order', async () => {
    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('first');
      await next();
    });

    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('second');
      await next();
    });

    adapter.use(async (_req, _res, next) => {
      middlewareOrder.push('third');
      await next();
    });

    adapter.get('/test', (_req, res) => {
      middlewareOrder.push('handler');
      res.json({ order: middlewareOrder });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    const body = await response.json();
    expect(body.order).toEqual(['first', 'second', 'third', 'handler']);
  });

  it('should execute path-specific middleware', async () => {
    adapter.use('/api', async (_req, _res, next) => {
      middlewareOrder.push('api-middleware');
      await next();
    });

    adapter.get('/api/data', (_req, res) => {
      middlewareOrder.push('api-handler');
      res.json({ order: middlewareOrder });
    });

    adapter.get('/other', (_req, res) => {
      middlewareOrder.push('other-handler');
      res.json({ order: middlewareOrder });
    });

    await adapter.listen(3000);

    // Request to /api should trigger middleware
    let response = await makeRequest('/api/data');
    let body = await response.json();
    expect(body.order).toContain('api-middleware');

    middlewareOrder = [];

    // Request to /other should NOT trigger /api middleware
    response = await makeRequest('/other');
    body = await response.json();
    expect(body.order).not.toContain('api-middleware');
  });

  it('should allow middleware to modify request', async () => {
    adapter.use(async (req, _res, next) => {
      (req as any).customData = { added: true };
      await next();
    });

    adapter.get('/test', (req, res) => {
      res.json({ customData: (req as any).customData });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    const body = await response.json();
    expect(body.customData).toEqual({ added: true });
  });

  it('should allow middleware to short-circuit', async () => {
    adapter.use(async (_req, res, _next) => {
      res.status(401).json({ error: 'Unauthorized' });
      // Not calling next()
    });

    adapter.get('/test', (_req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });
});

describe('DenoAdapter E2E - Error Handling', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should return 404 for unknown routes', async () => {
    adapter.get('/known', (_req, res) => {
      res.json({ found: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/unknown');
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('should handle thrown errors', async () => {
    adapter.get('/error', () => {
      throw new Error('Something went wrong');
    });

    await adapter.listen(3000);

    const response = await makeRequest('/error');
    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = await response.json();
    expect(body.message).toBe('Something went wrong');
  });

  it('should use custom error handler', async () => {
    adapter.setErrorHandler((error, _req, res) => {
      res.status(500).json({
        customError: true,
        message: (error as Error).message,
      });
    });

    adapter.get('/error', () => {
      throw new Error('Custom handled error');
    });

    await adapter.listen(3000);

    const response = await makeRequest('/error');
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.customError).toBe(true);
    expect(body.message).toBe('Custom handled error');
  });

  it('should use custom not found handler', async () => {
    adapter.setNotFoundHandler((_req, res) => {
      res.status(404).json({
        customNotFound: true,
        message: 'Route not found',
      });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/nonexistent');
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.customNotFound).toBe(true);
  });

  it('should handle async errors', async () => {
    adapter.get('/async-error', async () => {
      await Promise.resolve();
      throw new Error('Async error');
    });

    await adapter.listen(3000);

    const response = await makeRequest('/async-error');
    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('DenoAdapter E2E - CORS', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should handle CORS preflight requests', async () => {
    adapter.enableCors({
      origin: '*',
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 3600,
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT,DELETE');
    expect(response.headers.get('Access-Control-Max-Age')).toBe('3600');
  });

  it('should add CORS headers to regular requests', async () => {
    adapter.enableCors({
      origin: '*',
      credentials: true,
      exposedHeaders: ['X-Custom-Header'],
    });

    adapter.get('/api/data', (_req, res) => {
      res.json({ data: 'test' });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/data', {
      headers: {
        Origin: 'http://example.com',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('X-Custom-Header');
  });

  it('should handle array of allowed origins', async () => {
    adapter.enableCors({
      origin: ['http://allowed.com', 'http://localhost:3000'],
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://allowed.com',
      },
    });

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
  });

  it('should handle function-based origin', async () => {
    adapter.enableCors({
      origin: (origin) => origin?.includes('allowed') ? origin : false,
    });

    await adapter.listen(3000);

    // Allowed origin
    let response = await makeRequest('/api/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://allowed-site.com',
      },
    });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed-site.com');

    // Disallowed origin
    response = await makeRequest('/api/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://blocked-site.com',
      },
    });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('');
  });
});

describe('DenoAdapter E2E - Static Files', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
    mockDenoOpen.mockResolvedValue(mockFile);
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should serve static files', async () => {
    adapter.useStaticAssets('./public', {
      prefix: '/static',
      maxAge: 3600,
      etag: true,
      lastModified: true,
    });

    await adapter.listen(3000);

    const response = await makeRequest('/static/file.txt');

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    expect(response.headers.get('ETag')).toBeDefined();
    expect(response.headers.get('Last-Modified')).toBeDefined();
  });

  it('should serve static files with correct MIME types', async () => {
    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    // Test JavaScript file
    let response = await makeRequest('/app.js');
    expect(response.headers.get('Content-Type')).toBe('application/javascript');

    // Test CSS file
    response = await makeRequest('/style.css');
    expect(response.headers.get('Content-Type')).toBe('text/css');

    // Test HTML file
    response = await makeRequest('/index.html');
    expect(response.headers.get('Content-Type')).toBe('text/html');

    // Test JSON file
    response = await makeRequest('/data.json');
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return 404 for non-existent static files', async () => {
    const notFoundError = new Error('File not found');
    (notFoundError as any).name = 'NotFound';
    mockDenoOpen.mockRejectedValue(notFoundError);

    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    const response = await makeRequest('/nonexistent.txt');
    expect(response.status).toBe(404);
  });

  it('should handle static files with immutable cache', async () => {
    adapter.useStaticAssets('./public', {
      prefix: '/',
      maxAge: 31536000,
      immutable: true,
    });

    await adapter.listen(3000);

    const response = await makeRequest('/asset.js');
    expect(response.headers.get('Cache-Control')).toContain('max-age=31536000');
    expect(response.headers.get('Cache-Control')).toContain('immutable');
  });
});

describe('DenoAdapter E2E - Body Parsing', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should parse JSON body', async () => {
    adapter.post('/json', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: { key: 'nested-value' },
      }),
    });

    const body = await response.json();
    expect(body.received.string).toBe('value');
    expect(body.received.number).toBe(42);
    expect(body.received.boolean).toBe(true);
    expect(body.received.array).toEqual([1, 2, 3]);
    expect(body.received.nested.key).toBe('nested-value');
  });

  it('should parse form-urlencoded body', async () => {
    adapter.post('/form', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const formData = new URLSearchParams();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');

    const response = await makeRequest('/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const body = await response.json();
    expect(body.received.name).toBe('John Doe');
    expect(body.received.email).toBe('john@example.com');
  });

  it('should parse text body', async () => {
    adapter.post('/text', (req, res) => {
      res.json({ received: req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/text', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Hello, World!',
    });

    const body = await response.json();
    expect(body.received).toBe('Hello, World!');
  });

  it('should handle empty body', async () => {
    adapter.post('/empty', (req, res) => {
      res.json({ hasBody: !!req.body, body: req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/empty', {
      method: 'POST',
    });

    const body = await response.json();
    expect(body.hasBody).toBe(false);
  });

  it('should handle malformed JSON gracefully', async () => {
    adapter.post('/json', (req, res) => {
      res.json({ body: req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json }',
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.body).toBeUndefined();
  });
});

describe('DenoAdapter E2E - Express Compatibility', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should support Express-style middleware', async () => {
    let middlewareCalled = false;
    let requestModified = false;

    adapter.useExpressMiddleware((req: any, _res: any, next: () => void) => {
      middlewareCalled = true;
      req.expressData = 'from-express';
      requestModified = !!req.expressData;
      next();
    });

    adapter.get('/test', (_req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    expect(response.status).toBe(200);
    expect(middlewareCalled).toBe(true);
    expect(requestModified).toBe(true);
  });

  it('should provide Express-compatible app interface', () => {
    const expressApp = adapter.getExpressApp();

    expect(typeof expressApp.use).toBe('function');
    expect(typeof expressApp.get).toBe('function');
    expect(typeof expressApp.post).toBe('function');
    expect(typeof expressApp.put).toBe('function');
    expect(typeof expressApp.delete).toBe('function');
    expect(typeof expressApp.patch).toBe('function');
    expect(typeof expressApp.set).toBe('function');
    expect(typeof expressApp.enable).toBe('function');
    expect(typeof expressApp.disable).toBe('function');
  });

  it('should support Express app.set/get for settings', () => {
    const expressApp = adapter.getExpressApp();

    expressApp.set('view engine', 'ejs');
    expressApp.set('trust proxy', true);

    expect(expressApp.settings['view engine']).toBe('ejs');
    expect(expressApp.settings['trust proxy']).toBe(true);
  });
});

describe('DenoAdapter E2E - Fastify Compatibility', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should support Fastify-style hooks', async () => {
    let hookCalled = false;

    adapter.useFastifyHook('onRequest', async (_request: any, _reply: any) => {
      hookCalled = true;
    });

    adapter.get('/test', (_req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    expect(response.status).toBe(200);
    expect(hookCalled).toBe(true);
  });

  it('should provide Fastify-compatible instance interface', () => {
    const fastify = adapter.getFastifyInstance();

    expect(typeof fastify.addHook).toBe('function');
    expect(typeof fastify.register).toBe('function');
    expect(typeof fastify.decorate).toBe('function');
    expect(typeof fastify.decorateRequest).toBe('function');
    expect(typeof fastify.decorateReply).toBe('function');
    expect(typeof fastify.get).toBe('function');
    expect(typeof fastify.post).toBe('function');
    expect(typeof fastify.put).toBe('function');
    expect(typeof fastify.delete).toBe('function');
    expect(typeof fastify.route).toBe('function');
    expect(fastify.log).toBeDefined();
  });

  it('should support Fastify decorators', () => {
    const fastify = adapter.getFastifyInstance();

    fastify.decorate('utility', { helper: () => 'value' });
    expect(fastify.hasDecorator('utility')).toBe(true);

    fastify.decorateRequest('user', null);
    expect(fastify.hasRequestDecorator('user')).toBe(true);

    fastify.decorateReply('customMethod', () => {});
    expect(fastify.hasReplyDecorator('customMethod')).toBe(true);
  });
});

describe('DenoAdapter E2E - Response Methods', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should support json() response', async () => {
    adapter.get('/json', (_req, res) => {
      res.json({ message: 'JSON response' });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/json');
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const body = await response.json();
    expect(body.message).toBe('JSON response');
  });

  it('should support status chaining', async () => {
    adapter.get('/created', (_req, res) => {
      res.status(201).json({ created: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/created');
    expect(response.status).toBe(201);
  });

  it('should support redirect', async () => {
    adapter.get('/redirect', (_req, res) => {
      res.redirect('/new-location');
    });

    await adapter.listen(3000);

    const response = await makeRequest('/redirect');
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/new-location');
  });

  it('should support redirect with custom status', async () => {
    adapter.get('/permanent-redirect', (_req, res) => {
      res.redirect('/permanent', 301);
    });

    await adapter.listen(3000);

    const response = await makeRequest('/permanent-redirect');
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/permanent');
  });

  it('should support setHeader', async () => {
    adapter.get('/headers', (_req, res) => {
      res.setHeader('X-Custom-Header', 'custom-value');
      res.setHeader('X-Another-Header', 'another-value');
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/headers');
    expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(response.headers.get('X-Another-Header')).toBe('another-value');
  });

  it('should support send with string', async () => {
    adapter.get('/text', (_req, res) => {
      res.send('Plain text response');
    });

    await adapter.listen(3000);

    const response = await makeRequest('/text');
    const text = await response.text();
    expect(text).toBe('Plain text response');
  });

  it('should support end()', async () => {
    adapter.get('/end', (_req, res) => {
      res.status(204).end();
    });

    await adapter.listen(3000);

    const response = await makeRequest('/end');
    expect(response.status).toBe(204);
  });
});

describe('DenoAdapter E2E - Server Lifecycle', () => {
  it('should start and stop the server', async () => {
    const adapter = new DenoAdapter();

    adapter.get('/test', (_req, res) => {
      res.json({ running: true });
    });

    await adapter.listen(3000);
    expect(mockDenoServe).toHaveBeenCalled();

    const response = await makeRequest('/test');
    expect(response.status).toBe(200);

    await adapter.close();
  });

  it('should get server type', () => {
    const adapter = new DenoAdapter();
    expect(adapter.getType()).toBe('deno');
  });

  it('should create adapter via static factory', () => {
    const adapter = DenoAdapter.create();
    expect(adapter).toBeInstanceOf(DenoAdapter);
  });

  it('should handle multiple listen calls gracefully', async () => {
    const adapter = new DenoAdapter();

    adapter.get('/test', (_req, res) => {
      res.json({ running: true });
    });

    await adapter.listen(3000);
    await adapter.listen(3001); // Should not fail

    await adapter.close();
  });
});

describe('DenoAdapter E2E - Edge Cases', () => {
  let adapter: DenoAdapter;

  beforeEach(async () => {
    adapter = new DenoAdapter();
    vi.clearAllMocks();
    mockDenoOpen.mockResolvedValue(mockFile);
  });

  afterEach(async () => {
    try {
      await adapter.close();
    } catch {
      // Ignore
    }
    serverHandler = null;
  });

  it('should handle route with wildcard patterns', async () => {
    adapter.get('/items/:id', (req, res) => {
      res.json({ id: req.params.id });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/items/123');
    const body = await response.json();
    expect(body.id).toBe('123');
  });

  it('should handle middleware that returns a promise', async () => {
    adapter.use(async (_req, _res, next) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      await next();
    });

    adapter.get('/test', (_req, res) => {
      res.json({ success: true });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test');
    expect(response.status).toBe(200);
  });

  it('should handle multiple routes with same path different methods', async () => {
    adapter.get('/resource', (_req, res) => {
      res.json({ method: 'GET' });
    });

    adapter.post('/resource', (_req, res) => {
      res.status(201).json({ method: 'POST' });
    });

    adapter.put('/resource', (_req, res) => {
      res.json({ method: 'PUT' });
    });

    await adapter.listen(3000);

    let response = await makeRequest('/resource');
    expect((await response.json()).method).toBe('GET');

    response = await makeRequest('/resource', { method: 'POST', body: '{}' });
    expect((await response.json()).method).toBe('POST');

    response = await makeRequest('/resource', { method: 'PUT', body: '{}' });
    expect((await response.json()).method).toBe('PUT');
  });

  it('should handle CORS with optionsSuccessStatus', async () => {
    adapter.enableCors({
      origin: '*',
      optionsSuccessStatus: 200,
    });

    await adapter.listen(3000);

    const response = await makeRequest('/api/data', {
      method: 'OPTIONS',
      headers: { Origin: 'http://example.com' },
    });

    expect(response.status).toBe(200);
  });

  it('should handle request with text content-type', async () => {
    adapter.post('/text-content', (req, res) => {
      res.status(201).json({ body: req.body, type: typeof req.body });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/text-content', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'plain text body',
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.body).toBe('plain text body');
  });

  it('should handle static assets with different extensions', async () => {
    adapter.useStaticAssets('./public', { prefix: '/' });

    await adapter.listen(3000);

    // Test various extensions
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico',
                       'woff', 'woff2', 'ttf', 'eot', 'pdf', 'mp4', 'webm', 'mp3', 'wav'];

    for (const ext of extensions) {
      const response = await makeRequest(`/file.${ext}`);
      expect(response.status).toBe(200);
    }
  });

  it('should handle directory with index.html', async () => {
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

    const response = await makeRequest('/folder');
    // Should try to serve index.html from the directory
  });

  it('should handle directory with index disabled', async () => {
    const dirFile = {
      readable: new ReadableStream(),
      close: vi.fn(),
      stat: vi.fn().mockResolvedValue({ isDirectory: true, size: 0, mtime: null }),
    };
    mockDenoOpen.mockResolvedValue(dirFile);

    adapter.useStaticAssets('./public', { prefix: '/', index: false });

    await adapter.listen(3000);

    const response = await makeRequest('/folder');
    expect(response.status).toBe(404);
  });

  it('should handle Express app methods', async () => {
    const expressApp = adapter.getExpressApp();

    expressApp.enable('strict routing');
    expect(expressApp.enabled('strict routing')).toBe(true);

    expressApp.disable('x-powered-by');
    expect(expressApp.disabled('x-powered-by')).toBe(true);

    // Test route registration through Express app
    expressApp.get('/express-route', (_req: any, res: any) => {
      res.json({ via: 'express' });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/express-route');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.via).toBe('express');
  });

  it('should handle Fastify route registration', async () => {
    const fastify = adapter.getFastifyInstance();

    fastify.get('/fastify-route', {}, async (_request: any, reply: any) => {
      reply.send({ via: 'fastify' });
    });

    await adapter.listen(3000);

    const response = await makeRequest('/fastify-route');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.via).toBe('fastify');
  });

  it('should handle Fastify route with preHandler', async () => {
    const fastify = adapter.getFastifyInstance();
    let preHandlerCalled = false;

    fastify.route({
      method: 'GET',
      url: '/with-prehandler',
      preHandler: async () => {
        preHandlerCalled = true;
      },
      handler: async (_request: any, reply: any) => {
        reply.send({ preHandlerCalled });
      },
    });

    await adapter.listen(3000);

    const response = await makeRequest('/with-prehandler');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.preHandlerCalled).toBe(true);
  });

  it('should handle CORS with methods as array', async () => {
    adapter.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT'],
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://example.com' },
    });

    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET,POST,PUT');
  });

  it('should handle CORS with allowedHeaders from request', async () => {
    adapter.enableCors({
      origin: '*',
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://example.com',
        'Access-Control-Request-Headers': 'X-Custom, Authorization',
      },
    });

    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('X-Custom, Authorization');
  });

  it('should handle CORS with explicit allowedHeaders', async () => {
    adapter.enableCors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await adapter.listen(3000);

    const response = await makeRequest('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://example.com' },
    });

    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type,Authorization');
  });
});
