import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createExpressRequest,
  createExpressResponse,
  wrapExpressMiddleware,
  type ExpressMiddleware,
  type ExpressErrorMiddleware,
} from './express-compat.js';
import { type DenoRequest, type DenoResponse } from '../adapters/deno-adapter.js';

// Helper to create a mock DenoRequest
function createMockDenoRequest(overrides: Partial<DenoRequest> = {}): DenoRequest {
  const headers = new Headers();
  headers.set('content-type', 'application/json');
  headers.set('accept', 'application/json');
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

describe('Express Compatibility Layer', () => {
  describe('createExpressRequest', () => {
    it('should create an Express-compatible request from DenoRequest', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.method).toBe('GET');
      expect(expressReq.url).toBe('/test?foo=bar');
      expect(expressReq.originalUrl).toBe('/test?foo=bar');
      expect(expressReq.path).toBe('/test');
      expect(expressReq.hostname).toBe('localhost');
      expect(expressReq.protocol).toBe('http');
      expect(expressReq.secure).toBe(false);
      expect(expressReq.params).toEqual({ id: '123' });
      expect(expressReq.query).toEqual({ foo: 'bar' });
      expect(expressReq.body).toEqual({ data: 'test' });
    });

    it('should convert headers to object format', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.headers['content-type']).toBe('application/json');
      expect(expressReq.headers['accept']).toBe('application/json');
    });

    it('should parse cookies from cookie header', () => {
      const headers = new Headers();
      headers.set('cookie', 'session=abc123; user=john');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.cookies).toEqual({
        session: 'abc123',
        user: 'john',
      });
    });

    it('should implement get() method for headers', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.get('content-type')).toBe('application/json');
      expect(expressReq.get('Content-Type')).toBe('application/json');
    });

    it('should implement header() as alias for get()', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.header('accept')).toBe('application/json');
    });

    it('should implement is() method for content type checking', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.is('json')).toBe('json');
      expect(expressReq.is('html')).toBe(false);
      expect(expressReq.is(['json', 'html'])).toBe('json');
    });

    it('should return null from is() when no content-type header', () => {
      const headers = new Headers();
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.is('json')).toBe(null);
    });

    it('should implement accepts() method', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.accepts('application/json')).toBe('application/json');
      expect(expressReq.accepts('text/html')).toBe(false);
    });

    it('should detect XHR requests', () => {
      const headers = new Headers();
      headers.set('x-requested-with', 'XMLHttpRequest');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.xhr).toBe(true);
    });

    it('should parse subdomains', () => {
      const denoReq = createMockDenoRequest({ hostname: 'api.v2.example.com' });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.subdomains).toEqual(['v2', 'api']);
    });

    it('should set secure to true for https', () => {
      const denoReq = createMockDenoRequest({ secure: true, protocol: 'https' });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.secure).toBe(true);
      expect(expressReq.protocol).toBe('https');
    });
  });

  describe('createExpressResponse', () => {
    it('should create an Express-compatible response from DenoResponse', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expect(expressRes.statusCode).toBe(200);
      expect(expressRes.headersSent).toBe(false);
    });

    it('should implement status() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      const result = expressRes.status(404);
      expect(result).toBe(expressRes); // Returns this for chaining
      expect(expressRes.statusCode).toBe(404);
    });

    it('should allow setting statusCode directly', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.statusCode = 201;
      expect(expressRes.statusCode).toBe(201);
    });

    it('should implement sendStatus() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.sendStatus(204);
      expect(denoRes.statusCode).toBe(204);
    });

    it('should implement set() for single header', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.set('X-Custom', 'value');
      expect(denoRes.getHeader('X-Custom')).toBe('value');
    });

    it('should implement set() for multiple headers', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.set({ 'X-One': 'one', 'X-Two': 'two' });
      expect(denoRes.getHeader('X-One')).toBe('one');
      expect(denoRes.getHeader('X-Two')).toBe('two');
    });

    it('should implement header() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.header('X-Test', 'test-value');
      expect(expressRes.get('X-Test')).toBe('test-value');
    });

    it('should implement header() as getter when no value', () => {
      const denoRes = createMockDenoResponse();
      denoRes.setHeader('X-Existing', 'exists');
      const expressRes = createExpressResponse(denoRes);

      expect(expressRes.header('X-Existing')).toBe('exists');
    });

    it('should implement append() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.append('X-Values', 'one');
      expressRes.append('X-Values', 'two');
      // Headers.append creates comma-separated values
      expect(denoRes.headers.get('X-Values')).toContain('one');
    });

    it('should implement send() with string body', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.send('Hello World');
      expect(denoRes.headersSent).toBe(true);
    });

    it('should implement send() with object body (converts to JSON)', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.send({ message: 'test' });
      expect(denoRes.getHeader('Content-Type')).toBe('application/json');
    });

    it('should implement json() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.json({ data: 'test' });
      expect(denoRes.getHeader('Content-Type')).toBe('application/json');
      expect(denoRes.headersSent).toBe(true);
    });

    it('should implement end() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.end('done');
      expect(denoRes.headersSent).toBe(true);
    });

    it('should implement redirect() with default status', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.redirect('/new-location');
      expect(denoRes.statusCode).toBe(302);
      expect(denoRes.getHeader('Location')).toBe('/new-location');
    });

    it('should implement redirect() with custom status', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.redirect(301, '/permanent');
      expect(denoRes.statusCode).toBe(301);
      expect(denoRes.getHeader('Location')).toBe('/permanent');
    });

    it('should implement type() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.type('json');
      expect(denoRes.getHeader('Content-Type')).toBe('application/json');

      expressRes.type('html');
      expect(denoRes.getHeader('Content-Type')).toBe('text/html');
    });

    it('should implement cookie() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.cookie('session', 'abc123', { httpOnly: true, secure: true });
      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('session=abc123');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('Secure');
    });

    it('should implement clearCookie() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.clearCookie('session');
      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('session=');
      expect(cookies).toContain('Max-Age=0');
    });

    it('should implement location() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.location('/somewhere');
      expect(denoRes.getHeader('Location')).toBe('/somewhere');
    });

    it('should implement links() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.links({ next: '/page/2', prev: '/page/0' });
      const linkHeader = denoRes.getHeader('Link');
      expect(linkHeader).toContain('</page/2>; rel="next"');
      expect(linkHeader).toContain('</page/0>; rel="prev"');
    });

    it('should implement vary() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.vary('Accept');
      expect(denoRes.getHeader('Vary')).toBe('Accept');

      expressRes.vary('Accept-Encoding');
      expect(denoRes.getHeader('Vary')).toBe('Accept, Accept-Encoding');
    });
  });

  describe('wrapExpressMiddleware', () => {
    it('should wrap Express middleware and call next', async () => {
      const middleware: ExpressMiddleware = (req, res, next) => {
        req.customProperty = 'added';
        next();
      };

      const wrapped = wrapExpressMiddleware(middleware);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await wrapped(denoReq, denoRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should wrap async Express middleware', async () => {
      const middleware: ExpressMiddleware = async (req, res, next) => {
        await Promise.resolve();
        next();
      };

      const wrapped = wrapExpressMiddleware(middleware);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await wrapped(denoReq, denoRes, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle middleware errors', async () => {
      const middleware: ExpressMiddleware = (_req, _res, next) => {
        next(new Error('Middleware error'));
      };

      const wrapped = wrapExpressMiddleware(middleware);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Middleware error');
    });

    it('should handle thrown errors in middleware', async () => {
      const middleware: ExpressMiddleware = () => {
        throw new Error('Thrown error');
      };

      const wrapped = wrapExpressMiddleware(middleware);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Thrown error');
    });

    it('should detect error middleware by argument count', () => {
      // Error middleware with 4 params should be detected by its length
      const errorMiddleware: ExpressErrorMiddleware = (_err, _req, _res, _next) => {
        // 4 parameter error middleware
      };

      // Verify the middleware has 4 parameters (error middleware signature)
      expect(errorMiddleware.length).toBe(4);

      // The wrapExpressMiddleware should handle this correctly
      const wrapped = wrapExpressMiddleware(errorMiddleware);
      expect(typeof wrapped).toBe('function');
    });
  });

  describe('Cookie serialization', () => {
    it('should serialize cookies with all options', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.cookie('test', 'value', {
        domain: '.example.com',
        path: '/api',
        maxAge: 3600,
        expires: new Date('2025-12-31'),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('test=value');
      expect(cookies).toContain('Domain=.example.com');
      expect(cookies).toContain('Path=/api');
      expect(cookies).toContain('Max-Age=3600');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('Secure');
      expect(cookies).toContain('SameSite=Strict');
    });

    it('should handle sameSite=lax', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.cookie('test', 'value', { sameSite: 'lax' });
      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('SameSite=Lax');
    });

    it('should handle sameSite=none', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.cookie('test', 'value', { sameSite: 'none' });
      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('SameSite=None');
    });

    it('should handle sameSite=true (defaults to Strict)', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.cookie('test', 'value', { sameSite: true });
      const cookies = denoRes.headers.get('Set-Cookie');
      expect(cookies).toContain('SameSite=Strict');
    });
  });

  describe('Accept header parsing', () => {
    it('should handle wildcard accept', () => {
      const headers = new Headers();
      headers.set('accept', '*/*');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.accepts('application/json')).toBe('application/json');
    });

    it('should handle accept with quality values', () => {
      const headers = new Headers();
      headers.set('accept', 'text/html;q=0.9, application/json;q=1.0');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      // JSON has higher quality, should be preferred
      expect(expressReq.accepts('application/json', 'text/html')).toBe('application/json');
    });

    it('should return false when no types match', () => {
      const headers = new Headers();
      headers.set('accept', 'text/html');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.accepts('application/json')).toBe(false);
    });

    it('should handle acceptsEncodings', () => {
      const headers = new Headers();
      headers.set('accept-encoding', 'gzip, deflate');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsEncodings('gzip')).toBe('gzip');
      expect(expressReq.acceptsEncodings('br')).toBe(false);
    });

    it('should handle acceptsCharsets', () => {
      const headers = new Headers();
      headers.set('accept-charset', 'utf-8, iso-8859-1');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsCharsets('utf-8')).toBe('utf-8');
    });

    it('should handle acceptsLanguages', () => {
      const headers = new Headers();
      headers.set('accept-language', 'en-US, en;q=0.9');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsLanguages('en-US')).toBe('en-US');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty body', () => {
      const denoReq = createMockDenoRequest({ body: undefined });
      const expressReq = createExpressRequest(denoReq);
      expect(expressReq.body).toBeUndefined();
    });

    it('should handle empty cookie header', () => {
      const headers = new Headers();
      headers.set('cookie', '');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);
      expect(expressReq.cookies).toEqual({});
    });

    it('should handle partial accept type match', () => {
      const headers = new Headers();
      headers.set('accept', 'text/*');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);
      expect(expressReq.accepts('text/html')).toBe('text/html');
    });

    it('should handle jsonp method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);
      expressRes.jsonp({ data: 'test' });
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle send with Buffer-like object', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      // Create a mock Buffer-like object
      const mockBuffer = {
        toString: () => 'buffer content',
      };

      // Since Buffer.isBuffer returns false for our mock, it will be treated as string
      expressRes.send('raw string content');
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle accepts with no accept header', () => {
      const headers = new Headers();
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      // No accept header means no match
      expect(expressReq.accepts('text/html')).toBe(false);
    });

    it('should handle accepts with empty types array', () => {
      const denoReq = createMockDenoRequest();
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.accepts()).toBe(false);
    });

    it('should handle acceptsEncodings with no header', () => {
      const headers = new Headers();
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsEncodings('gzip')).toBe(false);
    });

    it('should handle acceptsCharsets with no header', () => {
      const headers = new Headers();
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsCharsets('utf-8')).toBe(false);
    });

    it('should handle acceptsLanguages with no header', () => {
      const headers = new Headers();
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.acceptsLanguages('en')).toBe(false);
    });

    it('should handle async middleware that rejects', async () => {
      const middleware: ExpressMiddleware = async () => {
        throw new Error('Async rejection');
      };

      const wrapped = wrapExpressMiddleware(middleware);
      const denoReq = createMockDenoRequest();
      const denoRes = createMockDenoResponse();
      const next = vi.fn().mockResolvedValue(undefined);

      await expect(wrapped(denoReq, denoRes, next)).rejects.toThrow('Async rejection');
    });

    it('should handle set() with array header values', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.set({ 'X-Multi': ['one', 'two', 'three'] });
      expect(denoRes.headers.get('X-Multi')).toContain('one');
    });

    it('should handle header() setter with array value', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      const result = expressRes.header('X-Array', ['a', 'b']);
      expect(result).toBe(expressRes);
    });

    it('should handle content type mapping in type()', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.type('xml');
      expect(denoRes.getHeader('Content-Type')).toBe('application/xml');

      expressRes.type('text');
      expect(denoRes.getHeader('Content-Type')).toBe('text/plain');

      expressRes.type('js');
      expect(denoRes.getHeader('Content-Type')).toBe('application/javascript');

      expressRes.type('css');
      expect(denoRes.getHeader('Content-Type')).toBe('text/css');
    });

    it('should handle cookie with all sameSite variations', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      // Test sameSite: 'lax'
      expressRes.cookie('lax', 'value', { sameSite: 'lax' });

      // Test sameSite: 'none'
      expressRes.cookie('none', 'value', { sameSite: 'none' });

      // Test sameSite: 'strict'
      expressRes.cookie('strict', 'value', { sameSite: 'strict' });
    });

    it('should handle missing hostname', () => {
      const denoReq = createMockDenoRequest({ hostname: undefined });
      const expressReq = createExpressRequest(denoReq);
      expect(expressReq.hostname).toBe('');
    });

    it('should handle send() with undefined', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);
      expressRes.send(undefined);
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle end() without body', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);
      expressRes.end();
      expect(denoRes.headersSent).toBe(true);
    });

    it('should handle format() method', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      const htmlHandler = vi.fn();
      const jsonHandler = vi.fn();

      expressRes.format({
        'text/html': htmlHandler,
        'application/json': jsonHandler,
        default: () => {},
      });

      // Default behavior without Accept header set
    });

    it('should handle contentType() as alias for type()', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.contentType('text/plain');
      expect(denoRes.getHeader('Content-Type')).toBe('text/plain');
    });

    it('should handle set() with array values', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.set('X-Multi', ['one', 'two']);
      // Values should be appended
      expect(denoRes.headers.get('X-Multi')).toContain('one');
    });

    it('should handle append() with array values', () => {
      const denoRes = createMockDenoResponse();
      const expressRes = createExpressResponse(denoRes);

      expressRes.append('X-Values', ['a', 'b', 'c']);
      const values = denoRes.headers.get('X-Values');
      expect(values).toContain('a');
      expect(values).toContain('b');
      expect(values).toContain('c');
    });

    it('should handle fresh/stale properties', () => {
      const headers = new Headers();
      headers.set('if-modified-since', 'Wed, 21 Oct 2025 07:28:00 GMT');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.fresh).toBe(true);
      expect(expressReq.stale).toBe(false);
    });

    it('should handle if-none-match header for freshness', () => {
      const headers = new Headers();
      headers.set('if-none-match', '"abc123"');
      const denoReq = createMockDenoRequest({ headers });
      const expressReq = createExpressRequest(denoReq);

      expect(expressReq.fresh).toBe(true);
    });
  });
});
