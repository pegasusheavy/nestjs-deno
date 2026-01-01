import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)]">
      <!-- Hero Section -->
      <section class="relative overflow-hidden py-20 lg:py-32">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-40 -right-40 w-96 h-96 bg-nest-red/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-nest-red/5 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-nest-red/5 to-transparent"></div>
        </div>

        <div class="relative max-w-6xl mx-auto px-6">
          <div class="text-center">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700 border border-dark-500 mb-8 animate-fade-in">
              <span class="w-2 h-2 bg-code-green rounded-full animate-pulse"></span>
              <span class="text-sm text-text-secondary">v0.1.0 now available</span>
            </div>

            <!-- Main heading -->
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in stagger-1">
              <span class="text-text-primary">NestJS on </span>
              <span class="gradient-text glow-text">Deno</span>
            </h1>

            <p class="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 animate-fade-in stagger-2 text-balance">
              A high-performance HTTP adapter for NestJS using Deno's native server.
              Blazing fast, TypeScript-first, and fully compatible with Express & Fastify middleware.
            </p>

            <!-- CTA buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
              <a
                routerLink="/getting-started"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-nest-red hover:bg-nest-red-dark text-white font-semibold rounded-xl transition-all duration-200 glow-red hover:scale-105"
              >
                <span>Get Started</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
              <a
                href="https://github.com/pegasusheavy/nestjs-deno"
                target="_blank"
                rel="noopener"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-700 hover:bg-dark-600 text-text-primary font-semibold rounded-xl border border-dark-500 hover:border-dark-400 transition-all duration-200"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>View on GitHub</span>
              </a>
            </div>
          </div>

          <!-- Code preview -->
          <div class="mt-16 animate-fade-in stagger-4">
            <div class="relative max-w-3xl mx-auto">
              <div class="absolute -inset-1 bg-gradient-to-r from-nest-red via-code-pink to-code-purple rounded-2xl blur opacity-20"></div>
              <div class="relative bg-dark-800 rounded-xl border border-dark-500 overflow-hidden">
                <div class="flex items-center gap-2 px-4 py-3 bg-dark-700 border-b border-dark-500">
                  <div class="w-3 h-3 rounded-full bg-nest-red"></div>
                  <div class="w-3 h-3 rounded-full bg-code-yellow"></div>
                  <div class="w-3 h-3 rounded-full bg-code-green"></div>
                  <span class="ml-4 text-sm text-text-muted">main.ts</span>
                </div>
                <pre class="p-6 overflow-x-auto !bg-transparent !border-0"><code class="text-sm"><span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} NestFactory {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;nestjs/core'</span>;
<span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} DenoAdapter {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'&#64;pegasusheavy/nestjs-platform-deno'</span>;
<span class="text-code-pink">import</span> <span class="text-text-primary">{{ '{' }} AppModule {{ '}' }}</span> <span class="text-code-pink">from</span> <span class="text-code-yellow">'./app.module'</span>;

<span class="text-code-pink">async function</span> <span class="text-code-cyan">bootstrap</span>() {{ '{' }}
  <span class="text-code-pink">const</span> app = <span class="text-code-pink">await</span> NestFactory.<span class="text-code-cyan">create</span>(
    AppModule,
    <span class="text-code-pink">new</span> <span class="text-code-green">DenoAdapter</span>()
  );

  <span class="text-code-pink">await</span> app.<span class="text-code-cyan">listen</span>(<span class="text-code-orange">3000</span>);
  console.<span class="text-code-cyan">log</span>(<span class="text-code-yellow">'🦕 Running on Deno!'</span>);
{{ '}' }}

<span class="text-code-cyan">bootstrap</span>();</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 border-t border-dark-500">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">
            Why NestJS + Deno?
          </h2>
          <p class="text-text-secondary text-center max-w-2xl mx-auto mb-16">
            Combine the power of NestJS's enterprise-grade architecture with Deno's modern runtime for unmatched performance and developer experience.
          </p>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (feature of features; track feature.title) {
              <div class="group p-6 bg-dark-800 rounded-xl border border-dark-500 hover:border-nest-red/50 transition-all duration-300 hover:-translate-y-1">
                <div class="w-12 h-12 bg-nest-red/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-nest-red/20 transition-colors">
                  <span class="text-2xl">{{ feature.icon }}</span>
                </div>
                <h3 class="text-lg font-semibold text-text-primary mb-2">{{ feature.title }}</h3>
                <p class="text-text-secondary text-sm leading-relaxed">{{ feature.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Performance Section -->
      <section class="py-20 border-t border-dark-500 bg-dark-800/50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold mb-6">
                <span class="gradient-text">Blazing Fast</span> Performance
              </h2>
              <p class="text-text-secondary mb-8 leading-relaxed">
                The Deno adapter leverages Deno's native HTTP server for exceptional performance.
                In benchmarks, it consistently outperforms Express and matches Fastify's speed while
                providing a simpler, more secure runtime.
              </p>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div class="h-full bg-nest-red rounded-full" style="width: 100%"></div>
                  </div>
                  <span class="text-sm text-text-secondary w-24">Deno</span>
                  <span class="text-sm font-mono text-nest-red">~45k req/s</span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div class="h-full bg-code-purple rounded-full" style="width: 92%"></div>
                  </div>
                  <span class="text-sm text-text-secondary w-24">Fastify</span>
                  <span class="text-sm font-mono text-code-purple">~41k req/s</span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                    <div class="h-full bg-code-cyan rounded-full" style="width: 45%"></div>
                  </div>
                  <span class="text-sm text-text-secondary w-24">Express</span>
                  <span class="text-sm font-mono text-code-cyan">~20k req/s</span>
                </div>
              </div>
            </div>
            <div class="bg-dark-700 rounded-xl p-8 border border-dark-500">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center p-4">
                  <div class="text-4xl font-bold gradient-text mb-2">2x</div>
                  <div class="text-sm text-text-muted">Faster than Express</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold gradient-text mb-2">0</div>
                  <div class="text-sm text-text-muted">node_modules bloat</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold gradient-text mb-2">100%</div>
                  <div class="text-sm text-text-muted">TypeScript native</div>
                </div>
                <div class="text-center p-4">
                  <div class="text-4xl font-bold gradient-text mb-2">✓</div>
                  <div class="text-sm text-text-muted">Secure by default</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 border-t border-dark-500">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p class="text-text-secondary mb-8 max-w-2xl mx-auto">
            Start building your next NestJS application with the power of Deno.
            Full compatibility with existing NestJS code and middleware.
          </p>
          <a
            routerLink="/installation"
            class="inline-flex items-center gap-2 px-8 py-4 bg-nest-red hover:bg-nest-red-dark text-white font-semibold rounded-xl transition-all duration-200 glow-red hover:scale-105"
          >
            <span>Read the Docs</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-8 border-t border-dark-500">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm text-text-muted">
            © 2026 Pegasus Heavy Industries LLC. MIT License.
          </div>
          <div class="flex items-center gap-6">
            <a href="https://github.com/pegasusheavy/nestjs-deno" target="_blank" rel="noopener" class="text-text-muted hover:text-text-primary transition-colors text-sm">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@pegasusheavy/nestjs-platform-deno" target="_blank" rel="noopener" class="text-text-muted hover:text-text-primary transition-colors text-sm">
              npm
            </a>
            <a href="https://www.patreon.com/c/PegasusHeavyIndustries" target="_blank" rel="noopener" class="text-text-muted hover:text-text-primary transition-colors text-sm">
              Sponsor
            </a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class Home {
  protected readonly features = [
    {
      icon: '⚡',
      title: 'Native Performance',
      description: 'Uses Deno.serve() for maximum throughput with minimal overhead. No middleware layers between you and raw performance.',
    },
    {
      icon: '🔒',
      title: 'Secure by Default',
      description: 'Deno\'s permission-based security model keeps your application safe. No unexpected file system or network access.',
    },
    {
      icon: '📦',
      title: 'Zero Config',
      description: 'Drop-in replacement for Express or Fastify adapters. Works with your existing NestJS modules and controllers.',
    },
    {
      icon: '🔌',
      title: 'Middleware Compatible',
      description: 'Use your existing Express and Fastify middleware through compatibility layers. No rewrites needed.',
    },
    {
      icon: '🦕',
      title: 'TypeScript Native',
      description: 'Deno runs TypeScript natively. No compilation step, no tsconfig gymnastics, just write and run.',
    },
    {
      icon: '🚀',
      title: 'Modern Runtime',
      description: 'Web-standard APIs, top-level await, and ES modules. The future of JavaScript runtime is here.',
    },
  ];
}
