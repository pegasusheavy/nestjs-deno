import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-introduction',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">Introduction</h1>
          <p class="text-xl text-text-secondary">
            A high-performance HTTP adapter for NestJS that leverages Deno's native server capabilities.
          </p>
        </header>

        <!-- What is it -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📖</span>
            What is nestjs-platform-deno?
          </h2>
          <p class="text-text-secondary leading-relaxed mb-4">
            <code>&#64;pegasusheavy/nestjs-platform-deno</code> is a platform adapter that allows you to run your NestJS
            applications on the Deno runtime using <code>Deno.serve()</code> as the underlying HTTP server.
          </p>
          <p class="text-text-secondary leading-relaxed mb-4">
            Just like <code>&#64;nestjs/platform-express</code> and <code>&#64;nestjs/platform-fastify</code>, this adapter
            integrates seamlessly with NestJS's core functionality while providing the performance and security benefits
            of the Deno runtime.
          </p>
        </section>

        <!-- Why Deno -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🦕</span>
            Why Deno?
          </h2>
          <div class="grid gap-4 mb-6">
            <div class="p-4 bg-dark-800 rounded-lg border border-dark-500">
              <h3 class="font-semibold text-text-primary mb-2">Native TypeScript Support</h3>
              <p class="text-text-secondary text-sm">
                Deno runs TypeScript out of the box. No need for ts-node, tsx, or complex build configurations.
              </p>
            </div>
            <div class="p-4 bg-dark-800 rounded-lg border border-dark-500">
              <h3 class="font-semibold text-text-primary mb-2">Security First</h3>
              <p class="text-text-secondary text-sm">
                Deno's permission-based security model requires explicit access grants for file system, network, and environment variables.
              </p>
            </div>
            <div class="p-4 bg-dark-800 rounded-lg border border-dark-500">
              <h3 class="font-semibold text-text-primary mb-2">Web Standard APIs</h3>
              <p class="text-text-secondary text-sm">
                Uses fetch, Request, Response, and other web platform APIs you already know from browser development.
              </p>
            </div>
            <div class="p-4 bg-dark-800 rounded-lg border border-dark-500">
              <h3 class="font-semibold text-text-primary mb-2">High Performance</h3>
              <p class="text-text-secondary text-sm">
                Built on Rust and V8, Deno's native HTTP server delivers exceptional throughput with minimal overhead.
              </p>
            </div>
          </div>
        </section>

        <!-- Features -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">✨</span>
            Features
          </h2>
          <ul class="space-y-3 text-text-secondary">
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Full NestJS compatibility - controllers, providers, modules, guards, interceptors, pipes, and more</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Express middleware compatibility through the Express compatibility layer</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Fastify hooks and plugins support through the Fastify compatibility layer</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Built-in CORS support with flexible configuration options</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Static file serving with ETags, cache control, and MIME type detection</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>Automatic body parsing for JSON, form data, and multipart uploads</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">✓</span>
              <span>View engine support for server-side rendering</span>
            </li>
          </ul>
        </section>

        <!-- Comparison -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚖️</span>
            Comparison with Other Adapters
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dark-500">
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Feature</th>
                  <th class="text-center py-3 px-4 text-nest-red font-medium">Deno</th>
                  <th class="text-center py-3 px-4 text-text-muted font-medium">Express</th>
                  <th class="text-center py-3 px-4 text-text-muted font-medium">Fastify</th>
                </tr>
              </thead>
              <tbody class="text-text-secondary">
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4">Native TypeScript</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                  <td class="text-center py-3 px-4 text-code-orange">~</td>
                  <td class="text-center py-3 px-4 text-code-orange">~</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4">Permission Security</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                  <td class="text-center py-3 px-4 text-nest-red">✗</td>
                  <td class="text-center py-3 px-4 text-nest-red">✗</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4">Web Standard APIs</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                  <td class="text-center py-3 px-4 text-nest-red">✗</td>
                  <td class="text-center py-3 px-4 text-nest-red">✗</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4">High Performance</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                  <td class="text-center py-3 px-4 text-code-orange">~</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4">Middleware Ecosystem</td>
                  <td class="text-center py-3 px-4 text-code-green">✓*</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                  <td class="text-center py-3 px-4 text-code-green">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-text-muted mt-3">* Through compatibility layers</p>
        </section>

        <!-- Next steps -->
        <section class="p-6 bg-dark-800 rounded-xl border border-dark-500">
          <h2 class="text-xl font-semibold text-text-primary mb-4">Next Steps</h2>
          <div class="flex flex-wrap gap-4">
            <a
              routerLink="/installation"
              class="inline-flex items-center gap-2 px-4 py-2 bg-nest-red hover:bg-nest-red-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>Installation Guide</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
            <a
              routerLink="/getting-started"
              class="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-text-primary text-sm font-medium rounded-lg border border-dark-500 transition-colors"
            >
              <span>Quick Start</span>
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
export class Introduction {}
