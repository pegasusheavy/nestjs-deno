import type { DenoRequest, DenoResponse } from '../adapters/deno-adapter.js';

/**
 * Express-compatible Request interface
 * Provides a compatibility layer for Express middleware
 */
export interface ExpressCompatRequest {
  // Core properties
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

  // Parsed data
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;

  // Express-specific methods
  get(name: string): string | undefined;
  header(name: string): string | undefined;
  is(type: string | string[]): string | false | null;
  accepts(...types: string[]): string | false;
  acceptsEncodings(...encodings: string[]): string | false;
  acceptsCharsets(...charsets: string[]): string | false;
  acceptsLanguages(...langs: string[]): string | false;

  // Raw Deno request access
  raw: Request;

  // Additional Express properties some middleware expect
  cookies?: Record<string, string>;
  signedCookies?: Record<string, string>;
  fresh?: boolean;
  stale?: boolean;
  xhr?: boolean;
  subdomains?: string[];

  // Allow arbitrary properties (Express middleware often adds custom props)
  [key: string]: unknown;
}

/**
 * Express-compatible Response interface
 * Provides a compatibility layer for Express middleware
 */
export interface ExpressCompatResponse {
  // Status
  statusCode: number;
  statusMessage: string;
  headersSent: boolean;

  // Methods
  status(code: number): this;
  sendStatus(code: number): this;

  // Headers
  set(field: string, value: string | string[]): this;
  set(field: Record<string, string | string[]>): this;
  header(field: string, value?: string | string[]): this | string | undefined;
  get(field: string): string | undefined;
  append(field: string, value: string | string[]): this;

  // Body
  send(body?: unknown): this;
  json(body?: unknown): this;
  jsonp(body?: unknown): this;
  end(data?: unknown, encoding?: string): this;

  // Redirect
  redirect(url: string): void;
  redirect(status: number, url: string): void;

  // Content type
  type(type: string): this;
  contentType(type: string): this;

  // Cookies
  cookie(name: string, value: string, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;

  // Other
  location(url: string): this;
  links(links: Record<string, string>): this;
  vary(field: string): this;
  format(obj: Record<string, () => void>): this;

  // Allow arbitrary properties
  [key: string]: unknown;
}

/**
 * Cookie options interface
 */
export interface CookieOptions {
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
export type ExpressNextFunction = (err?: unknown) => void;

/**
 * Express middleware function signature
 */
export type ExpressMiddleware = (
  req: ExpressCompatRequest,
  res: ExpressCompatResponse,
  next: ExpressNextFunction,
) => void | Promise<void>;

/**
 * Express error-handling middleware function signature
 */
export type ExpressErrorMiddleware = (
  err: unknown,
  req: ExpressCompatRequest,
  res: ExpressCompatResponse,
  next: ExpressNextFunction,
) => void | Promise<void>;

// HTTP status messages
const STATUS_MESSAGES: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  206: 'Partial Content',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

/**
 * Convert Deno Headers to Express-style headers object
 */
function headersToObject(headers: Headers): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = {};
  headers.forEach((value, key) => {
    const existing = result[key.toLowerCase()];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key.toLowerCase()] = [existing, value];
      }
    } else {
      result[key.toLowerCase()] = value;
    }
  });
  return result;
}

/**
 * Parse Accept header and match against types
 */
function parseAccept(acceptHeader: string | undefined, types: string[]): string | false {
  if (!acceptHeader || types.length === 0) return false;

  const accepts = acceptHeader.split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    let q = 1;
    params.forEach(p => {
      const [key, value] = p.trim().split('=');
      if (key === 'q') q = parseFloat(value) || 1;
    });
    return { type: type.trim(), q };
  }).sort((a, b) => b.q - a.q);

  for (const accept of accepts) {
    for (const type of types) {
      if (accept.type === '*/*' || accept.type === type ||
          accept.type.endsWith('/*') && type.startsWith(accept.type.slice(0, -1))) {
        return type;
      }
    }
  }

  return false;
}

/**
 * Serialize cookie with options
 */
function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }
  if (options.path) {
    cookie += `; Path=${options.path}`;
  } else {
    cookie += '; Path=/';
  }
  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }
  if (options.secure) {
    cookie += '; Secure';
  }
  if (options.sameSite) {
    if (options.sameSite === true) {
      cookie += '; SameSite=Strict';
    } else {
      cookie += `; SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`;
    }
  }

  return cookie;
}

/**
 * Create an Express-compatible request wrapper from a DenoRequest
 */
export function createExpressRequest(denoReq: DenoRequest): ExpressCompatRequest {
  const headersObj = headersToObject(denoReq.headers);

  // Parse cookies from header
  const cookieHeader = denoReq.headers.get('cookie') || '';
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      cookies[decodeURIComponent(name.trim())] = decodeURIComponent(valueParts.join('='));
    }
  });

  const req: ExpressCompatRequest = {
    // Core properties
    method: denoReq.method,
    url: denoReq.originalUrl || denoReq.path || '/',
    originalUrl: denoReq.originalUrl || denoReq.path || '/',
    baseUrl: denoReq.baseUrl || '',
    path: denoReq.path || '/',
    hostname: denoReq.hostname || '',
    ip: denoReq.ip,
    protocol: denoReq.protocol || 'http',
    secure: denoReq.secure || false,
    headers: headersObj,

    // Parsed data
    params: denoReq.params,
    query: denoReq.query,
    body: denoReq.body,

    // Raw access
    raw: denoReq.raw,

    // Cookies
    cookies,
    signedCookies: {},

    // Computed properties
    xhr: denoReq.headers.get('x-requested-with')?.toLowerCase() === 'xmlhttprequest',
    subdomains: denoReq.hostname?.split('.').slice(0, -2).reverse() || [],

    // Methods
    get(name: string): string | undefined {
      const key = name.toLowerCase();
      const value = headersObj[key];
      return Array.isArray(value) ? value[0] : value;
    },

    header(name: string): string | undefined {
      return this.get(name);
    },

    is(type: string | string[]): string | false | null {
      const contentType = denoReq.headers.get('content-type');
      if (!contentType) return null;

      const types = Array.isArray(type) ? type : [type];
      for (const t of types) {
        if (contentType.includes(t) || contentType.includes(t.replace('/', ''))) {
          return t;
        }
      }
      return false;
    },

    accepts(...types: string[]): string | false {
      return parseAccept(denoReq.headers.get('accept') || undefined, types);
    },

    acceptsEncodings(...encodings: string[]): string | false {
      return parseAccept(denoReq.headers.get('accept-encoding') || undefined, encodings);
    },

    acceptsCharsets(...charsets: string[]): string | false {
      return parseAccept(denoReq.headers.get('accept-charset') || undefined, charsets);
    },

    acceptsLanguages(...langs: string[]): string | false {
      return parseAccept(denoReq.headers.get('accept-language') || undefined, langs);
    },
  };

  // Check freshness
  const modifiedSince = denoReq.headers.get('if-modified-since');
  const noneMatch = denoReq.headers.get('if-none-match');
  req.fresh = !!(modifiedSince || noneMatch);
  req.stale = !req.fresh;

  return req;
}

/**
 * Create an Express-compatible response wrapper from a DenoResponse
 */
export function createExpressResponse(denoRes: DenoResponse): ExpressCompatResponse {
  let statusMessage = 'OK';
  const cookies: string[] = [];

  const res: ExpressCompatResponse = {
    // Properties
    get statusCode() {
      return denoRes.statusCode;
    },
    set statusCode(code: number) {
      denoRes.statusCode = code;
      statusMessage = STATUS_MESSAGES[code] || 'Unknown';
    },
    get statusMessage() {
      return statusMessage;
    },
    set statusMessage(msg: string) {
      statusMessage = msg;
    },
    get headersSent() {
      return denoRes.headersSent;
    },

    // Status methods
    status(code: number) {
      denoRes.status(code);
      statusMessage = STATUS_MESSAGES[code] || 'Unknown';
      return this;
    },

    sendStatus(code: number) {
      this.status(code);
      denoRes.send(STATUS_MESSAGES[code] || String(code));
      return this;
    },

    // Header methods
    set(field: string | Record<string, string | string[]>, value?: string | string[]) {
      if (typeof field === 'object') {
        Object.entries(field).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach(v => denoRes.headers.append(key, v));
          } else {
            denoRes.setHeader(key, val);
          }
        });
      } else if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => denoRes.headers.append(field, v));
        } else {
          denoRes.setHeader(field, value);
        }
      }
      return this;
    },

    header(field: string, value?: string | string[]): string | undefined | ExpressCompatResponse {
      if (value === undefined) {
        return denoRes.getHeader(field) || undefined;
      }
      return this.set(field, value);
    },

    get(field: string) {
      return denoRes.getHeader(field) || undefined;
    },

    append(field: string, value: string | string[]) {
      if (Array.isArray(value)) {
        value.forEach(v => denoRes.headers.append(field, v));
      } else {
        denoRes.headers.append(field, value);
      }
      return this;
    },

    // Body methods
    send(body?: unknown) {
      if (body === undefined) {
        denoRes.end();
      } else if (typeof body === 'string') {
        if (!denoRes.getHeader('Content-Type')) {
          denoRes.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        denoRes.send(body);
      } else if (Buffer.isBuffer(body)) {
        if (!denoRes.getHeader('Content-Type')) {
          denoRes.setHeader('Content-Type', 'application/octet-stream');
        }
        denoRes.send(body as unknown as BodyInit);
      } else if (typeof body === 'object') {
        return this.json(body);
      } else {
        denoRes.send(String(body));
      }
      return this;
    },

    json(body?: unknown) {
      denoRes.json(body);
      return this;
    },

    jsonp(body?: unknown) {
      // For JSONP, we'd need to wrap in a callback
      // For now, just send as JSON
      denoRes.json(body);
      return this;
    },

    end(data?: unknown) {
      if (data !== undefined) {
        denoRes.end(typeof data === 'string' ? data : JSON.stringify(data));
      } else {
        denoRes.end();
      }
      return this;
    },

    // Redirect
    redirect(statusOrUrl: number | string, url?: string) {
      if (typeof statusOrUrl === 'number' && url) {
        denoRes.redirect(url, statusOrUrl);
      } else if (typeof statusOrUrl === 'string') {
        denoRes.redirect(statusOrUrl, 302);
      }
    },

    // Content type
    type(type: string) {
      // Simple MIME type mapping
      const mimeTypes: Record<string, string> = {
        html: 'text/html',
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain',
        js: 'application/javascript',
        css: 'text/css',
      };
      const contentType = mimeTypes[type] || type;
      denoRes.setHeader('Content-Type', contentType);
      return this;
    },

    contentType(type: string) {
      return this.type(type);
    },

    // Cookies
    cookie(name: string, value: string, options: CookieOptions = {}) {
      const cookieStr = serializeCookie(name, value, options);
      cookies.push(cookieStr);
      denoRes.headers.append('Set-Cookie', cookieStr);
      return this;
    },

    clearCookie(name: string, options: CookieOptions = {}) {
      const clearOptions = { ...options, expires: new Date(0), maxAge: 0 };
      return this.cookie(name, '', clearOptions);
    },

    // Other methods
    location(url: string) {
      denoRes.setHeader('Location', url);
      return this;
    },

    links(links: Record<string, string>) {
      const linkHeader = Object.entries(links)
        .map(([rel, href]) => `<${href}>; rel="${rel}"`)
        .join(', ');
      denoRes.setHeader('Link', linkHeader);
      return this;
    },

    vary(field: string) {
      const existing = denoRes.getHeader('Vary');
      if (existing) {
        denoRes.setHeader('Vary', `${existing}, ${field}`);
      } else {
        denoRes.setHeader('Vary', field);
      }
      return this;
    },

    format(obj: Record<string, () => void>) {
      const accept = denoRes.headers.get?.('Accept') || '*/*';
      const types = Object.keys(obj);
      const matched = parseAccept(accept, types);

      if (matched && obj[matched]) {
        obj[matched]();
      } else if (obj.default) {
        obj.default();
      }
      return this;
    },
  };

  return res;
}

/**
 * Wrap an Express middleware to work with the Deno adapter
 */
export function wrapExpressMiddleware(
  middleware: ExpressMiddleware | ExpressErrorMiddleware,
): (
  req: DenoRequest,
  res: DenoResponse,
  next: () => Promise<void>,
) => Promise<void> {
  return async (denoReq: DenoRequest, denoRes: DenoResponse, next: () => Promise<void>) => {
    const expressReq = createExpressRequest(denoReq);
    const expressRes = createExpressResponse(denoRes);

    return new Promise<void>((resolve, reject) => {
      const expressNext: ExpressNextFunction = (err?: unknown) => {
        if (err) {
          // If it's an error middleware (4 params), call it with the error
          if (middleware.length === 4) {
            try {
              const result = (middleware as ExpressErrorMiddleware)(err, expressReq, expressRes, expressNext);
              // Handle async error middleware
              if (result instanceof Promise) {
                result.catch(reject);
              }
            } catch (e) {
              reject(e);
            }
          } else {
            reject(err);
          }
        } else {
          next().then(resolve).catch(reject);
        }
      };

      try {
        const result = (middleware as ExpressMiddleware)(expressReq, expressRes, expressNext);

        // Handle async middleware
        if (result instanceof Promise) {
          result.catch(reject);
        }
      } catch (err) {
        reject(err);
      }
    });
  };
}

/**
 * Create an Express-like app object for middleware that expects app.use()
 */
export interface ExpressLikeApp {
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
