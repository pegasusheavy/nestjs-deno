import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-72 bg-dark-800 border-r border-dark-500 h-screen sticky top-0 flex flex-col overflow-hidden">
      <!-- Logo -->
      <div class="p-6 border-b border-dark-500">
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-nest-red rounded-lg flex items-center justify-center glow-red group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <span class="text-lg font-bold text-text-primary">NestJS Deno</span>
            <span class="block text-xs text-text-muted">Platform Adapter</span>
          </div>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        @for (section of navigation(); track section.title) {
          <div class="animate-fade-in" [style.animation-delay]="$index * 0.1 + 's'">
            <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
              {{ section.title }}
            </h3>
            <ul class="space-y-1">
              @for (item of section.items; track item.path) {
                <li>
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="bg-nest-red/10 text-nest-red border-nest-red"
                    [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-600 transition-all duration-200 border-l-2 border-transparent"
                  >
                    @if (item.icon) {
                      <span class="text-lg">{{ item.icon }}</span>
                    }
                    <span class="text-sm font-medium">{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-dark-500">
        <a
          href="https://github.com/pegasusheavy/nestjs-deno"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-dark-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span class="text-sm font-medium">GitHub</span>
          <svg class="w-4 h-4 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
        <div class="mt-3 px-3 text-xs text-text-muted">
          v0.1.0 · MIT License
        </div>
      </div>
    </aside>
  `,
})
export class Sidebar {
  protected readonly navigation = signal<NavSection[]>([
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', path: '/introduction', icon: '📖' },
        { label: 'Installation', path: '/installation', icon: '📦' },
        { label: 'Quick Start', path: '/getting-started', icon: '🚀' },
      ],
    },
    {
      title: 'Core',
      items: [
        { label: 'API Reference', path: '/api', icon: '📚' },
      ],
    },
    {
      title: 'Compatibility',
      items: [
        { label: 'Express Middleware', path: '/express-compat', icon: '⚡' },
        { label: 'Fastify Plugins', path: '/fastify-compat', icon: '🔌' },
      ],
    },
  ]);
}
