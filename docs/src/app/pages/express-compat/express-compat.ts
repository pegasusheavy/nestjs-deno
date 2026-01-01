import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-express-compat',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">Express Middleware Compatibility</h1>
          <p class="text-xl text-text-secondary">
            Use your existing Express middleware with the Deno adapter through our compatibility layer.
          </p>
        </header>

        <!-- Overview -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚡</span>
            Overview
          </h2>
          <p class="text-text-secondary mb-4">
            The Express compatibility layer provides a bridge between Express middleware and the Deno adapter.
            It wraps Express-style middleware functions and adapts them to work with Deno's native Request/Response objects.
          </p>
          <div class="p-4 bg-dark-800 rounded-lg border-l-4 border-code-green">
            <p class="text-sm text-text-secondary">
              <strong class="text-text-primary">Note:</strong> Most Express middleware works out of the box.
              Some middleware that relies on Node.js-specific APIs may require modifications.
            </p>
          </div>
        </section>

        <!-- Basic Usage -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📖</span>
            Basic Usage
          </h2>
          <p class="text-text-secondary mb-4">
            Use the <code>useExpressMiddleware</code> method to register Express middleware:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-6">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">main.ts</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> {{ '{' }} NestFactory {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;nestjs/core'</span>;
<span class="text-code-pink">import</span> {{ '{' }} DenoAdapter {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;
<span class="text-code-pink">import</span> helmet <span class="text-code-pink">from</span> <span class="text-code-yellow">'helmet'</span>;
<span class="text-code-pink">import</span> compression <span class="text-code-pink">from</span> <span class="text-code-yellow">'compression'</span>;

<span class="text-code-pink">const</span> adapter = <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>();

<span class="text-text-muted">// Register Express middleware</span>
adapter.<span class="text-code-cyan">useExpressMiddleware</span>(<span class="text-code-cyan">helmet</span>());
adapter.<span class="text-code-cyan">useExpressMiddleware</span>(<span class="text-code-cyan">compression</span>());

<span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(AppModule, adapter);
<span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">3000</span>);</code></pre>
          </div>
        </section>

        <!-- Using wrapExpressMiddleware -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🔧</span>
            Manual Wrapping
          </h2>
          <p class="text-text-secondary mb-4">
            For more control, use the <code>wrapExpressMiddleware</code> function directly:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-6">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> {{ '{' }} wrapExpressMiddleware {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;
<span class="text-code-pink">import</span> morgan <span class="text-code-pink">from</span> <span class="text-code-yellow">'morgan'</span>;

<span class="text-text-muted">// Wrap the middleware</span>
<span class="text-code-pink">const</span> loggerMiddleware = <span class="text-code-cyan">wrapExpressMiddleware</span>(<span class="text-code-cyan">morgan</span>(<span class="text-code-yellow">'combined'</span>));

<span class="text-text-muted">// Use with the adapter</span>
adapter.<span class="text-code-cyan">use</span>(loggerMiddleware);</code></pre>
          </div>
        </section>

        <!-- Compatible APIs -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">✅</span>
            Supported Express APIs
          </h2>
          <p class="text-text-secondary mb-4">
            The compatibility layer implements the following Express request and response APIs:
          </p>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Request APIs -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span class="text-code-cyan">Request</span>
              </h3>
              <ul class="space-y-2 text-sm text-text-secondary">
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.body</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.params</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.query</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.headers</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.cookies</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.method</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.url / req.path</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.get(header)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.is(type)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>req.accepts()</code>
                </li>
              </ul>
            </div>

            <!-- Response APIs -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span class="text-code-cyan">Response</span>
              </h3>
              <ul class="space-y-2 text-sm text-text-secondary">
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.status(code)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.json(data)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.send(data)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.set(header, value)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.cookie(name, value)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.redirect(url)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.type(type)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.end()</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.headersSent</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>res.locals</code>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Popular Middleware -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📦</span>
            Popular Middleware Examples
          </h2>

          <div class="space-y-6">
            <!-- Helmet -->
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Helmet (Security Headers)</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> helmet <span class="text-code-pink">from</span> <span class="text-code-yellow">'helmet'</span>;

adapter.<span class="text-code-cyan">useExpressMiddleware</span>(<span class="text-code-cyan">helmet</span>({{ '{' }}
  contentSecurityPolicy: {{ '{' }}
    directives: {{ '{' }}
      defaultSrc: [<span class="text-code-yellow">"'self'"</span>],
      styleSrc: [<span class="text-code-yellow">"'self'"</span>, <span class="text-code-yellow">"'unsafe-inline'"</span>],
    {{ '}' }},
  {{ '}' }},
{{ '}' }}));</code></pre>
              </div>
            </div>

            <!-- Morgan -->
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Morgan (HTTP Logging)</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> morgan <span class="text-code-pink">from</span> <span class="text-code-yellow">'morgan'</span>;

adapter.<span class="text-code-cyan">useExpressMiddleware</span>(<span class="text-code-cyan">morgan</span>(<span class="text-code-yellow">'dev'</span>));</code></pre>
              </div>
            </div>

            <!-- Cookie Parser -->
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Cookie Parser</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> cookieParser <span class="text-code-pink">from</span> <span class="text-code-yellow">'cookie-parser'</span>;

adapter.<span class="text-code-cyan">useExpressMiddleware</span>(<span class="text-code-cyan">cookieParser</span>(<span class="text-code-yellow">'secret'</span>));</code></pre>
              </div>
            </div>

            <!-- Rate Limiting -->
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-3">Rate Limiting</h3>
              <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
                <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> rateLimit <span class="text-code-pink">from</span> <span class="text-code-yellow">'express-rate-limit'</span>;

<span class="text-code-pink">const</span> limiter = <span class="text-code-cyan">rateLimit</span>({{ '{' }}
  windowMs: <span class="text-code-orange">15</span> * <span class="text-code-orange">60</span> * <span class="text-code-orange">1000</span>, <span class="text-text-muted">// 15 minutes</span>
  max: <span class="text-code-orange">100</span>, <span class="text-text-muted">// limit each IP to 100 requests</span>
{{ '}' }});

adapter.<span class="text-code-cyan">useExpressMiddleware</span>(limiter);</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- Error Handling -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🚨</span>
            Error Handling Middleware
          </h2>
          <p class="text-text-secondary mb-4">
            Express-style error handling middleware (4 parameters) is also supported:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">const</span> errorHandler = (err, req, res, next) => {{ '{' }}
  console.<span class="text-code-cyan">error</span>(err.stack);
  res.<span class="text-code-cyan">status</span>(<span class="text-code-orange">500</span>).<span class="text-code-cyan">json</span>({{ '{' }}
    error: <span class="text-code-yellow">'Internal Server Error'</span>,
    message: err.message,
  {{ '}' }});
{{ '}' }};

adapter.<span class="text-code-cyan">useExpressMiddleware</span>(errorHandler);</code></pre>
          </div>
        </section>

        <!-- Limitations -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚠️</span>
            Known Limitations
          </h2>
          <ul class="space-y-3 text-text-secondary">
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Middleware that directly accesses <code>req.socket</code> or Node.js streams may not work</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Session middleware that uses file system storage requires Deno file system permissions</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Middleware that modifies the prototype chain of request/response objects is not supported</span>
            </li>
          </ul>
        </section>

        <!-- Next -->
        <section class="p-6 bg-dark-800 rounded-xl border border-dark-500">
          <h2 class="text-xl font-semibold text-text-primary mb-4">See Also</h2>
          <div class="flex flex-wrap gap-4">
            <a
              routerLink="/fastify-compat"
              class="inline-flex items-center gap-2 px-4 py-2 bg-nest-red hover:bg-nest-red-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>Fastify Compatibility</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a
              routerLink="/api"
              class="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-text-primary text-sm font-medium rounded-lg border border-dark-500 transition-colors"
            >
              <span>API Reference</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </section>
      </article>
    </div>
  `,
})
export class ExpressCompat {}
