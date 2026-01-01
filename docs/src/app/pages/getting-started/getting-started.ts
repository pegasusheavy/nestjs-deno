import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-getting-started',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">Quick Start</h1>
          <p class="text-xl text-text-secondary">
            Create your first NestJS application running on Deno in under 5 minutes.
          </p>
        </header>

        <!-- Step 1: Create App -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="w-8 h-8 bg-nest-red rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Create a New NestJS Project
          </h2>
          <p class="text-text-secondary mb-4">
            Start by creating a new NestJS project using the CLI:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-4">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">Terminal</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-green">npx &#64;nestjs/cli new my-deno-app</span>
<span class="text-code-green">cd my-deno-app</span></code></pre>
          </div>
        </section>

        <!-- Step 2: Install Adapter -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="w-8 h-8 bg-nest-red rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Install the Deno Adapter
          </h2>
          <p class="text-text-secondary mb-4">
            Add the Deno platform adapter to your project:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-4">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">Terminal</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm text-code-green">pnpm add &#64;pegasusheavy/nestjs-platform-deno</code></pre>
          </div>
        </section>

        <!-- Step 3: Update main.ts -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="w-8 h-8 bg-nest-red rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Update Your Bootstrap Code
          </h2>
          <p class="text-text-secondary mb-4">
            Replace the default Express adapter with the Deno adapter in <code>src/main.ts</code>:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-4">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">src/main.ts</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} NestFactory {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;nestjs/core'</span>;
<span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} DenoAdapter {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;
<span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} AppModule {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'./app.module'</span>;

<span class="text-code-pink">async function</span> <span class="text-code-cyan">bootstrap</span>() {{ '{' }}
  <span class="text-text-muted">// Create the application with the Deno adapter</span>
  <span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(
    AppModule,
    <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>()
  );

  <span class="text-text-muted">// Enable CORS if needed</span>
  app.<span class="text-code-cyan">enableCors</span>();

  <span class="text-text-muted">// Start the server</span>
  <span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">3000</span>);

  console.<span class="text-code-cyan">log</span>(<span class="text-code-yellow">\`🦕 Application running on: \${{ '{' }}await app.getUrl(){{ '}' }}\`</span>);
{{ '}' }}

<span class="text-code-cyan">bootstrap</span>();</code></pre>
          </div>
        </section>

        <!-- Step 4: Configure Deno -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="w-8 h-8 bg-nest-red rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Create Deno Configuration
          </h2>
          <p class="text-text-secondary mb-4">
            Create a <code>deno.json</code> file in your project root:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-4">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">deno.json</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm">{{ '{' }}
  <span class="text-code-cyan">"compilerOptions"</span>: {{ '{' }}
    <span class="text-code-yellow">"experimentalDecorators"</span>: <span class="text-code-orange">true</span>,
    <span class="text-code-yellow">"emitDecoratorMetadata"</span>: <span class="text-code-orange">true</span>
  {{ '}' }},
  <span class="text-code-cyan">"nodeModulesDir"</span>: <span class="text-code-orange">true</span>,
  <span class="text-code-cyan">"tasks"</span>: {{ '{' }}
    <span class="text-code-yellow">"dev"</span>: <span class="text-code-green">"deno run -A --watch src/main.ts"</span>,
    <span class="text-code-yellow">"start"</span>: <span class="text-code-green">"deno run --allow-net --allow-read --allow-env src/main.ts"</span>
  {{ '}' }}
{{ '}' }}</code></pre>
          </div>
        </section>

        <!-- Step 5: Run -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="w-8 h-8 bg-nest-red rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Run Your Application
          </h2>
          <p class="text-text-secondary mb-4">
            Start your application with Deno:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden mb-4">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">Terminal</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-green">deno task dev</span></code></pre>
          </div>
          <p class="text-text-secondary">
            Visit <code>http://localhost:3000</code> to see your application running on Deno! 🦕
          </p>
        </section>

        <!-- Adding Features -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-6 flex items-center gap-3">
            <span class="text-nest-red">🔧</span>
            Common Configurations
          </h2>

          <!-- CORS -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-text-primary mb-3">Enabling CORS</h3>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-text-muted">// Enable CORS with default options</span>
app.<span class="text-code-cyan">enableCors</span>();

<span class="text-text-muted">// Or with custom configuration</span>
app.<span class="text-code-cyan">enableCors</span>({{ '{' }}
  origin: <span class="text-code-yellow">'https://example.com'</span>,
  methods: [<span class="text-code-yellow">'GET'</span>, <span class="text-code-yellow">'POST'</span>, <span class="text-code-yellow">'PUT'</span>, <span class="text-code-yellow">'DELETE'</span>],
  credentials: <span class="text-code-orange">true</span>,
{{ '}' }});</code></pre>
            </div>
          </div>

          <!-- Static Files -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-text-primary mb-3">Serving Static Files</h3>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-code-pink">const</span> adapter = <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>();

adapter.<span class="text-code-cyan">useStaticAssets</span>(<span class="text-code-yellow">'./public'</span>, {{ '{' }}
  prefix: <span class="text-code-yellow">'/static'</span>,
  maxAge: <span class="text-code-orange">86400</span>, <span class="text-text-muted">// 1 day cache</span>
  etag: <span class="text-code-orange">true</span>,
{{ '}' }});</code></pre>
            </div>
          </div>

          <!-- Global Prefix -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-text-primary mb-3">API Prefix</h3>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-text-muted">// Add a global prefix to all routes</span>
app.<span class="text-code-cyan">setGlobalPrefix</span>(<span class="text-code-yellow">'api/v1'</span>);

<span class="text-text-muted">// Routes will be: /api/v1/users, /api/v1/products, etc.</span></code></pre>
            </div>
          </div>
        </section>

        <!-- Next steps -->
        <section class="p-6 bg-dark-800 rounded-xl border border-dark-500">
          <h2 class="text-xl font-semibold text-text-primary mb-4">What's Next?</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <a
              routerLink="/api"
              class="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-500 hover:border-nest-red/50 transition-all group"
            >
              <h3 class="font-semibold text-text-primary mb-1 group-hover:text-nest-red transition-colors">API Reference</h3>
              <p class="text-sm text-text-muted">Explore the complete API documentation</p>
            </a>
            <a
              routerLink="/express-compat"
              class="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-500 hover:border-nest-red/50 transition-all group"
            >
              <h3 class="font-semibold text-text-primary mb-1 group-hover:text-nest-red transition-colors">Express Middleware</h3>
              <p class="text-sm text-text-muted">Use existing Express middleware</p>
            </a>
            <a
              routerLink="/fastify-compat"
              class="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-500 hover:border-nest-red/50 transition-all group"
            >
              <h3 class="font-semibold text-text-primary mb-1 group-hover:text-nest-red transition-colors">Fastify Plugins</h3>
              <p class="text-sm text-text-muted">Integrate Fastify hooks and plugins</p>
            </a>
            <a
              href="https://github.com/pegasusheavy/nestjs-deno/tree/main/examples"
              target="_blank"
              rel="noopener"
              class="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg border border-dark-500 hover:border-nest-red/50 transition-all group"
            >
              <h3 class="font-semibold text-text-primary mb-1 group-hover:text-nest-red transition-colors">Examples</h3>
              <p class="text-sm text-text-muted">See real-world usage examples</p>
            </a>
          </div>
        </section>
      </article>
    </div>
  `,
})
export class GettingStarted {}
