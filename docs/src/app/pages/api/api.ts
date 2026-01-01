import { Component } from '@angular/core';

@Component({
  selector: 'app-api',
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">API Reference</h1>
          <p class="text-xl text-text-secondary">
            Complete API documentation for the NestJS Deno adapter.
          </p>
        </header>

        <!-- DenoAdapter -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📦</span>
            DenoAdapter
          </h2>
          <p class="text-text-secondary mb-4">
            The main adapter class that implements the NestJS <code>AbstractHttpAdapter</code> interface.
          </p>

          <!-- Constructor -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-text-primary mb-3">Constructor</h3>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>(options?: <span class="text-code-cyan">DenoHttpOptions</span>)</code></pre>
            </div>
            <div class="mt-4">
              <h4 class="text-sm font-semibold text-text-muted mb-2">Parameters</h4>
              <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
                <div class="flex items-start gap-4">
                  <code class="text-code-cyan text-sm">options</code>
                  <div>
                    <span class="text-text-muted text-sm">DenoHttpOptions (optional)</span>
                    <p class="text-text-secondary text-sm mt-1">Configuration options for the Deno HTTP server.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Methods -->
          <div class="space-y-8">
            <h3 class="text-xl font-semibold text-text-primary mb-3">Methods</h3>

            <!-- listen -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">listen</span>(port: <span class="text-code-pink">number</span>, callback?: () => <span class="text-code-pink">void</span>): <span class="text-code-pink">Promise</span>&lt;<span class="text-code-pink">void</span>&gt;</code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm">Starts the HTTP server on the specified port.</p>
              </div>
            </div>

            <!-- close -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">close</span>(): <span class="text-code-pink">Promise</span>&lt;<span class="text-code-pink">void</span>&gt;</code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm">Gracefully shuts down the HTTP server.</p>
              </div>
            </div>

            <!-- enableCors -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">enableCors</span>(options?: <span class="text-code-cyan">CorsOptions</span>): <span class="text-code-pink">void</span></code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm mb-3">Enables Cross-Origin Resource Sharing with optional configuration.</p>
                <div class="text-xs text-text-muted">
                  <strong>Options:</strong> origin, methods, allowedHeaders, exposedHeaders, credentials, maxAge, preflightContinue
                </div>
              </div>
            </div>

            <!-- useStaticAssets -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">useStaticAssets</span>(path: <span class="text-code-pink">string</span>, options?: <span class="text-code-cyan">StaticAssetsOptions</span>): <span class="text-code-pink">void</span></code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm mb-3">Serves static files from the specified directory.</p>
                <div class="text-xs text-text-muted">
                  <strong>Options:</strong> prefix, index, etag, maxAge, immutable, fallthrough
                </div>
              </div>
            </div>

            <!-- use -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">use</span>(handler: <span class="text-code-cyan">MiddlewareHandler</span>): <span class="text-code-pink">void</span></code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm">Registers a middleware function to be executed for all requests.</p>
              </div>
            </div>

            <!-- useExpressMiddleware -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">useExpressMiddleware</span>(middleware: <span class="text-code-cyan">ExpressMiddleware</span>): <span class="text-code-pink">void</span></code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm">Registers Express-compatible middleware through the compatibility layer.</p>
              </div>
            </div>

            <!-- useFastifyHook -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="px-4 py-3 bg-dark-700 border-b border-dark-500">
                <code class="text-sm"><span class="text-code-cyan">useFastifyHook</span>(hookName: <span class="text-code-pink">string</span>, handler: <span class="text-code-cyan">FastifyHook</span>): <span class="text-code-pink">void</span></code>
              </div>
              <div class="p-4">
                <p class="text-text-secondary text-sm">Registers a Fastify-compatible hook through the compatibility layer.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- DenoHttpOptions -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚙️</span>
            DenoHttpOptions
          </h2>
          <p class="text-text-secondary mb-4">
            Configuration options for the Deno HTTP adapter.
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">interface</span> <span class="text-code-green">DenoHttpOptions</span> {{ '{' }}
  <span class="text-text-muted">// Hostname to bind the server to</span>
  hostname?: <span class="text-code-pink">string</span>;

  <span class="text-text-muted">// Port number (can also be set via listen())</span>
  port?: <span class="text-code-pink">number</span>;

  <span class="text-text-muted">// TLS/HTTPS configuration</span>
  cert?: <span class="text-code-pink">string</span>;
  key?: <span class="text-code-pink">string</span>;

  <span class="text-text-muted">// Abort signal for graceful shutdown</span>
  signal?: <span class="text-code-cyan">AbortSignal</span>;
{{ '}' }}</code></pre>
          </div>
        </section>

        <!-- CorsOptions -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🌐</span>
            CorsOptions
          </h2>
          <p class="text-text-secondary mb-4">
            Configuration options for Cross-Origin Resource Sharing.
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">interface</span> <span class="text-code-green">CorsOptions</span> {{ '{' }}
  <span class="text-text-muted">// Allowed origins (string, array, or function)</span>
  origin?: <span class="text-code-pink">string</span> | <span class="text-code-pink">string</span>[] | <span class="text-code-pink">boolean</span> | <span class="text-code-cyan">RegExp</span> | <span class="text-code-cyan">Function</span>;

  <span class="text-text-muted">// Allowed HTTP methods</span>
  methods?: <span class="text-code-pink">string</span> | <span class="text-code-pink">string</span>[];

  <span class="text-text-muted">// Allowed request headers</span>
  allowedHeaders?: <span class="text-code-pink">string</span> | <span class="text-code-pink">string</span>[];

  <span class="text-text-muted">// Headers exposed to the client</span>
  exposedHeaders?: <span class="text-code-pink">string</span> | <span class="text-code-pink">string</span>[];

  <span class="text-text-muted">// Allow credentials (cookies, authorization headers)</span>
  credentials?: <span class="text-code-pink">boolean</span>;

  <span class="text-text-muted">// Preflight cache duration in seconds</span>
  maxAge?: <span class="text-code-pink">number</span>;

  <span class="text-text-muted">// Pass preflight response to next handler</span>
  preflightContinue?: <span class="text-code-pink">boolean</span>;

  <span class="text-text-muted">// Status code for successful OPTIONS requests</span>
  optionsSuccessStatus?: <span class="text-code-pink">number</span>;
{{ '}' }}</code></pre>
          </div>
        </section>

        <!-- StaticAssetsOptions -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📁</span>
            StaticAssetsOptions
          </h2>
          <p class="text-text-secondary mb-4">
            Configuration options for serving static files.
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">interface</span> <span class="text-code-green">StaticAssetsOptions</span> {{ '{' }}
  <span class="text-text-muted">// URL prefix for static files (e.g., '/static')</span>
  prefix?: <span class="text-code-pink">string</span>;

  <span class="text-text-muted">// Index file name (default: 'index.html')</span>
  index?: <span class="text-code-pink">string</span> | <span class="text-code-pink">boolean</span>;

  <span class="text-text-muted">// Enable ETag generation</span>
  etag?: <span class="text-code-pink">boolean</span>;

  <span class="text-text-muted">// Cache-Control max-age in seconds</span>
  maxAge?: <span class="text-code-pink">number</span>;

  <span class="text-text-muted">// Set immutable directive in Cache-Control</span>
  immutable?: <span class="text-code-pink">boolean</span>;

  <span class="text-text-muted">// Continue to next middleware if file not found</span>
  fallthrough?: <span class="text-code-pink">boolean</span>;
{{ '}' }}</code></pre>
          </div>
        </section>

        <!-- Usage Examples -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">💡</span>
            Usage Examples
          </h2>

          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Basic Setup</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> {{ '{' }} NestFactory {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;nestjs/core'</span>;
<span class="text-code-pink">import</span> {{ '{' }} DenoAdapter {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;
<span class="text-code-pink">import</span> {{ '{' }} AppModule {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'./app.module'</span>;

<span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(AppModule, <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>());
<span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">3000</span>);</code></pre>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">With HTTPS</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">const</span> adapter = <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>({{ '{' }}
  cert: <span class="text-code-pink">await</span> Deno.<span class="text-code-cyan">readTextFile</span>(<span class="text-code-yellow">'./cert.pem'</span>),
  key: <span class="text-code-pink">await</span> Deno.<span class="text-code-cyan">readTextFile</span>(<span class="text-code-yellow">'./key.pem'</span>),
{{ '}' }});

<span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(AppModule, adapter);
<span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">443</span>);</code></pre>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Full Configuration</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(AppModule, <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>());

<span class="text-text-muted">// Enable CORS</span>
app.<span class="text-code-cyan">enableCors</span>({{ '{' }}
  origin: [<span class="text-code-yellow">'https://app.example.com'</span>],
  credentials: <span class="text-code-orange">true</span>,
{{ '}' }});

<span class="text-text-muted">// Serve static files</span>
app.<span class="text-code-cyan">useStaticAssets</span>(<span class="text-code-yellow">'./public'</span>, {{ '{' }}
  prefix: <span class="text-code-yellow">'/assets'</span>,
  maxAge: <span class="text-code-orange">86400000</span>,
{{ '}' }});

<span class="text-text-muted">// Set global prefix</span>
app.<span class="text-code-cyan">setGlobalPrefix</span>(<span class="text-code-yellow">'api'</span>);

<span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">3000</span>);</code></pre>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  `,
})
export class Api {}
