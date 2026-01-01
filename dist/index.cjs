"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DenoAdapter: () => DenoAdapter,
  createExpressRequest: () => createExpressRequest,
  createExpressResponse: () => createExpressResponse,
  createFastifyLogger: () => createFastifyLogger,
  createFastifyReply: () => createFastifyReply,
  createFastifyRequest: () => createFastifyRequest,
  wrapExpressMiddleware: () => wrapExpressMiddleware,
  wrapFastifyHook: () => wrapFastifyHook,
  wrapFastifyPlugin: () => wrapFastifyPlugin
});
module.exports = __toCommonJS(index_exports);

// src/adapters/deno-adapter.ts
var import_core = require("@nestjs/core");
var import_common = require("@nestjs/common");

// src/compat/express-compat.ts
var STATUS_MESSAGES = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  206: "Partial Content",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  413: "Payload Too Large",
  415: "Unsupported Media Type",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout"
};
function headersToObject(headers) {
  const result = {};
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
function parseAccept(acceptHeader, types) {
  if (!acceptHeader || types.length === 0) return false;
  const accepts = acceptHeader.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    params.forEach((p) => {
      const [key, value] = p.trim().split("=");
      if (key === "q") q = parseFloat(value) || 1;
    });
    return { type: type.trim(), q };
  }).sort((a, b) => b.q - a.q);
  for (const accept of accepts) {
    for (const type of types) {
      if (accept.type === "*/*" || accept.type === type || accept.type.endsWith("/*") && type.startsWith(accept.type.slice(0, -1))) {
        return type;
      }
    }
  }
  return false;
}
function serializeCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.maxAge !== void 0) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }
  if (options.path) {
    cookie += `; Path=${options.path}`;
  } else {
    cookie += "; Path=/";
  }
  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (options.secure) {
    cookie += "; Secure";
  }
  if (options.sameSite) {
    if (options.sameSite === true) {
      cookie += "; SameSite=Strict";
    } else {
      cookie += `; SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`;
    }
  }
  return cookie;
}
function createExpressRequest(denoReq) {
  const headersObj = headersToObject(denoReq.headers);
  const cookieHeader = denoReq.headers.get("cookie") || "";
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name) {
      cookies[decodeURIComponent(name.trim())] = decodeURIComponent(valueParts.join("="));
    }
  });
  const req = {
    // Core properties
    method: denoReq.method,
    url: denoReq.originalUrl || denoReq.path || "/",
    originalUrl: denoReq.originalUrl || denoReq.path || "/",
    baseUrl: denoReq.baseUrl || "",
    path: denoReq.path || "/",
    hostname: denoReq.hostname || "",
    ip: denoReq.ip,
    protocol: denoReq.protocol || "http",
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
    xhr: denoReq.headers.get("x-requested-with")?.toLowerCase() === "xmlhttprequest",
    subdomains: denoReq.hostname?.split(".").slice(0, -2).reverse() || [],
    // Methods
    get(name) {
      const key = name.toLowerCase();
      const value = headersObj[key];
      return Array.isArray(value) ? value[0] : value;
    },
    header(name) {
      return this.get(name);
    },
    is(type) {
      const contentType = denoReq.headers.get("content-type");
      if (!contentType) return null;
      const types = Array.isArray(type) ? type : [type];
      for (const t of types) {
        if (contentType.includes(t) || contentType.includes(t.replace("/", ""))) {
          return t;
        }
      }
      return false;
    },
    accepts(...types) {
      return parseAccept(denoReq.headers.get("accept") || void 0, types);
    },
    acceptsEncodings(...encodings) {
      return parseAccept(denoReq.headers.get("accept-encoding") || void 0, encodings);
    },
    acceptsCharsets(...charsets) {
      return parseAccept(denoReq.headers.get("accept-charset") || void 0, charsets);
    },
    acceptsLanguages(...langs) {
      return parseAccept(denoReq.headers.get("accept-language") || void 0, langs);
    }
  };
  const modifiedSince = denoReq.headers.get("if-modified-since");
  const noneMatch = denoReq.headers.get("if-none-match");
  req.fresh = !!(modifiedSince || noneMatch);
  req.stale = !req.fresh;
  return req;
}
function createExpressResponse(denoRes) {
  let statusMessage = "OK";
  const cookies = [];
  const res = {
    // Properties
    get statusCode() {
      return denoRes.statusCode;
    },
    set statusCode(code) {
      denoRes.statusCode = code;
      statusMessage = STATUS_MESSAGES[code] || "Unknown";
    },
    get statusMessage() {
      return statusMessage;
    },
    set statusMessage(msg) {
      statusMessage = msg;
    },
    get headersSent() {
      return denoRes.headersSent;
    },
    // Status methods
    status(code) {
      denoRes.status(code);
      statusMessage = STATUS_MESSAGES[code] || "Unknown";
      return this;
    },
    sendStatus(code) {
      this.status(code);
      denoRes.send(STATUS_MESSAGES[code] || String(code));
      return this;
    },
    // Header methods
    set(field, value) {
      if (typeof field === "object") {
        Object.entries(field).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach((v) => denoRes.headers.append(key, v));
          } else {
            denoRes.setHeader(key, val);
          }
        });
      } else if (value !== void 0) {
        if (Array.isArray(value)) {
          value.forEach((v) => denoRes.headers.append(field, v));
        } else {
          denoRes.setHeader(field, value);
        }
      }
      return this;
    },
    header(field, value) {
      if (value === void 0) {
        return denoRes.getHeader(field) || void 0;
      }
      return this.set(field, value);
    },
    get(field) {
      return denoRes.getHeader(field) || void 0;
    },
    append(field, value) {
      if (Array.isArray(value)) {
        value.forEach((v) => denoRes.headers.append(field, v));
      } else {
        denoRes.headers.append(field, value);
      }
      return this;
    },
    // Body methods
    send(body) {
      if (body === void 0) {
        denoRes.end();
      } else if (typeof body === "string") {
        if (!denoRes.getHeader("Content-Type")) {
          denoRes.setHeader("Content-Type", "text/html; charset=utf-8");
        }
        denoRes.send(body);
      } else if (Buffer.isBuffer(body)) {
        if (!denoRes.getHeader("Content-Type")) {
          denoRes.setHeader("Content-Type", "application/octet-stream");
        }
        denoRes.send(body);
      } else if (typeof body === "object") {
        return this.json(body);
      } else {
        denoRes.send(String(body));
      }
      return this;
    },
    json(body) {
      denoRes.json(body);
      return this;
    },
    jsonp(body) {
      denoRes.json(body);
      return this;
    },
    end(data) {
      if (data !== void 0) {
        denoRes.end(typeof data === "string" ? data : JSON.stringify(data));
      } else {
        denoRes.end();
      }
      return this;
    },
    // Redirect
    redirect(statusOrUrl, url) {
      if (typeof statusOrUrl === "number" && url) {
        denoRes.redirect(url, statusOrUrl);
      } else if (typeof statusOrUrl === "string") {
        denoRes.redirect(statusOrUrl, 302);
      }
    },
    // Content type
    type(type) {
      const mimeTypes = {
        html: "text/html",
        json: "application/json",
        xml: "application/xml",
        text: "text/plain",
        js: "application/javascript",
        css: "text/css"
      };
      const contentType = mimeTypes[type] || type;
      denoRes.setHeader("Content-Type", contentType);
      return this;
    },
    contentType(type) {
      return this.type(type);
    },
    // Cookies
    cookie(name, value, options = {}) {
      const cookieStr = serializeCookie(name, value, options);
      cookies.push(cookieStr);
      denoRes.headers.append("Set-Cookie", cookieStr);
      return this;
    },
    clearCookie(name, options = {}) {
      const clearOptions = { ...options, expires: /* @__PURE__ */ new Date(0), maxAge: 0 };
      return this.cookie(name, "", clearOptions);
    },
    // Other methods
    location(url) {
      denoRes.setHeader("Location", url);
      return this;
    },
    links(links) {
      const linkHeader = Object.entries(links).map(([rel, href]) => `<${href}>; rel="${rel}"`).join(", ");
      denoRes.setHeader("Link", linkHeader);
      return this;
    },
    vary(field) {
      const existing = denoRes.getHeader("Vary");
      if (existing) {
        denoRes.setHeader("Vary", `${existing}, ${field}`);
      } else {
        denoRes.setHeader("Vary", field);
      }
      return this;
    },
    format(obj) {
      const accept = denoRes.headers.get?.("Accept") || "*/*";
      const types = Object.keys(obj);
      const matched = parseAccept(accept, types);
      if (matched && obj[matched]) {
        obj[matched]();
      } else if (obj.default) {
        obj.default();
      }
      return this;
    }
  };
  return res;
}
function wrapExpressMiddleware(middleware) {
  return async (denoReq, denoRes, next) => {
    const expressReq = createExpressRequest(denoReq);
    const expressRes = createExpressResponse(denoRes);
    return new Promise((resolve, reject) => {
      const expressNext = (err) => {
        if (err) {
          if (middleware.length === 4) {
            try {
              const result = middleware(err, expressReq, expressRes, expressNext);
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
        const result = middleware(expressReq, expressRes, expressNext);
        if (result instanceof Promise) {
          result.catch(reject);
        }
      } catch (err) {
        reject(err);
      }
    });
  };
}

// src/compat/fastify-compat.ts
var requestIdCounter = 0;
function generateRequestId() {
  return `req-${Date.now()}-${++requestIdCounter}`;
}
function headersToObject2(headers) {
  const result = {};
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
function createFastifyRequest(denoReq) {
  const headersObj = headersToObject2(denoReq.headers);
  const req = {
    id: generateRequestId(),
    params: denoReq.params,
    query: denoReq.query,
    body: denoReq.body,
    headers: headersObj,
    raw: denoReq.raw,
    url: denoReq.originalUrl || denoReq.path || "/",
    originalUrl: denoReq.originalUrl || denoReq.path || "/",
    method: denoReq.method,
    hostname: denoReq.hostname || "",
    ip: denoReq.ip,
    protocol: denoReq.secure ? "https" : "http",
    routerPath: denoReq.path,
    routerMethod: denoReq.method
  };
  return req;
}
function createFastifyReply(denoRes) {
  let serializer = JSON.stringify;
  const startTime = Date.now();
  const reply = {
    get statusCode() {
      return denoRes.statusCode;
    },
    set statusCode(code) {
      denoRes.statusCode = code;
    },
    get sent() {
      return denoRes.headersSent;
    },
    raw: denoRes,
    code(statusCode) {
      denoRes.status(statusCode);
      return this;
    },
    status(statusCode) {
      return this.code(statusCode);
    },
    header(key, value) {
      denoRes.setHeader(key, String(value));
      return this;
    },
    headers(headers) {
      Object.entries(headers).forEach(([key, value]) => {
        denoRes.setHeader(key, String(value));
      });
      return this;
    },
    getHeader(key) {
      return denoRes.getHeader(key) || void 0;
    },
    getHeaders() {
      const result = {};
      denoRes.headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    },
    removeHeader(key) {
      denoRes.removeHeader(key);
      return this;
    },
    hasHeader(key) {
      return denoRes.getHeader(key) !== null;
    },
    send(payload) {
      if (payload === void 0) {
        denoRes.end();
      } else if (typeof payload === "string") {
        if (!denoRes.getHeader("Content-Type")) {
          denoRes.setHeader("Content-Type", "text/plain; charset=utf-8");
        }
        denoRes.send(payload);
      } else if (payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
        if (!denoRes.getHeader("Content-Type")) {
          denoRes.setHeader("Content-Type", "application/octet-stream");
        }
        denoRes.send(payload);
      } else if (typeof payload === "object") {
        if (!denoRes.getHeader("Content-Type")) {
          denoRes.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        denoRes.send(serializer(payload));
      } else {
        denoRes.send(String(payload));
      }
      return this;
    },
    serialize(payload) {
      return serializer(payload);
    },
    serializer(fn) {
      serializer = fn;
      return this;
    },
    type(contentType) {
      denoRes.setHeader("Content-Type", contentType);
      return this;
    },
    redirect(statusCodeOrUrl, url) {
      if (typeof statusCodeOrUrl === "number" && url) {
        denoRes.redirect(url, statusCodeOrUrl);
      } else if (typeof statusCodeOrUrl === "string") {
        denoRes.redirect(statusCodeOrUrl, 302);
      }
      return this;
    },
    callNotFound() {
      denoRes.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "Route not found"
      });
    },
    getResponseTime() {
      return Date.now() - startTime;
    }
  };
  return reply;
}
function isAsyncHook(hook) {
  return hook.length <= 2;
}
function wrapFastifyHook(hook) {
  return async (denoReq, denoRes, next) => {
    const fastifyReq = createFastifyRequest(denoReq);
    const fastifyReply = createFastifyReply(denoRes);
    if (isAsyncHook(hook)) {
      await hook(fastifyReq, fastifyReply);
      if (!fastifyReply.sent) {
        await next();
      }
    } else {
      return new Promise((resolve, reject) => {
        const done = (err) => {
          if (err) {
            reject(err);
          } else if (!fastifyReply.sent) {
            next().then(resolve).catch(reject);
          } else {
            resolve();
          }
        };
        try {
          hook(fastifyReq, fastifyReply, done);
        } catch (err) {
          reject(err);
        }
      });
    }
  };
}
function wrapFastifyPlugin(plugin, instance, opts = {}) {
  return new Promise((resolve, reject) => {
    if (plugin.length <= 2) {
      const result = plugin(instance, opts);
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        resolve();
      }
    } else {
      try {
        plugin(instance, opts, (err) => {
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
function createFastifyLogger() {
  const createLogFn = (level) => (msg, ...args) => {
    console.log(`[${level.toUpperCase()}] ${msg}`, ...args);
  };
  return {
    info: createLogFn("info"),
    error: createLogFn("error"),
    debug: createLogFn("debug"),
    warn: createLogFn("warn"),
    trace: createLogFn("trace"),
    fatal: createLogFn("fatal"),
    child(bindings) {
      const prefix = Object.entries(bindings).map(([k, v]) => `${k}=${v}`).join(" ");
      const childLog = createFastifyLogger();
      const wrap = (fn) => (msg, ...args) => fn(`[${prefix}] ${msg}`, ...args);
      return {
        ...childLog,
        info: wrap(childLog.info),
        error: wrap(childLog.error),
        debug: wrap(childLog.debug),
        warn: wrap(childLog.warn),
        trace: wrap(childLog.trace),
        fatal: wrap(childLog.fatal)
      };
    }
  };
}

// src/adapters/deno-adapter.ts
var DenoAdapter = class _DenoAdapter extends import_core.AbstractHttpAdapter {
  routes = [];
  middlewares = [];
  server;
  abortController;
  corsOptions;
  errorHandler;
  notFoundHandler;
  staticAssetsPath;
  staticAssetsOptions;
  constructor(instance) {
    super(instance || {});
  }
  /**
   * Create a new DenoAdapter instance
   */
  static create() {
    return new _DenoAdapter();
  }
  async listen(port, hostnameOrCallback, callback) {
    const portNum = typeof port === "string" ? parseInt(port, 10) : port;
    const hostname = typeof hostnameOrCallback === "string" ? hostnameOrCallback : "0.0.0.0";
    const cb = typeof hostnameOrCallback === "function" ? hostnameOrCallback : callback;
    this.abortController = new AbortController();
    const serveOptions = {
      port: portNum,
      hostname,
      signal: this.abortController.signal,
      onListen: () => {
        cb?.();
      }
    };
    this.server = Deno.serve(
      serveOptions,
      this.handleRequest.bind(this)
    );
  }
  /**
   * Handle incoming HTTP requests
   */
  async handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const req = await this.createRequest(request, url);
    const res = this.createResponse();
    try {
      if (this.corsOptions && method === "OPTIONS") {
        this.handleCors(req, res);
        return this.buildResponse(res);
      }
      if (this.corsOptions) {
        this.applyCorsHeaders(req, res);
      }
      if (this.staticAssetsPath && path.startsWith(this.staticAssetsOptions?.prefix || "/")) {
        const staticResponse = await this.serveStaticAsset(path);
        if (staticResponse) {
          return staticResponse;
        }
      }
      await this.runMiddlewares(req, res, path);
      if (res.headersSent) {
        return this.buildResponse(res);
      }
      const route = this.findRoute(path, method);
      if (route) {
        req.params = this.extractParams(route, path);
        await route.handler(req, res);
      } else if (this.notFoundHandler) {
        this.notFoundHandler(req, res);
      } else {
        res.status(import_common.HttpStatus.NOT_FOUND).json({
          statusCode: import_common.HttpStatus.NOT_FOUND,
          message: "Cannot " + method + " " + path,
          error: "Not Found"
        });
      }
      return this.buildResponse(res);
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error, req, res);
        return this.buildResponse(res);
      }
      res.status(import_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: import_common.HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || "Internal Server Error",
        error: "Internal Server Error"
      });
      return this.buildResponse(res);
    }
  }
  /**
   * Create a DenoRequest object from a native Request
   */
  async createRequest(request, url) {
    let body = void 0;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase())) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          body = await request.json();
        } catch {
          body = void 0;
        }
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        try {
          const formData = await request.formData();
          const entries = {};
          formData.forEach((value, key) => {
            entries[key] = value;
          });
          body = entries;
        } catch {
          body = void 0;
        }
      } else if (contentType.includes("text/")) {
        try {
          body = await request.text();
        } catch {
          body = void 0;
        }
      } else if (contentType.includes("multipart/form-data")) {
        try {
          body = await request.formData();
        } catch {
          body = void 0;
        }
      }
    }
    const query = {};
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
      ip: void 0,
      // Deno doesn't expose client IP in the same way
      hostname: url.hostname,
      protocol: url.protocol.replace(":", ""),
      secure: url.protocol === "https:",
      originalUrl: url.pathname + url.search,
      baseUrl: "",
      path: url.pathname
    };
  }
  /**
   * Create a DenoResponse object
   */
  createResponse() {
    const headers = new Headers();
    let statusCode = 200;
    let body = null;
    let headersSent = false;
    const res = {
      get statusCode() {
        return statusCode;
      },
      set statusCode(code) {
        statusCode = code;
      },
      headers,
      get body() {
        return body;
      },
      set body(b) {
        body = b ?? null;
      },
      get headersSent() {
        return headersSent;
      },
      set headersSent(sent) {
        headersSent = sent;
      },
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(name, value) {
        headers.set(name, value);
        return this;
      },
      getHeader(name) {
        return headers.get(name);
      },
      removeHeader(name) {
        headers.delete(name);
        return this;
      },
      send(responseBody) {
        headersSent = true;
        if (responseBody === void 0 || responseBody === null) {
          body = null;
        } else if (typeof responseBody === "object" && !(responseBody instanceof Blob) && !(responseBody instanceof ReadableStream) && !(responseBody instanceof FormData) && !(responseBody instanceof URLSearchParams) && !(responseBody instanceof ArrayBuffer)) {
          headers.set("Content-Type", "application/json");
          body = JSON.stringify(responseBody);
        } else {
          body = responseBody;
        }
      },
      json(responseBody) {
        headersSent = true;
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(responseBody);
      },
      redirect(url, code = 302) {
        headersSent = true;
        statusCode = code;
        headers.set("Location", url);
        body = null;
      },
      end(responseBody) {
        headersSent = true;
        body = responseBody ?? null;
      }
    };
    return res;
  }
  /**
   * Build a Response object from DenoResponse
   */
  buildResponse(res) {
    return new Response(res.body, {
      status: res.statusCode,
      headers: res.headers
    });
  }
  /**
   * Run all matching middlewares
   */
  async runMiddlewares(req, res, path) {
    const matchingMiddlewares = this.middlewares.filter(
      (m) => path.startsWith(m.path) || m.path === "*" || m.path === "/"
    );
    let index = 0;
    const next = async () => {
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
  findRoute(path, method) {
    return this.routes.find((route) => {
      const methodMatch = route.method === method || route.method === "ALL";
      if (typeof route.path === "string") {
        const pattern = this.pathToRegex(route.path);
        return methodMatch && pattern.test(path);
      }
      return methodMatch && route.path.test(path);
    });
  }
  /**
   * Extract route parameters from path
   */
  extractParams(route, path) {
    const params = {};
    if (typeof route.path === "string") {
      const pattern = this.pathToRegex(route.path);
      const match = path.match(pattern);
      if (match) {
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1] || "";
        });
      }
    }
    return params;
  }
  /**
   * Convert a path pattern to a RegExp
   */
  pathToRegex(path) {
    const escaped = path.replace(/([.+?^${}()|[\]\\])/g, "\\$1").replace(/:(\w+)/g, "([^/]+)").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  }
  /**
   * Extract parameter keys from path pattern
   */
  extractKeys(path) {
    const keys = [];
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
  registerRoute(method, path, handler) {
    this.routes.push({
      path,
      method,
      handler,
      keys: this.extractKeys(path)
    });
  }
  get(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("GET", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("GET", pathOrHandler, handler);
    }
  }
  post(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("POST", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("POST", pathOrHandler, handler);
    }
  }
  put(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("PUT", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("PUT", pathOrHandler, handler);
    }
  }
  delete(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("DELETE", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("DELETE", pathOrHandler, handler);
    }
  }
  patch(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("PATCH", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("PATCH", pathOrHandler, handler);
    }
  }
  options(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("OPTIONS", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("OPTIONS", pathOrHandler, handler);
    }
  }
  head(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("HEAD", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("HEAD", pathOrHandler, handler);
    }
  }
  all(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.registerRoute("ALL", "/", pathOrHandler);
    } else if (handler) {
      this.registerRoute("ALL", pathOrHandler, handler);
    }
  }
  use(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      this.middlewares.push({
        path: "*",
        handler: pathOrHandler
      });
    } else if (handler) {
      this.middlewares.push({
        path: pathOrHandler,
        handler
      });
    }
  }
  useExpressMiddleware(pathOrMiddleware, middleware) {
    if (typeof pathOrMiddleware === "function") {
      const wrappedMiddleware = wrapExpressMiddleware(pathOrMiddleware);
      this.middlewares.push({
        path: "*",
        handler: wrappedMiddleware
      });
    } else if (middleware) {
      const wrappedMiddleware = wrapExpressMiddleware(middleware);
      this.middlewares.push({
        path: pathOrMiddleware,
        handler: wrappedMiddleware
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
  getExpressApp() {
    const self = this;
    const settings = {};
    const app = {
      locals: {},
      settings,
      use(...args) {
        if (args.length === 1 && typeof args[0] === "function") {
          self.useExpressMiddleware(args[0]);
        } else if (args.length === 2 && typeof args[0] === "string" && typeof args[1] === "function") {
          self.useExpressMiddleware(args[0], args[1]);
        } else if (args.length >= 2) {
          const path = typeof args[0] === "string" ? args[0] : "*";
          const handlers = typeof args[0] === "string" ? args.slice(1) : args;
          handlers.forEach((handler) => {
            if (typeof handler === "function") {
              self.useExpressMiddleware(path, handler);
            }
          });
        }
      },
      get(path, ...handlers) {
        handlers.forEach((handler) => {
          self.get(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      post(path, ...handlers) {
        handlers.forEach((handler) => {
          self.post(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      put(path, ...handlers) {
        handlers.forEach((handler) => {
          self.put(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      delete(path, ...handlers) {
        handlers.forEach((handler) => {
          self.delete(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      patch(path, ...handlers) {
        handlers.forEach((handler) => {
          self.patch(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      options(path, ...handlers) {
        handlers.forEach((handler) => {
          self.options(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      head(path, ...handlers) {
        handlers.forEach((handler) => {
          self.head(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      all(path, ...handlers) {
        handlers.forEach((handler) => {
          self.all(path, async (req, res) => {
            const expressReq = createExpressRequest(req);
            const expressRes = createExpressResponse(res);
            await handler(expressReq, expressRes, () => {
            });
          });
        });
      },
      set(key, value) {
        settings[key] = value;
      },
      enable(key) {
        settings[key] = true;
      },
      disable(key) {
        settings[key] = false;
      },
      enabled(key) {
        return Boolean(settings[key]);
      },
      disabled(key) {
        return !settings[key];
      }
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
  useFastifyHook(_name, hook) {
    const wrappedHook = wrapFastifyHook(hook);
    this.middlewares.push({
      path: "*",
      handler: wrappedHook
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
  async registerFastifyPlugin(plugin, opts) {
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
  getFastifyInstance() {
    const self = this;
    const decorators = {};
    const requestDecorators = {};
    const replyDecorators = {};
    const instance = {
      log: createFastifyLogger(),
      prefix: "",
      // Decorators
      decorate(name, value) {
        decorators[name] = value;
        return this;
      },
      decorateRequest(name, value) {
        requestDecorators[name] = value;
        return this;
      },
      decorateReply(name, value) {
        replyDecorators[name] = value;
        return this;
      },
      hasDecorator(name) {
        return name in decorators;
      },
      hasRequestDecorator(name) {
        return name in requestDecorators;
      },
      hasReplyDecorator(name) {
        return name in replyDecorators;
      },
      // Hooks
      addHook(name, hook) {
        if (["onRequest", "preParsing", "preValidation", "preHandler", "onResponse"].includes(name)) {
          self.useFastifyHook(name, hook);
        }
        return this;
      },
      // Plugin registration
      register(plugin, opts) {
        wrapFastifyPlugin(plugin, this, opts).catch(console.error);
        return this;
      },
      // Routes
      route(opts) {
        const methods = Array.isArray(opts.method) ? opts.method : [opts.method];
        methods.forEach((method) => {
          const handler = async (req, res) => {
            const fastifyReq = createFastifyRequest(req);
            const fastifyReply = createFastifyReply(res);
            Object.entries(requestDecorators).forEach(([key, value]) => {
              fastifyReq[key] = typeof value === "function" ? value() : value;
            });
            Object.entries(replyDecorators).forEach(([key, value]) => {
              fastifyReply[key] = typeof value === "function" ? value() : value;
            });
            const hooks = [
              ...opts.onRequest ? Array.isArray(opts.onRequest) ? opts.onRequest : [opts.onRequest] : [],
              ...opts.preValidation ? Array.isArray(opts.preValidation) ? opts.preValidation : [opts.preValidation] : [],
              ...opts.preHandler ? Array.isArray(opts.preHandler) ? opts.preHandler : [opts.preHandler] : []
            ];
            for (const hook of hooks) {
              if (fastifyReply.sent) break;
              await new Promise((resolve, reject) => {
                if (hook.length <= 2) {
                  hook(fastifyReq, fastifyReply).then(resolve).catch(reject);
                } else {
                  hook(
                    fastifyReq,
                    fastifyReply,
                    (err) => err ? reject(err) : resolve()
                  );
                }
              });
            }
            if (!fastifyReply.sent) {
              const result = await opts.handler(fastifyReq, fastifyReply);
              if (result !== void 0 && !fastifyReply.sent) {
                fastifyReply.send(result);
              }
            }
          };
          switch (method.toUpperCase()) {
            case "GET":
              self.get(opts.url, handler);
              break;
            case "POST":
              self.post(opts.url, handler);
              break;
            case "PUT":
              self.put(opts.url, handler);
              break;
            case "DELETE":
              self.delete(opts.url, handler);
              break;
            case "PATCH":
              self.patch(opts.url, handler);
              break;
            case "OPTIONS":
              self.options(opts.url, handler);
              break;
            case "HEAD":
              self.head(opts.url, handler);
              break;
            default:
              self.all(opts.url, handler);
          }
        });
        return this;
      },
      // HTTP method shortcuts
      get(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "GET", url: path, handler: h });
      },
      post(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "POST", url: path, handler: h });
      },
      put(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "PUT", url: path, handler: h });
      },
      delete(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "DELETE", url: path, handler: h });
      },
      patch(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "PATCH", url: path, handler: h });
      },
      options(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "OPTIONS", url: path, handler: h });
      },
      head(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: "HEAD", url: path, handler: h });
      },
      all(path, optsOrHandler, handler) {
        const h = typeof optsOrHandler === "function" ? optsOrHandler : handler;
        const opts = typeof optsOrHandler === "object" ? optsOrHandler : {};
        return this.route({ ...opts, method: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"], url: path, handler: h });
      }
    };
    return instance;
  }
  /**
   * Get the underlying HTTP server
   */
  getHttpServer() {
    return this.server;
  }
  /**
   * Set the HTTP server instance
   */
  setHttpServer(server) {
    this.server = server;
  }
  /**
   * Close the server
   */
  async close() {
    if (this.abortController) {
      this.abortController.abort();
      await this.server?.finished;
    }
  }
  /**
   * Set error handler
   */
  setErrorHandler(handler) {
    this.errorHandler = handler;
  }
  /**
   * Set 404 handler
   */
  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }
  /**
   * Enable CORS
   */
  enableCors(options) {
    this.corsOptions = options || {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: false
    };
  }
  /**
   * Handle CORS preflight requests
   */
  handleCors(req, res) {
    this.applyCorsHeaders(req, res);
    res.status(this.corsOptions?.optionsSuccessStatus || 204).end();
  }
  /**
   * Apply CORS headers to response
   */
  applyCorsHeaders(req, res) {
    if (!this.corsOptions) return;
    const origin = req.headers.get("origin") || "*";
    let allowOrigin = "*";
    if (typeof this.corsOptions.origin === "string") {
      allowOrigin = this.corsOptions.origin;
    } else if (typeof this.corsOptions.origin === "boolean") {
      allowOrigin = this.corsOptions.origin ? origin : "";
    } else if (Array.isArray(this.corsOptions.origin)) {
      allowOrigin = this.corsOptions.origin.includes(origin) ? origin : "";
    } else if (typeof this.corsOptions.origin === "function") {
      const result = this.corsOptions.origin(origin);
      allowOrigin = typeof result === "string" ? result : result ? origin : "";
    }
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    if (this.corsOptions.credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    const methods = Array.isArray(this.corsOptions.methods) ? this.corsOptions.methods.join(",") : this.corsOptions.methods || "GET,HEAD,PUT,PATCH,POST,DELETE";
    res.setHeader("Access-Control-Allow-Methods", methods);
    if (this.corsOptions.allowedHeaders) {
      const headers = Array.isArray(this.corsOptions.allowedHeaders) ? this.corsOptions.allowedHeaders.join(",") : this.corsOptions.allowedHeaders;
      res.setHeader("Access-Control-Allow-Headers", headers);
    } else {
      const requestHeaders = req.headers.get("access-control-request-headers");
      if (requestHeaders) {
        res.setHeader("Access-Control-Allow-Headers", requestHeaders);
      }
    }
    if (this.corsOptions.exposedHeaders) {
      const exposed = Array.isArray(this.corsOptions.exposedHeaders) ? this.corsOptions.exposedHeaders.join(",") : this.corsOptions.exposedHeaders;
      res.setHeader("Access-Control-Expose-Headers", exposed);
    }
    if (this.corsOptions.maxAge) {
      res.setHeader("Access-Control-Max-Age", String(this.corsOptions.maxAge));
    }
  }
  /**
   * Use static assets
   */
  useStaticAssets(path, options) {
    this.staticAssetsPath = path;
    this.staticAssetsOptions = options;
  }
  /**
   * Serve static asset
   */
  async serveStaticAsset(urlPath) {
    if (!this.staticAssetsPath) return null;
    const prefix = this.staticAssetsOptions?.prefix || "/";
    const relativePath = urlPath.replace(prefix, "").replace(/^\//, "");
    const filePath = `${this.staticAssetsPath}/${relativePath}`;
    try {
      const file = await Deno.open(filePath, { read: true });
      const stat = await file.stat();
      if (stat.isDirectory) {
        file.close();
        if (this.staticAssetsOptions?.index !== false) {
          const indexFile = typeof this.staticAssetsOptions?.index === "string" ? this.staticAssetsOptions.index : "index.html";
          return this.serveStaticAsset(`${urlPath}/${indexFile}`);
        }
        return null;
      }
      const headers = new Headers();
      const ext = filePath.split(".").pop()?.toLowerCase();
      const mimeTypes = {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        ico: "image/x-icon",
        woff: "font/woff",
        woff2: "font/woff2",
        ttf: "font/ttf",
        eot: "application/vnd.ms-fontobject",
        txt: "text/plain",
        xml: "application/xml",
        pdf: "application/pdf",
        mp4: "video/mp4",
        webm: "video/webm",
        mp3: "audio/mpeg",
        wav: "audio/wav"
      };
      headers.set("Content-Type", mimeTypes[ext || ""] || "application/octet-stream");
      if (this.staticAssetsOptions?.etag !== false) {
        headers.set("ETag", `"${stat.size}-${stat.mtime?.getTime() || 0}"`);
      }
      if (this.staticAssetsOptions?.lastModified !== false && stat.mtime) {
        headers.set("Last-Modified", stat.mtime.toUTCString());
      }
      if (this.staticAssetsOptions?.maxAge) {
        let cacheControl = `max-age=${this.staticAssetsOptions.maxAge}`;
        if (this.staticAssetsOptions.immutable) {
          cacheControl += ", immutable";
        }
        headers.set("Cache-Control", cacheControl);
      }
      return new Response(file.readable, {
        status: 200,
        headers
      });
    } catch (error) {
      if (error.name === "NotFound") {
        return null;
      }
      throw error;
    }
  }
  /**
   * Set view engine (not implemented for base adapter)
   */
  setViewEngine(_engine) {
    console.warn("View engine is not supported in the base Deno adapter");
  }
  /**
   * Render view (not implemented for base adapter)
   */
  render(_response, _view, _options) {
    console.warn("Render is not supported in the base Deno adapter");
  }
  /**
   * Get request hostname
   */
  getRequestHostname(request) {
    return request.hostname || request.headers.get("host") || "";
  }
  /**
   * Get request method
   */
  getRequestMethod(request) {
    return request.method;
  }
  /**
   * Get request URL
   */
  getRequestUrl(request) {
    return request.path || new URL(request.url).pathname;
  }
  /**
   * Send a reply
   */
  reply(response, body, statusCode) {
    if (statusCode) {
      response.status(statusCode);
    }
    if (body === void 0 || body === null) {
      response.end();
    } else if (typeof body === "object") {
      response.json(body);
    } else {
      response.send(String(body));
    }
  }
  /**
   * Set response status
   */
  status(response, statusCode) {
    response.status(statusCode);
  }
  /**
   * Redirect response
   */
  redirect(response, statusCode, url) {
    response.redirect(url, statusCode);
  }
  /**
   * Set response header
   */
  setHeader(response, name, value) {
    response.setHeader(name, value);
  }
  /**
   * Get response header
   */
  getHeader(response, name) {
    return response.getHeader(name);
  }
  /**
   * Append value to header
   */
  appendHeader(response, name, value) {
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
  end(response, message) {
    response.end(message);
  }
  /**
   * Check if headers have been sent
   */
  isHeadersSent(response) {
    return response.headersSent;
  }
  /**
   * Register body parser middleware
   */
  registerParserMiddleware() {
  }
  /**
   * Create middleware factory
   */
  createMiddlewareFactory(_requestMethod) {
    return (path, callback) => {
      this.use(path, async (req, res, next) => {
        await callback(req, res, next);
      });
    };
  }
  /**
   * Initialize the adapter
   */
  initHttpServer() {
  }
  /**
   * Get the adapter type
   */
  getType() {
    return "deno";
  }
  /**
   * Apply version filter
   */
  applyVersionFilter(handler, _version, _versioningOptions) {
    return (_req, _res, _next) => {
      return handler;
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DenoAdapter,
  createExpressRequest,
  createExpressResponse,
  createFastifyLogger,
  createFastifyReply,
  createFastifyRequest,
  wrapExpressMiddleware,
  wrapFastifyHook,
  wrapFastifyPlugin
});
//# sourceMappingURL=index.cjs.map