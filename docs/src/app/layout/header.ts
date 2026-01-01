import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="h-16 bg-dark-800/80 backdrop-blur-xl border-b border-dark-500 sticky top-0 z-50 flex items-center px-6 gap-4">
      <!-- Mobile menu button -->
      <button
        (click)="toggleSidebar.emit()"
        class="lg:hidden p-2 rounded-lg hover:bg-dark-600 text-text-secondary hover:text-text-primary transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Page title -->
      <h1 class="text-lg font-semibold text-text-primary">{{ title() }}</h1>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Search (placeholder) -->
      <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg border border-dark-500 text-text-muted w-64">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span class="text-sm">Search docs...</span>
        <kbd class="ml-auto text-xs bg-dark-600 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      <!-- Links -->
      <nav class="hidden sm:flex items-center gap-4">
        <a
          href="https://www.npmjs.com/package/@pegasusheavy/nestjs-platform-deno"
          target="_blank"
          rel="noopener"
          class="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
          </svg>
        </a>
        <a
          href="https://github.com/pegasusheavy/nestjs-deno"
          target="_blank"
          rel="noopener"
          class="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </nav>
    </header>
  `,
})
export class Header {
  title = input<string>('Documentation');
  toggleSidebar = output<void>();
}
