import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-installation',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <article class="prose prose-invert max-w-none">
        <!-- Header -->
        <header class="mb-12 pb-8 border-b border-dark-500">
          <h1 class="text-4xl font-bold text-text-primary mb-4">Installation</h1>
          <p class="text-xl text-text-secondary">
            Get up and running with the NestJS Deno adapter in minutes.
          </p>
        </header>

        <!-- Prerequisites -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📋</span>
            Prerequisites
          </h2>
          <ul class="space-y-3 text-text-secondary mb-6">
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">•</span>
              <span>Node.js 18.0.0 or higher (for NestJS CLI and npm packages)</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">•</span>
              <span>Deno 1.40 or higher (for runtime)</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-code-green mt-1">•</span>
              <span>NestJS 10.0.0 or 11.0.0</span>
            </li>
          </ul>

          <div class="p-4 bg-dark-800 rounded-lg border-l-4 border-nest-red">
            <p class="text-sm text-text-secondary">
              <strong class="text-text-primary">Note:</strong> While the adapter targets Deno,
              you'll still use npm/pnpm/yarn for package management as NestJS relies on the Node.js ecosystem.
            </p>
          </div>
        </section>

        <!-- Package Installation -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">📦</span>
            Install the Package
          </h2>
          <p class="text-text-secondary mb-6">
            Install the adapter using your preferred package manager:
          </p>

          <!-- npm -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-text-muted">npm</span>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
                <span class="text-xs text-text-muted">Terminal</span>
                <button class="text-xs text-text-muted hover:text-text-primary transition-colors">Copy</button>
              </div>
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm text-code-green">npm install &#64;pegasusheavy/nestjs-platform-deno</code></pre>
            </div>
          </div>

          <!-- pnpm -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-text-muted">pnpm</span>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
                <span class="text-xs text-text-muted">Terminal</span>
                <button class="text-xs text-text-muted hover:text-text-primary transition-colors">Copy</button>
              </div>
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm text-code-green">pnpm add &#64;pegasusheavy/nestjs-platform-deno</code></pre>
            </div>
          </div>

          <!-- yarn -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-text-muted">yarn</span>
            </div>
            <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
                <span class="text-xs text-text-muted">Terminal</span>
                <button class="text-xs text-text-muted hover:text-text-primary transition-colors">Copy</button>
              </div>
              <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm text-code-green">yarn add &#64;pegasusheavy/nestjs-platform-deno</code></pre>
            </div>
          </div>
        </section>

        <!-- Peer Dependencies -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🔗</span>
            Peer Dependencies
          </h2>
          <p class="text-text-secondary mb-4">
            The adapter requires the following peer dependencies:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm"><span class="text-text-muted">// package.json</span>
{{ '{' }}
  <span class="text-code-cyan">"dependencies"</span>: {{ '{' }}
    <span class="text-code-yellow">"&#64;nestjs/common"</span>: <span class="text-code-green">"^10.0.0 || ^11.0.0"</span>,
    <span class="text-code-yellow">"&#64;nestjs/core"</span>: <span class="text-code-green">"^10.0.0 || ^11.0.0"</span>,
    <span class="text-code-yellow">"reflect-metadata"</span>: <span class="text-code-green">"^0.2.0"</span>,
    <span class="text-code-yellow">"rxjs"</span>: <span class="text-code-green">"^7.8.0"</span>
  {{ '}' }}
{{ '}' }}</code></pre>
          </div>
        </section>

        <!-- Deno Configuration -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">⚙️</span>
            Deno Configuration
          </h2>
          <p class="text-text-secondary mb-4">
            Create or update your <code>deno.json</code> to include the necessary configuration:
          </p>
          <div class="bg-dark-800 rounded-lg border border-dark-500 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2 bg-dark-700 border-b border-dark-500">
              <span class="text-xs text-text-muted">deno.json</span>
            </div>
            <pre class="p-4 !bg-transparent !border-0 !m-0"><code class="text-sm">{{ '{' }}
  <span class="text-code-cyan">"compilerOptions"</span>: {{ '{' }}
    <span class="text-code-yellow">"experimentalDecorators"</span>: <span class="text-code-orange">true</span>,
    <span class="text-code-yellow">"emitDecoratorMetadata"</span>: <span class="text-code-orange">true</span>,
    <span class="text-code-yellow">"strict"</span>: <span class="text-code-orange">true</span>
  {{ '}' }},
  <span class="text-code-cyan">"nodeModulesDir"</span>: <span class="text-code-orange">true</span>,
  <span class="text-code-cyan">"tasks"</span>: {{ '{' }}
    <span class="text-code-yellow">"dev"</span>: <span class="text-code-green">"deno run --allow-net --allow-read --allow-env src/main.ts"</span>,
    <span class="text-code-yellow">"start"</span>: <span class="text-code-green">"deno run --allow-net --allow-read --allow-env dist/main.js"</span>
  {{ '}' }}
{{ '}' }}</code></pre>
          </div>

          <div class="mt-4 p-4 bg-dark-800 rounded-lg border-l-4 border-code-yellow">
            <p class="text-sm text-text-secondary">
              <strong class="text-text-primary">Important:</strong> The <code>nodeModulesDir: true</code> setting
              tells Deno to use the node_modules directory for npm packages, which is required for NestJS to work correctly.
            </p>
          </div>
        </section>

        <!-- Permissions -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span class="text-nest-red">🔒</span>
            Required Permissions
          </h2>
          <p class="text-text-secondary mb-4">
            Deno requires explicit permissions for system access. Here are the minimum permissions needed:
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dark-500">
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Permission</th>
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Flag</th>
                  <th class="text-left py-3 px-4 text-text-muted font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody class="text-text-secondary">
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4 font-medium">Network</td>
                  <td class="py-3 px-4"><code class="text-code-green">--allow-net</code></td>
                  <td class="py-3 px-4">HTTP server and outbound requests</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4 font-medium">Read</td>
                  <td class="py-3 px-4"><code class="text-code-green">--allow-read</code></td>
                  <td class="py-3 px-4">Static files, configs, node_modules</td>
                </tr>
                <tr class="border-b border-dark-600">
                  <td class="py-3 px-4 font-medium">Environment</td>
                  <td class="py-3 px-4"><code class="text-code-green">--allow-env</code></td>
                  <td class="py-3 px-4">Access environment variables</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Next steps -->
        <section class="p-6 bg-dark-800 rounded-xl border border-dark-500">
          <h2 class="text-xl font-semibold text-text-primary mb-4">Next Steps</h2>
          <p class="text-text-secondary mb-4">
            Now that you have the adapter installed, let's create your first NestJS application with Deno.
          </p>
          <a
            routerLink="/getting-started"
            class="inline-flex items-center gap-2 px-4 py-2 bg-nest-red hover:bg-nest-red-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>Continue to Quick Start</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </section>
      </article>
    </div>
  `,
})
export class Installation {}
