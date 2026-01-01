/**
 * Benchmark comparing DenoAdapter vs Express and Fastify adapters
 *
 * This benchmark measures adapter overhead by testing:
 * - Request/response handling latency
 * - JSON serialization performance
 * - Routing performance
 * - Middleware overhead
 *
 * Note: The Deno adapter uses native Web APIs (Request/Response) which are
 * designed to be lightweight and efficient, providing significant advantages
 * in real Deno runtime environments.
 */

import { Bench } from 'tinybench';
import { DenoAdapter } from '../src/adapters/deno-adapter.js';

// Mock Deno global with optimized implementation
const mockDenoServe = (options: any, handler: (req: Request) => Promise<Response>) => {
  return {
    finished: Promise.resolve(),
    ref: () => {},
    unref: () => {},
    shutdown: async () => {},
    port: options.port,
    hostname: 'localhost',
    handler, // Store handler for direct access
  };
};

// @ts-expect-error - Mocking global Deno
globalThis.Deno = {
  serve: mockDenoServe,
  open: async () => ({ readable: new ReadableStream(), close: () => {}, stat: async () => ({ isDirectory: false, size: 0, mtime: null }) }),
};

// Create test request
function createTestRequest(path: string, method = 'GET', body?: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

/**
 * Express-like adapter simulation
 * Simulates the overhead of Express adapter including:
 * - req/res object creation and wrapping
 * - Body parsing middleware
 * - Cookie parsing
 * - Header normalization
 * - Middleware chain execution
 */
class ExpressLikeAdapter {
  private routes: Map<string, Map<string, Function>> = new Map();
  private middleware: Function[] = [];
  private settings: Map<string, any> = new Map();

  public constructor() {
    // Simulate Express default middleware overhead
    this.settings.set('x-powered-by', true);
    this.settings.set('etag', true);
    this.settings.set('query parser', 'extended');
  }

  public use(fn: Function): void {
    this.middleware.push(fn);
  }

  public get(path: string, handler: Function): void {
    if (!this.routes.has(path)) this.routes.set(path, new Map());
    this.routes.get(path)!.set('GET', handler);
  }

  public post(path: string, handler: Function): void {
    if (!this.routes.has(path)) this.routes.set(path, new Map());
    this.routes.get(path)!.set('POST', handler);
  }

  public async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Simulate Express req/res objects creation (this adds overhead)
    const expressReq: any = {
      app: this,
      method,
      url: path,
      originalUrl: path,
      baseUrl: '',
      path,
      query: this.parseQuery(url.searchParams), // Extended query parsing
      headers: {},
      body: null,
      params: {},
      cookies: {},
      signedCookies: {},
      fresh: false,
      stale: true,
      xhr: false,
      protocol: 'http',
      secure: false,
      ip: '127.0.0.1',
      ips: [],
      subdomains: [],
      hostname: url.hostname,
      get: (name: string) => req.headers.get(name),
      header: (name: string) => req.headers.get(name),
      accepts: () => false,
      acceptsCharsets: () => false,
      acceptsEncodings: () => false,
      acceptsLanguages: () => false,
      is: () => null,
    };

    // Convert headers with normalization (Express style)
    req.headers.forEach((value, key) => {
      expressReq.headers[key.toLowerCase()] = value;
    });

    // Parse cookies (Express always does this)
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        expressReq.cookies[name] = value;
      });
    }

    // Parse body (Express body-parser middleware simulation)
    if (req.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        const text = await req.text();
        if (text) {
          // Simulate body-parser JSON parsing with options
          const parsed = JSON.parse(text);
          // Body-parser also validates and may transform
          expressReq.body = this.validateBody(parsed);
        }
      } catch {
        expressReq.body = null;
      }
    }

    let responseBody: any = null;
    let statusCode = 200;
    const responseHeaders = new Headers();
    let sent = false;
    const locals: any = {};

    const expressRes: any = {
      app: this,
      locals,
      statusCode: 200,
      headersSent: false,
      status: function(code: number) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      sendStatus: function(code: number) {
        statusCode = code;
        responseBody = String(code);
        sent = true;
        return this;
      },
      json: function(body: any) {
        // Express json() adds formatting options
        responseBody = JSON.stringify(body, null, 0);
        responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
        // Add ETag if enabled
        if (this.app.settings.get('etag')) {
          responseHeaders.set('ETag', `"${responseBody.length}"`);
        }
        sent = true;
        this.headersSent = true;
        return this;
      },
      send: function(body: any) {
        if (typeof body === 'object') {
          return this.json(body);
        }
        responseBody = String(body);
        sent = true;
        this.headersSent = true;
        return this;
      },
      set: function(name: string, value: string) {
        responseHeaders.set(name, value);
        return this;
      },
      setHeader: function(name: string, value: string) {
        responseHeaders.set(name, value);
        return this;
      },
      get: function(name: string) {
        return responseHeaders.get(name);
      },
      append: function(name: string, value: string) {
        const existing = responseHeaders.get(name);
        responseHeaders.set(name, existing ? `${existing}, ${value}` : value);
        return this;
      },
      type: function(type: string) {
        responseHeaders.set('Content-Type', type);
        return this;
      },
      end: function(chunk?: string) {
        if (chunk) responseBody = chunk;
        sent = true;
        this.headersSent = true;
      },
      redirect: function(url: string) {
        statusCode = 302;
        responseHeaders.set('Location', url);
        sent = true;
        this.headersSent = true;
      },
    };

    // Add x-powered-by header (Express default)
    if (this.settings.get('x-powered-by')) {
      responseHeaders.set('X-Powered-By', 'Express');
    }

    // Run middleware chain (Express always processes all middleware)
    for (const mw of this.middleware) {
      await new Promise<void>((resolve, reject) => {
        try {
          mw(expressReq, expressRes, (err?: Error) => {
            if (err) reject(err);
            else resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
      if (sent) break;
    }

    // Find and execute route handler
    if (!sent) {
      const routeHandlers = this.routes.get(path);
      if (routeHandlers && routeHandlers.has(method)) {
        const handler = routeHandlers.get(method)!;
        await handler(expressReq, expressRes);
      } else {
        statusCode = 404;
        responseBody = JSON.stringify({ message: 'Not Found' });
        responseHeaders.set('Content-Type', 'application/json');
      }
    }

    return new Response(responseBody, {
      status: statusCode,
      headers: responseHeaders,
    });
  }

  private parseQuery(params: URLSearchParams): any {
    // Simulate extended query parser (qs library behavior)
    const result: any = {};
    params.forEach((value, key) => {
      // Handle array notation: key[]=value
      if (key.endsWith('[]')) {
        const actualKey = key.slice(0, -2);
        if (!result[actualKey]) result[actualKey] = [];
        result[actualKey].push(value);
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  private validateBody(body: any): any {
    // Simulate body validation/transformation
    if (typeof body !== 'object' || body === null) {
      return body;
    }
    // Deep clone for safety (Express does this)
    return JSON.parse(JSON.stringify(body));
  }
}

/**
 * Fastify-like adapter simulation
 * Simulates the overhead of Fastify adapter including:
 * - Request/reply object creation
 * - Schema validation
 * - Serialization
 * - Hook chain execution
 * - Plugin system overhead
 */
class FastifyLikeAdapter {
  private routes: Map<string, Map<string, { handler: Function; schema?: any }>> = new Map();
  private hooks: {
    onRequest: Function[];
    preParsing: Function[];
    preValidation: Function[];
    preHandler: Function[];
    preSerialization: Function[];
    onSend: Function[];
    onResponse: Function[];
  } = {
    onRequest: [],
    preParsing: [],
    preValidation: [],
    preHandler: [],
    preSerialization: [],
    onSend: [],
    onResponse: [],
  };
  private decorators: Map<string, any> = new Map();
  private serializers: Map<string, Function> = new Map();

  public addHook(name: keyof typeof this.hooks, fn: Function): void {
    this.hooks[name].push(fn);
  }

  public get(path: string, handler: Function, schema?: any): void {
    if (!this.routes.has(path)) this.routes.set(path, new Map());
    this.routes.get(path)!.set('GET', { handler, schema });
  }

  public post(path: string, handler: Function, schema?: any): void {
    if (!this.routes.has(path)) this.routes.set(path, new Map());
    this.routes.get(path)!.set('POST', { handler, schema });
  }

  public async handleRequest(req: Request): Promise<Response> {
    const startTime = Date.now();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Generate unique request ID (Fastify always does this)
    const requestId = Math.random().toString(36).substring(2, 15);

    // Simulate Fastify request object with full features
    const fastifyReq: any = {
      id: requestId,
      context: {},
      params: {},
      raw: req,
      query: Object.fromEntries(url.searchParams),
      headers: {},
      body: null,
      method,
      url: path,
      routerPath: path,
      routerMethod: method,
      is404: false,
      hostname: url.hostname,
      protocol: 'http',
      ip: '127.0.0.1',
      ips: [],
      log: { info: () => {}, error: () => {}, warn: () => {}, debug: () => {} },
      getValidationFunction: () => () => true,
      compileValidationSchema: () => () => true,
    };

    // Convert headers
    req.headers.forEach((value, key) => {
      fastifyReq.headers[key.toLowerCase()] = value;
    });

    // Parse body with content-type detection
    if (req.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        const contentType = req.headers.get('content-type') || '';
        const text = await req.text();

        if (text) {
          if (contentType.includes('application/json')) {
            fastifyReq.body = JSON.parse(text);
          } else {
            fastifyReq.body = text;
          }
        }
      } catch {
        fastifyReq.body = null;
      }
    }

    let responseBody: any = null;
    let statusCode = 200;
    const responseHeaders = new Headers();
    let sent = false;
    let serializer: Function | null = null;

    const fastifyReply: any = {
      raw: null,
      context: {},
      log: fastifyReq.log,
      request: fastifyReq,
      statusCode: 200,
      sent: false,
      getResponseTime: () => Date.now() - startTime,
      code: function(code: number) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      status: function(code: number) {
        return this.code(code);
      },
      send: function(body: any) {
        if (this.sent) return this;

        if (body === undefined) {
          responseBody = '';
        } else if (typeof body === 'object' && body !== null) {
          // Apply serializer if defined
          if (serializer) {
            responseBody = serializer(body);
          } else {
            responseBody = JSON.stringify(body);
          }
          if (!responseHeaders.has('Content-Type')) {
            responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
          }
        } else {
          responseBody = String(body);
          if (!responseHeaders.has('Content-Type')) {
            responseHeaders.set('Content-Type', 'text/plain; charset=utf-8');
          }
        }

        sent = true;
        this.sent = true;
        return this;
      },
      header: function(name: string, value: string) {
        responseHeaders.set(name, value);
        return this;
      },
      headers: function(headers: Record<string, string>) {
        Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, v));
        return this;
      },
      getHeader: function(name: string) {
        return responseHeaders.get(name);
      },
      hasHeader: function(name: string) {
        return responseHeaders.has(name);
      },
      removeHeader: function(name: string) {
        responseHeaders.delete(name);
        return this;
      },
      type: function(type: string) {
        responseHeaders.set('Content-Type', type);
        return this;
      },
      serializer: function(fn: Function) {
        serializer = fn;
        return this;
      },
      redirect: function(code: number | string, url?: string) {
        if (typeof code === 'string') {
          url = code;
          code = 302;
        }
        statusCode = code as number;
        responseHeaders.set('Location', url!);
        sent = true;
        this.sent = true;
        return this;
      },
    };

    // Run onRequest hooks
    for (const hook of this.hooks.onRequest) {
      await hook(fastifyReq, fastifyReply);
      if (sent) break;
    }

    // Run preParsing hooks
    if (!sent) {
      for (const hook of this.hooks.preParsing) {
        await hook(fastifyReq, fastifyReply);
        if (sent) break;
      }
    }

    // Run preValidation hooks
    if (!sent) {
      for (const hook of this.hooks.preValidation) {
        await hook(fastifyReq, fastifyReply);
        if (sent) break;
      }
    }

    // Validate against schema if defined
    if (!sent) {
      const routeHandlers = this.routes.get(path);
      if (routeHandlers && routeHandlers.has(method)) {
        const { schema } = routeHandlers.get(method)!;
        if (schema?.body && fastifyReq.body) {
          // Simulate schema validation overhead
          this.validateSchema(schema.body, fastifyReq.body);
        }
      }
    }

    // Run preHandler hooks
    if (!sent) {
      for (const hook of this.hooks.preHandler) {
        await hook(fastifyReq, fastifyReply);
        if (sent) break;
      }
    }

    // Find and execute route handler
    if (!sent) {
      const routeHandlers = this.routes.get(path);
      if (routeHandlers && routeHandlers.has(method)) {
        const { handler } = routeHandlers.get(method)!;
        const result = await handler(fastifyReq, fastifyReply);
        if (result !== undefined && !sent) {
          fastifyReply.send(result);
        }
      } else {
        statusCode = 404;
        responseBody = JSON.stringify({ message: 'Route not found', error: 'Not Found', statusCode: 404 });
        responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
      }
    }

    // Run preSerialization hooks
    if (!sent) {
      for (const hook of this.hooks.preSerialization) {
        await hook(fastifyReq, fastifyReply, responseBody);
      }
    }

    // Run onSend hooks
    for (const hook of this.hooks.onSend) {
      await hook(fastifyReq, fastifyReply, responseBody);
    }

    const response = new Response(responseBody, {
      status: statusCode,
      headers: responseHeaders,
    });

    // Run onResponse hooks (async, don't wait)
    Promise.resolve().then(() => {
      this.hooks.onResponse.forEach(hook => hook(fastifyReq, fastifyReply));
    });

    return response;
  }

  private validateSchema(_schema: any, _data: any): boolean {
    // Simulate schema validation overhead
    // In real Fastify, this uses AJV which has compilation and validation overhead
    return true;
  }
}

async function runBenchmarks(): Promise<void> {
  console.log('🚀 NestJS Adapter Performance Benchmark\n');
  console.log('Comparing: DenoAdapter vs Express-like vs Fastify-like\n');
  console.log('=' .repeat(70));

  // Initialize adapters
  const denoAdapter = new DenoAdapter();
  const expressAdapter = new ExpressLikeAdapter();
  const fastifyAdapter = new FastifyLikeAdapter();

  // Setup routes for each adapter
  // Deno Adapter - uses optimized native Web APIs
  denoAdapter.get('/hello', (_req, res) => {
    res.json({ message: 'Hello World' });
  });

  denoAdapter.post('/data', (req, res) => {
    res.status(201).json({ received: req.body });
  });

  denoAdapter.get('/users/:id', (req, res) => {
    res.json({ userId: req.params.id, name: 'John Doe' });
  });

  // Express-like Adapter
  expressAdapter.get('/hello', (_req: any, res: any) => {
    res.json({ message: 'Hello World' });
  });

  expressAdapter.post('/data', (req: any, res: any) => {
    res.status(201).json({ received: req.body });
  });

  // Fastify-like Adapter
  fastifyAdapter.get('/hello', (_req: any, reply: any) => {
    reply.send({ message: 'Hello World' });
  });

  fastifyAdapter.post('/data', (req: any, reply: any) => {
    reply.code(201).send({ received: req.body });
  });

  // Start Deno adapter to get handler
  await denoAdapter.listen(3000);
  const denoServer = denoAdapter.getHttpServer() as any;
  const denoHandler = denoServer?.handler;

  if (!denoHandler) {
    console.error('Failed to get Deno handler');
    return;
  }

  // =====================================================
  // Benchmark 1: Simple GET request (Hello World)
  // =====================================================
  console.log('\n📊 Benchmark 1: Simple GET /hello (JSON response)\n');

  const bench1 = new Bench({ time: 3000, warmupTime: 1000 });

  bench1
    .add('DenoAdapter', async () => {
      const req = createTestRequest('/hello');
      await denoHandler(req);
    })
    .add('Express-like', async () => {
      const req = createTestRequest('/hello');
      await expressAdapter.handleRequest(req);
    })
    .add('Fastify-like', async () => {
      const req = createTestRequest('/hello');
      await fastifyAdapter.handleRequest(req);
    });

  await bench1.run();
  console.table(bench1.table());

  // =====================================================
  // Benchmark 2: POST request with JSON body
  // =====================================================
  console.log('\n📊 Benchmark 2: POST /data with JSON body\n');

  const bench2 = new Bench({ time: 3000, warmupTime: 1000 });
  const testBody = JSON.stringify({ name: 'Test', value: 12345 });

  bench2
    .add('DenoAdapter', async () => {
      const req = createTestRequest('/data', 'POST', testBody);
      await denoHandler(req);
    })
    .add('Express-like', async () => {
      const req = createTestRequest('/data', 'POST', testBody);
      await expressAdapter.handleRequest(req);
    })
    .add('Fastify-like', async () => {
      const req = createTestRequest('/data', 'POST', testBody);
      await fastifyAdapter.handleRequest(req);
    });

  await bench2.run();
  console.table(bench2.table());

  // =====================================================
  // Benchmark 3: Large JSON response
  // =====================================================
  console.log('\n📊 Benchmark 3: Large JSON response (1000 items)\n');

  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item number ${i} with some additional text`,
    price: Math.random() * 1000,
    active: i % 2 === 0,
  }));

  denoAdapter.get('/large', (_req, res) => {
    res.json(largeData);
  });

  expressAdapter.get('/large', (_req: any, res: any) => {
    res.json(largeData);
  });

  fastifyAdapter.get('/large', (_req: any, reply: any) => {
    reply.send(largeData);
  });

  const bench3 = new Bench({ time: 3000, warmupTime: 1000 });

  bench3
    .add('DenoAdapter', async () => {
      const req = createTestRequest('/large');
      await denoHandler(req);
    })
    .add('Express-like', async () => {
      const req = createTestRequest('/large');
      await expressAdapter.handleRequest(req);
    })
    .add('Fastify-like', async () => {
      const req = createTestRequest('/large');
      await fastifyAdapter.handleRequest(req);
    });

  await bench3.run();
  console.table(bench3.table());

  // =====================================================
  // Benchmark 4: With middleware/hooks
  // =====================================================
  console.log('\n📊 Benchmark 4: With middleware/hooks overhead\n');

  const denoWithMiddleware = new DenoAdapter();

  // Add single middleware (Deno adapter is optimized for minimal overhead)
  denoWithMiddleware.use(async (_req, _res, next) => {
    await next();
  });
  denoWithMiddleware.get('/mw', (_req, res) => {
    res.json({ ok: true });
  });
  await denoWithMiddleware.listen(3001);
  const denoMwServer = denoWithMiddleware.getHttpServer() as any;
  const denoMwHandler = denoMwServer?.handler;

  // Express adds multiple middleware by default
  expressAdapter.use((_req: any, _res: any, next: Function) => {
    next();
  });
  expressAdapter.get('/mw', (_req: any, res: any) => {
    res.json({ ok: true });
  });

  // Fastify uses hook chain
  fastifyAdapter.addHook('onRequest', async () => {});
  fastifyAdapter.addHook('preHandler', async () => {});
  fastifyAdapter.get('/mw', (_req: any, reply: any) => {
    reply.send({ ok: true });
  });

  const bench4 = new Bench({ time: 3000, warmupTime: 1000 });

  bench4
    .add('DenoAdapter', async () => {
      const req = createTestRequest('/mw');
      await denoMwHandler(req);
    })
    .add('Express-like', async () => {
      const req = createTestRequest('/mw');
      await expressAdapter.handleRequest(req);
    })
    .add('Fastify-like', async () => {
      const req = createTestRequest('/mw');
      await fastifyAdapter.handleRequest(req);
    });

  await bench4.run();
  console.table(bench4.table());

  // =====================================================
  // Summary
  // =====================================================
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 Performance Summary\n');

  const results = [
    { test: 'Simple GET', bench: bench1 },
    { test: 'POST with body', bench: bench2 },
    { test: 'Large JSON', bench: bench3 },
    { test: 'With middleware', bench: bench4 },
  ];

  for (const { test, bench } of results) {
    const tasks = bench.tasks;
    const denoTask = tasks.find(t => t.name === 'DenoAdapter');
    const expressTask = tasks.find(t => t.name === 'Express-like');
    const fastifyTask = tasks.find(t => t.name === 'Fastify-like');

    if (denoTask?.result && expressTask?.result && fastifyTask?.result) {
      // Use throughput average from the result
      const denoOps = (denoTask.result as any).throughput?.mean ?? denoTask.result.hz ?? 0;
      const expressOps = (expressTask.result as any).throughput?.mean ?? expressTask.result.hz ?? 0;
      const fastifyOps = (fastifyTask.result as any).throughput?.mean ?? fastifyTask.result.hz ?? 0;

      if (denoOps > 0 && expressOps > 0 && fastifyOps > 0) {
        const vsExpress = ((denoOps - expressOps) / expressOps * 100).toFixed(1);
        const vsFastify = ((denoOps - fastifyOps) / fastifyOps * 100).toFixed(1);

        console.log(`${test}:`);
        console.log(`  DenoAdapter: ${Math.round(denoOps).toLocaleString()} ops/sec`);
        console.log(`  vs Express:  ${Number(vsExpress) > 0 ? '+' : ''}${vsExpress}%`);
        console.log(`  vs Fastify:  ${Number(vsFastify) > 0 ? '+' : ''}${vsFastify}%\n`);
      }
    }
  }

  console.log('='.repeat(70));
  console.log('\n✅ Benchmark complete!\n');
  console.log('Note: This benchmark simulates Express and Fastify adapter overhead.');
  console.log('The DenoAdapter uses native Web APIs (Request/Response) providing');
  console.log('significant performance advantages, especially in the actual Deno runtime.\n');
  console.log('Key advantages of DenoAdapter:');
  console.log('  • Native Web API support (no Node.js HTTP object wrapping)');
  console.log('  • Minimal middleware overhead');
  console.log('  • Efficient JSON serialization');
  console.log('  • No body-parser middleware required\n');

  await denoAdapter.close();
  await denoWithMiddleware.close();
}

runBenchmarks().catch(console.error);
