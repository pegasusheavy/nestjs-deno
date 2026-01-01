import { describe, it, expect, vi } from 'vitest';
import {
  createFastifyRequest,
  createFastifyReply,
  wrapFastifyHook,
  wrapFastifyPlugin,
  createFastifyLogger,
  type FastifyHook,
  type FastifyHookCallback,
  type FastifyPlugin,
  type FastifyPluginAsync,
  type FastifyLikeInstance,
} from './fastify-compat.js';
import { type DenoRequest, type DenoResponse } from '../adapters/deno-adapter.js';

// Helper to create a mock DenoRequest
function createMockDenoRequest(overrides: Partial<DenoRequest> = {}): DenoRequest {
  const headers = new Headers();
  headers.set('content-type', 'application/json');
  headers.set('host', 'localhost:3000');

  return {
    raw: new Request('http://localhost:3000/test?foo=bar'),
    url: 'http://localhost:3000/test?foo=bar',
    method: 'GET',
    headers,
    params: { id: '123' },
    query: { foo: 'bar' },
    body: { data: 'test' },
    ip: '127.0.0.1',
    hostname: 'localhost',
    protocol: 'http',
    secure: false,
    originalUrl: '/test?foo=bar',
    baseUrl: '',
    path: '/test',
    ...overrides,
  };
}

// Helper to create a mock DenoResponse
function createMockDenoResponse(): DenoResponse {
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
      if (responseBody === undefined || responseBody === null) {
        body = null;
      } else if (typeof responseBody === 'object') {
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
}

describe('Fastify Compatibility Layer', () => {
  describe('createFastifyRequest', () => {
    it('should create a Fastify-compatible request from DenoRequest', () => {
      const denoReq = createMockDenoRequest();
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.method).toBe('GET');
      expect(fastifyReq.url).toBe('/test?foo=bar');
      expect(fastifyReq.originalUrl).toBe('/test?foo=bar');
      expect(fastifyReq.hostname).toBe('localhost');
      expect(fastifyReq.protocol).toBe('http');
      expect(fastifyReq.params).toEqual({ id: '123' });
      expect(fastifyReq.query).toEqual({ foo: 'bar' });
      expect(fastifyReq.body).toEqual({ data: 'test' });
    });

    it('should generate a unique request ID', () => {
      const denoReq1 = createMockDenoRequest();
      const denoReq2 = createMockDenoRequest();
      const fastifyReq1 = createFastifyRequest(denoReq1);
      const fastifyReq2 = createFastifyRequest(denoReq2);

      expect(fastifyReq1.id).toBeDefined();
      expect(fastifyReq2.id).toBeDefined();
      expect(fastifyReq1.id).not.toBe(fastifyReq2.id);
    });

    it('should convert headers to object format', () => {
      const denoReq = createMockDenoRequest();
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.headers['content-type']).toBe('application/json');
      expect(fastifyReq.headers['host']).toBe('localhost:3000');
    });

    it('should set protocol based on secure flag', () => {
      const secureReq = createMockDenoRequest({ secure: true });
      const fastifyReq = createFastifyRequest(secureReq);

      expect(fastifyReq.protocol).toBe('https');
    });

    it('should include router path and method', () => {
      const denoReq = createMockDenoRequest();
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.routerPath).toBe('/test');
      expect(fastifyReq.routerMethod).toBe('GET');
    });

    it('should include raw request', () => {
      const denoReq = createMockDenoRequest();
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.raw).toBe(denoReq.raw);
    });
  });

  describe('createFastifyReply', () => {
    it('should create a Fastify-compatible reply from DenoResponse', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      expect(fastifyReply.statusCode).toBe(200);
      expect(fastifyReply.sent).toBe(false);
    });

    it('should implement code() method', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      const result = fastifyReply.code(404);
      expect(result).toBe(fastifyReply); // Returns this for chaining
      expect(fastifyReply.statusCode).toBe(404);
    });

    it('should implement status() as alias for code()', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.status(201);
      expect(fastifyReply.statusCode).toBe(201);
    });

    it('should implement header() method', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.header('X-Custom', 'value');
      expect(denoRes.getHeader('X-Custom')).toBe('value');
    });

    it('should implement headers() method for multiple headers', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.headers({ 'X-One': 'one', 'X-Two': 2, 'X-Bool': true });
      expect(denoRes.getHeader('X-One')).toBe('one');
      expect(denoRes.getHeader('X-Two')).toBe('2');
      expect(denoRes.getHeader('X-Bool')).toBe('true');
    });

    it('should implement getHeader() method', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('X-Test', 'test-value');
      const fastifyReply = createFastifyReply(denoRes);

      expect(fastifyReply.getHeader('X-Test')).toBe('test-value');
    });

    it('should implement getHeaders() method', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('X-One', 'one');
      denoRes.setHeader('X-Two', 'two');
      const fastifyReply = createFastifyReply(denoRes);

      const headers = fastifyReply.getHeaders();
      expect(headers['x-one']).toBe('one');
      expect(headers['x-two']).toBe('two');
    });

    it('should implement removeHeader() method', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('X-Remove', 'value');
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.removeHeader('X-Remove');
      expect(denoRes.getHeader('X-Remove')).toBeNull();
    });

    it('should implement hasHeader() method', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('X-Exists', 'value');
      const fastifyReply = createFastifyReply(denoRes);

      expect(fastifyReply.hasHeader('X-Exists')).toBe(true);
      expect(fastifyReply.hasHeader('X-Missing')).toBe(false);
    });

    it('should implement send() with string', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send('Hello World');
      expect(denoRes.headersSent).toBe(true);
      expect(denoRes.getHeader('Content-Type')).toBe('text/plain; charset=utf-8');
    });

    it('should implement send() with object (JSON)', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send({ message: 'test' });
      expect(denoRes.getHeader('Content-Type')).toBe('application/json; charset=utf-8');
    });

    it('should implement send() with undefined', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send(undefined);
      expect(denoRes.headersSent).toBe(true);
    });

    it('should implement type() method', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.type('application/xml');
      expect(denoRes.getHeader('Content-Type')).toBe('application/xml');
    });

    it('should implement redirect() with default status', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.redirect('/new-location');
      expect(denoRes.statusCode).toBe(302);
      expect(denoRes.getHeader('Location')).toBe('/new-location');
    });

    it('should implement redirect() with custom status', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.redirect(301, '/permanent');
      expect(denoRes.statusCode).toBe(301);
      expect(denoRes.getHeader('Location')).toBe('/permanent');
    });

    it('should implement callNotFound()', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.callNotFound();
      expect(denoRes.statusCode).toBe(404);
    });

    it('should implement getResponseTime()', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      // Wait a tiny bit and check response time
      const time = fastifyReply.getResponseTime();
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should implement serialize()', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      const serialized = fastifyReply.serialize({ test: 'data' });
      expect(serialized).toBe('{"test":"data"}');
    });

    it('should implement serializer()', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.serializer((payload) => `custom:${JSON.stringify(payload)}`);
      const serialized = fastifyReply.serialize({ test: 'data' });
      expect(serialized).toBe('custom:{"test":"data"}');
    });

    it('should expose raw DenoResponse', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      expect(fastifyReply.raw).toBe(denoRes);
    });
  });

  describe('wrapFastifyHook', () => {
    it('should wrap async Fastify hook', async () => {
      const hook: FastifyHook = async (request, reply) => {
        request.customProperty = 'added';
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await wrapped(denoReq, denoRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should wrap callback-style Fastify hook', async () => {
      const hook: FastifyHookCallback = (request, reply, done) => {
        request.customProperty = 'added';
        done();
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await wrapped(denoReq, denoRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle async hook errors', async () => {
      const hook: FastifyHook = async () => {
        throw new Error('Hook error');
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Hook error');
    });

    it('should handle callback hook errors', async () => {
      const hook: FastifyHookCallback = (_request, _reply, done) => {
        done(new Error('Callback error'));
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Callback error');
    });

    it('should not call next if reply is sent', async () => {
      const hook: FastifyHook = async (_request, reply) => {
        reply.send({ done: true });
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await wrapped(denoReq, denoRes, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should handle callback hook that throws synchronously', async () => {
      const hook: FastifyHookCallback = () => {
        throw new Error('Sync throw');
      };

      const wrapped = wrapFastifyHook(hook);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Sync throw');
    });
  });

  describe('wrapFastifyPlugin', () => {
    it('should wrap async plugin', async () => {
      const plugin: FastifyPluginAsync = async (instance, opts) => {
        instance.decorate('testProp', 'testValue');
      };

      const mockInstance: FastifyLikeInstance = {
        decorate: vi.fn().mockReturnThis(),
        decorateRequest: vi.fn().mockReturnThis(),
        decorateReply: vi.fn().mockReturnThis(),
        hasDecorator: vi.fn(),
        hasRequestDecorator: vi.fn(),
        hasReplyDecorator: vi.fn(),
        addHook: vi.fn().mockReturnThis(),
        register: vi.fn().mockReturnThis(),
        route: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        put: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        options: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis(),
        all: vi.fn().mockReturnThis(),
        log: createFastifyLogger(),
        prefix: '',
      };

      await wrapFastifyPlugin(plugin, mockInstance, {});
      expect(mockInstance.decorate).toHaveBeenCalledWith('testProp', 'testValue');
    });

    it('should wrap callback-style plugin', async () => {
      const plugin: FastifyPlugin = (instance, opts, done) => {
        instance.decorate('callbackProp', 'value');
        done();
      };

      const mockInstance: FastifyLikeInstance = {
        decorate: vi.fn().mockReturnThis(),
        decorateRequest: vi.fn().mockReturnThis(),
        decorateReply: vi.fn().mockReturnThis(),
        hasDecorator: vi.fn(),
        hasRequestDecorator: vi.fn(),
        hasReplyDecorator: vi.fn(),
        addHook: vi.fn().mockReturnThis(),
        register: vi.fn().mockReturnThis(),
        route: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        put: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        options: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis(),
        all: vi.fn().mockReturnThis(),
        log: createFastifyLogger(),
        prefix: '',
      };

      await wrapFastifyPlugin(plugin, mockInstance, {});
      expect(mockInstance.decorate).toHaveBeenCalledWith('callbackProp', 'value');
    });

    it('should handle plugin errors', async () => {
      const plugin: FastifyPluginAsync = async () => {
        throw new Error('Plugin error');
      };

      const mockInstance: FastifyLikeInstance = {
        decorate: vi.fn().mockReturnThis(),
        decorateRequest: vi.fn().mockReturnThis(),
        decorateReply: vi.fn().mockReturnThis(),
        hasDecorator: vi.fn(),
        hasRequestDecorator: vi.fn(),
        hasReplyDecorator: vi.fn(),
        addHook: vi.fn().mockReturnThis(),
        register: vi.fn().mockReturnThis(),
        route: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        put: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        options: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis(),
        all: vi.fn().mockReturnThis(),
        log: createFastifyLogger(),
        prefix: '',
      };

      await expect(wrapFastifyPlugin(plugin, mockInstance, {})).rejects.toThrow('Plugin error');
    });

    it('should handle callback plugin errors', async () => {
      const plugin: FastifyPlugin = (_instance, _opts, done) => {
        done(new Error('Callback plugin error'));
      };

      const mockInstance: FastifyLikeInstance = {
        decorate: vi.fn().mockReturnThis(),
        decorateRequest: vi.fn().mockReturnThis(),
        decorateReply: vi.fn().mockReturnThis(),
        hasDecorator: vi.fn(),
        hasRequestDecorator: vi.fn(),
        hasReplyDecorator: vi.fn(),
        addHook: vi.fn().mockReturnThis(),
        register: vi.fn().mockReturnThis(),
        route: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        put: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        options: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis(),
        all: vi.fn().mockReturnThis(),
        log: createFastifyLogger(),
        prefix: '',
      };

      await expect(wrapFastifyPlugin(plugin, mockInstance, {})).rejects.toThrow('Callback plugin error');
    });

    it('should handle callback plugin that throws synchronously', async () => {
      const plugin: FastifyPlugin = () => {
        throw new Error('Sync plugin error');
      };

      const mockInstance: FastifyLikeInstance = {
        decorate: vi.fn().mockReturnThis(),
        decorateRequest: vi.fn().mockReturnThis(),
        decorateReply: vi.fn().mockReturnThis(),
        hasDecorator: vi.fn(),
        hasRequestDecorator: vi.fn(),
        hasReplyDecorator: vi.fn(),
        addHook: vi.fn().mockReturnThis(),
        register: vi.fn().mockReturnThis(),
        route: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        post: vi.fn().mockReturnThis(),
        put: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        patch: vi.fn().mockReturnThis(),
        options: vi.fn().mockReturnThis(),
        head: vi.fn().mockReturnThis(),
        all: vi.fn().mockReturnThis(),
        log: createFastifyLogger(),
        prefix: '',
      };

      await expect(wrapFastifyPlugin(plugin, mockInstance, {})).rejects.toThrow('Sync plugin error');
    });
  });

  describe('createFastifyLogger', () => {
    it('should create a logger with all methods', () => {
      const logger = createFastifyLogger();

      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.trace).toBe('function');
      expect(typeof logger.fatal).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should log messages', () => {
      const logger = createFastifyLogger();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test message');

      logger.error('Error message');
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Error message');

      consoleSpy.mockRestore();
    });

    it('should create child loggers with bindings', () => {
      const logger = createFastifyLogger();
      const child = logger.child({ requestId: '123' });

      expect(typeof child.info).toBe('function');
      expect(typeof child.error).toBe('function');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      child.info('Child message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('requestId=123'));
      consoleSpy.mockRestore();
    });
  });

  describe('Header handling edge cases', () => {
    it('should handle multiple headers with same name', () => {
      const headers = new Headers();
      headers.append('Set-Cookie', 'cookie1=value1');
      headers.append('Set-Cookie', 'cookie2=value2');

      const denoReq = createMockDenoRequest({ headers });
      const fastifyReq = createFastifyRequest(denoReq);

      // Multiple values for the same header
      const cookies = fastifyReq.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });

    it('should handle header conversion with appended values', () => {
      const headers = new Headers();
      headers.append('X-Custom', 'value1');
      headers.append('X-Custom', 'value2');
      headers.append('X-Custom', 'value3');

      const denoReq = createMockDenoRequest({ headers });
      const fastifyReq = createFastifyRequest(denoReq);

      const values = fastifyReq.headers['x-custom'];
      // Headers API combines values with comma
      expect(typeof values).toBe('string');
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });

    it('should handle missing IP', () => {
      const denoReq = createMockDenoRequest({ ip: undefined });
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.ip).toBeUndefined();
    });

    it('should handle missing hostname', () => {
      const denoReq = createMockDenoRequest({ hostname: undefined });
      const fastifyReq = createFastifyRequest(denoReq);

      expect(fastifyReq.hostname).toBe('');
    });
  });

  describe('Reply send edge cases', () => {
    it('should handle sending a number', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send(42);
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle sending a boolean', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send(true);
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle sending null', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send(null);
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle sending Uint8Array', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      const data = new Uint8Array([1, 2, 3, 4]);
      fastifyReply.send(data);
      expect(denoRes.headersSent).toBe(true);
      // The underlying denoRes.send handles the type - fastifyReply sets content-type
      // but the mock doesn't preserve it if send() is called after
    });

    it('should handle sending ArrayBuffer', () => {
      const denoRes = createMockDenoResponse();
      const fastifyReply = createFastifyReply(denoRes);

      const data = new ArrayBuffer(4);
      fastifyReply.send(data);
      expect(denoRes.headersSent).toBe(true);
      // The underlying denoRes.send handles the type
    });

    it('should not override existing Content-Type for string', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('Content-Type', 'text/html');
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send('<html></html>');
      expect(denoRes.getHeader('Content-Type')).toBe('text/html');
    });

    it('should not override existing Content-Type for object', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('Content-Type', 'application/xml');
      const fastifyReply = createFastifyReply(denoRes);

      fastifyReply.send({ xml: 'data' });
      expect(denoRes.getHeader('Content-Type')).toBe('application/xml');
    });
  });
});
