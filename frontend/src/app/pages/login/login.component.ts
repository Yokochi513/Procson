// SC-1 ログイン/登録画面（FR-23）
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth-wrap">
      <div class="card">
        <h1 class="logo">📷 シェアルバム</h1>
        <p class="tagline">思い出を理想通りの形に残して、共有しよう</p>

        <div class="tabs">
          <button [class.active]="mode() === 'login'" (click)="mode.set('login')">ログイン</button>
          <button [class.active]="mode() === 'register'" (click)="mode.set('register')">新規登録</button>
        </div>

        <form (ngSubmit)="submit()">
          @if (mode() === 'register') {
            <label>表示名
              <input name="displayName" [(ngModel)]="displayName" placeholder="太郎" />
            </label>
          }
          <label>メールアドレス
            <input name="email" type="email" [(ngModel)]="email" placeholder="you@example.com" required />
          </label>
          <label>パスワード
            <input name="password" type="password" [(ngModel)]="password" placeholder="6文字以上" required />
          </label>

          @if (error()) { <p class="error">{{ error() }}</p> }

          <button class="primary" type="submit" [disabled]="loading()">
            {{ loading() ? '処理中…' : (mode() === 'login' ? 'ログイン' : '登録する') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
    .card { width: 360px; max-width: 92vw; background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px 28px; box-shadow: 0 8px 30px rgba(0,0,0,.06); }
    .logo { font-size: 26px; margin: 0 0 4px; text-align: center; }
    .tagline { text-align: center; color: var(--muted); font-size: 13px; margin: 0 0 20px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 18px; }
    .tabs button { flex: 1; padding: 9px; border: 1px solid var(--border); background: transparent;
      border-radius: 10px; cursor: pointer; color: var(--muted); font-weight: 600; }
    .tabs button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 12px; }
    input { width: 100%; box-sizing: border-box; margin-top: 5px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .primary { width: 100%; padding: 11px; margin-top: 6px; border: none; border-radius: 10px;
      background: var(--accent); color: #fff; font-weight: 700; cursor: pointer; }
    .primary:disabled { opacity: .6; cursor: default; }
    .error { color: #c0392b; font-size: 13px; margin: 4px 0 12px; }
  `],
})
export class LoginComponent {
  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  displayName = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error.set(null);
    this.loading.set(true);
    const done = () => this.loading.set(false);
    const ok = () => this.router.navigate(['/albums']);
    const fail = (e: any) => {
      done();
      this.error.set(e?.error?.error?.message || '処理に失敗しました');
    };

    if (this.mode() === 'login') {
      this.auth.login(this.email, this.password).subscribe({ next: () => { done(); ok(); }, error: fail });
    } else {
      this.auth.register(this.email, this.password, this.displayName).subscribe({ next: () => { done(); ok(); }, error: fail });
    }
  }
}
