import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="topbar">
      <a class="brand" routerLink="/albums">📷 シェアルバム</a>
      @if (auth.isLoggedIn()) {
        <div class="right">
          <span class="user">{{ auth.user()?.displayName }}</span>
          <button (click)="logout()">ログアウト</button>
        </div>
      }
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .topbar { display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--surface); }
    .brand { font-weight: 800; text-decoration: none; color: inherit; font-size: 16px; }
    .right { display: flex; align-items: center; gap: 12px; }
    .user { color: var(--muted); font-size: 14px; }
    .right button { padding: 7px 13px; border: 1px solid var(--border); background: transparent;
      border-radius: 9px; cursor: pointer; }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService) {}
  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }
}
