import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fastify-compat',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">Fastify Plugins Compatibility</h1>
          <p class="text-xl text-text-secondary">
            Integrate Fastify hooks and plugins with the Deno adapter through our compatibility layer.
          </p>
        </header>

        <!-- Overview -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🔌</span>
            Overview
          </h2>
          <p class="text-text-secondary mb-4">
            The Fastify compatibility layer allows you to use Fastify-style hooks and plugins with the Deno adapter.
            This is particularly useful if you're migrating from a Fastify-based NestJS application or want to use
            Fastify plugins for specific functionality.
          </p>
          <div class="p-4 bg-dark-800 rounded-lg border-l-4 border-code-purple">
            <p class="text-sm text-text-secondary">
              <strong class="text-text-primary">Note:</strong> The compatibility layer focuses on Fastify's hook system
              and basic plugin architecture. Complex Fastify-specific features may require adaptation.
            </p>
          </div>
        </section>

        <!-- Hooks -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🪝</span>
            Using Fastify Hooks
          </h2>
          <p class="text-text-secondary mb-4">
            Register Fastify-style hooks using the <code>useFastifyHook</code> method:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-6">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">main.ts</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> {{ '{' }} NestFactory {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;nestjs/core'</span>;
<span class="text-code-pink">import</span> {{ '{' }} DenoAdapter {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;

<span class="text-code-pink">const</span> adapter = <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>();

<span class="text-text-muted">// onRequest hook - runs before route matching</span>
adapter.<span class="text-code-cyan">useFastifyHook</span>(<span class="text-code-yellow">'onRequest'</span>, <span class="text-code-pink">async</span> (request, reply) => {{ '{' }}
  request.startTime = Date.<span class="text-code-cyan">now</span>();
{{ '}' }});

<span class="text-text-muted">// preHandler hook - runs before the route handler</span>
adapter.<span class="text-code-cyan">useFastifyHook</span>(<span class="text-code-yellow">'preHandler'</span>, <span class="text-code-pink">async</span> (request, reply) => {{ '{' }}
  <span class="text-text-muted">// Authentication, validation, etc.</span>
{{ '}' }});

<span class="text-text-muted">// onSend hook - runs before sending the response</span>
adapter.<span class="text-code-cyan">useFastifyHook</span>(<span class="text-code-yellow">'onSend'</span>, <span class="text-code-pink">async</span> (request, reply, payload) => {{ '{' }}
  <span class="text-code-pink">const</span> duration = Date.<span class="text-code-cyan">now</span>() - request.startTime;
  reply.<span class="text-code-cyan">header</span>(<span class="text-code-yellow">'X-Response-Time'</span>, <span class="text-code-yellow">\`\${{ '{' }}duration{{ '}' }}ms\`</span>);
  <span class="text-code-pink">return</span> payload;
{{ '}' }});

<span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(AppModule, adapter);</code></pre>
          </div>
        </section>

        <!-- Supported Hooks -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">✅</span>
            Supported Hooks
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">onRequest</h3>
              <p class="text-sm text-text-secondary">Called when a request is received, before routing.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">preParsing</h3>
              <p class="text-sm text-text-secondary">Called before the request body is parsed.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">preValidation</h3>
              <p class="text-sm text-text-secondary">Called before validation.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">preHandler</h3>
              <p class="text-sm text-text-secondary">Called just before the route handler.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">preSerialization</h3>
              <p class="text-sm text-text-secondary">Called before the response is serialized.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">onSend</h3>
              <p class="text-sm text-text-secondary">Called right before the response is sent.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">onResponse</h3>
              <p class="text-sm text-text-secondary">Called after the response has been sent.</p>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-code-purple mb-2">onError</h3>
              <p class="text-sm text-text-secondary">Called when an error occurs.</p>
            </div>
          </div>
        </section>

        <!-- Plugins -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🧩</span>
            Registering Plugins
          </h2>
          <p class="text-text-secondary mb-4">
            Use the <code>registerFastifyPlugin</code> method to register Fastify-style plugins:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-6">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-text-muted">// Define a plugin</span>
<span class="text-code-pink">const</span> myPlugin = <span class="text-code-pink">async</span> (fastify, options) => {{ '{' }}
  <span class="text-text-muted">// Decorate the request</span>
  fastify.<span class="text-code-cyan">decorateRequest</span>(<span class="text-code-yellow">'user'</span>, <span class="text-code-orange">null</span>);

  <span class="text-text-muted">// Add hooks</span>
  fastify.<span class="text-code-cyan">addHook</span>(<span class="text-code-yellow">'preHandler'</span>, <span class="text-code-pink">async</span> (request, reply) => {{ '{' }}
    <span class="text-text-muted">// Authenticate user</span>
    request.user = <span class="text-code-pink">await</span> <span class="text-code-cyan">authenticate</span>(request);
  {{ '}' }});
{{ '}' }};

<span class="text-text-muted">// Register the plugin</span>
adapter.<span class="text-code-cyan">registerFastifyPlugin</span>(myPlugin, {{ '{' }}
  <span class="text-text-muted">// Plugin options</span>
{{ '}' }});</code></pre>
          </div>
        </section>

        <!-- Request/Reply APIs -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📋</span>
            Supported Request/Reply APIs
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Request APIs -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span class="text-code-cyan">Request</span>
              </h3>
              <ul class="space-y-2 text-sm text-text-secondary">
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.body</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.params</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.query</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.headers</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.method</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.url</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.id</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.ip</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.hostname</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>request.log</code>
                </li>
              </ul>
            </div>

            <!-- Reply APIs -->
            <div class="bg-dark-800 rounded-lg border border-dark-500 p-4">
              <h3 class="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span class="text-code-cyan">Reply</span>
              </h3>
              <ul class="space-y-2 text-sm text-text-secondary">
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.code(statusCode)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.status(statusCode)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.header(key, value)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.headers(obj)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.type(contentType)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.send(payload)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.redirect(url)</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.sent</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.statusCode</code>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-code-green">✓</span>
                  <code>reply.getHeaders()</code>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Logger -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📝</span>
            Logging
          </h2>
          <p class="text-text-secondary mb-4">
            The compatibility layer provides a Fastify-compatible logger:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm">adapter.<span class="text-code-cyan">useFastifyHook</span>(<span class="text-code-yellow">'onRequest'</span>, <span class="text-code-pink">async</span> (request, reply) => {{ '{' }}
  request.log.<span class="text-code-cyan">info</span>(<span class="text-code-yellow">'Request received'</span>);
  request.log.<span class="text-code-cyan">debug</span>({{ '{' }} headers: request.headers {{ '}' }}, <span class="text-code-yellow">'Request headers'</span>);
  request.log.<span class="text-code-cyan">warn</span>(<span class="text-code-yellow">'Something might be wrong'</span>);
  request.log.<span class="text-code-cyan">error</span>({{ '{' }} err: error {{ '}' }}, <span class="text-code-yellow">'An error occurred'</span>);
{{ '}' }});</code></pre>
          </div>
        </section>

        <!-- wrapFastifyHook -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🔧</span>
            Manual Hook Wrapping
          </h2>
          <p class="text-text-secondary mb-4">
            For advanced use cases, use the <code>wrapFastifyHook</code> function directly:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> {{ '{' }} wrapFastifyHook {{ '}' }} <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;

<span class="text-code-pink">const</span> myHook = <span class="text-code-pink">async</span> (request, reply) => {{ '{' }}
  <span class="text-text-muted">// Your hook logic</span>
{{ '}' }};

<span class="text-code-pink">const</span> wrappedHook = <span class="text-code-cyan">wrapFastifyHook</span>(<span class="text-code-yellow">'preHandler'</span>, myHook);

<span class="text-text-muted">// Use with the adapter</span>
adapter.<span class="text-code-cyan">use</span>(wrappedHook);</code></pre>
          </div>
        </section>

        <!-- Differences -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚠️</span>
            Differences from Native Fastify
          </h2>
          <ul class="space-y-3 text-text-secondary">
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Schema-based validation is not included; use NestJS pipes instead</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Fastify's encapsulation context is simplified</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Serializers and content-type parsers work differently</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-yellow mt-1">!</span>
              <span>Some advanced plugin patterns may require adaptation</span>
            </li>
          </ul>
        </section>

        <!-- Next -->
        <section class="p-6 bg-dark-800 rounded-xl border border-dark-500">
          <h2 class="text-xl font-semibold text-text-primary mb-4">See Also</h2>
          <div class="flex flex-wrap gap-4">
            <a
              routerLink="/express-compat"
              class="inline-flex items-center gap-2 px-4 py-2 bg-nest-red hover:bg-nest-red-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>Express Compatibility</span>
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
export class FastifyCompat {}
