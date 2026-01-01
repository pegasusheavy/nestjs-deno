import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar';
import { Header } from './header';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Header],
  template: `
    <div class="flex min-h-screen bg-dark-900">
      <!-- Sidebar - Desktop -->
      <div class="hidden lg:block">
        <app-sidebar />
      </div>

      <!-- Mobile sidebar overlay -->
      @if (sidebarOpen()) {
        <div class="lg:hidden fixed inset-0 z-50">
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            (click)="sidebarOpen.set(false)"
          ></div>
          <div class="absolute left-0 top-0 h-full animate-slide-in-left">
            <app-sidebar />
          </div>
        </div>
      }

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <app-header (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Layout {
  protected readonly sidebarOpen = signal(false);
}
