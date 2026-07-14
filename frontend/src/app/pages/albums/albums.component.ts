// SC-2 アルバム一覧（FR-1 作成 / 一覧）
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlbumService } from '../../core/album.service';
import { Album } from '../../core/models';
import { assetUrl } from '../../core/config';

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <header class="head">
        <h1>アルバム</h1>
        <button class="primary" (click)="openCreate()">＋ 新しいアルバム</button>
      </header>

      @if (loading()) {
        <p class="muted">読み込み中…</p>
      } @else if (albums().length === 0) {
        <div class="empty">
          <p>まだアルバムがありません。</p>
          <button class="primary" (click)="openCreate()">最初のアルバムを作る</button>
        </div>
      } @else {
        <div class="grid">
          @for (a of albums(); track a.id) {
            <a class="card" [routerLink]="['/albums', a.id]">
              <div class="cover" [style.backgroundImage]="cover(a)">
                @if (!a.coverUrl) { <span class="ph">📷</span> }
              </div>
              <div class="meta">
                <strong>{{ a.name }}</strong>
                <span class="sub">{{ a.eventDate || '日付未設定' }} ・ {{ a.photoCount }}枚</span>
              </div>
            </a>
          }
        </div>
      }
    </div>

    @if (showCreate()) {
      <div class="overlay" (click)="showCreate.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>アルバムを作成</h2>
          <label>イベント名 *<input [(ngModel)]="name" placeholder="沖縄旅行 2026" /></label>
          <label>日付<input type="date" [(ngModel)]="eventDate" /></label>
          <label>説明<textarea [(ngModel)]="description" rows="3" placeholder="メモ（任意）"></textarea></label>
          @if (error()) { <p class="error">{{ error() }}</p> }
          <div class="actions">
            <button (click)="showCreate.set(false)">キャンセル</button>
            <button class="primary" (click)="create()" [disabled]="saving()">作成</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
    .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 22px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
    .card { text-decoration: none; color: inherit; border: 1px solid var(--border); border-radius: 14px;
      overflow: hidden; background: var(--surface); transition: transform .1s, box-shadow .1s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.08); }
    .cover { height: 130px; background-size: cover; background-position: center; background-color: #eef0f4;
      display: flex; align-items: center; justify-content: center; }
    .ph { font-size: 34px; opacity: .5; }
    .meta { padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; }
    .sub { color: var(--muted); font-size: 12px; }
    .empty { text-align: center; padding: 60px 0; color: var(--muted); }
    .empty .primary { margin-top: 12px; }
    .primary { background: var(--accent); color: #fff; border: none; border-radius: 10px;
      padding: 9px 16px; font-weight: 700; cursor: pointer; }
    .muted { color: var(--muted); }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex;
      align-items: center; justify-content: center; z-index: 20; }
    .modal { width: 400px; max-width: 92vw; background: var(--surface); border-radius: 14px; padding: 24px; }
    .modal h2 { margin: 0 0 16px; font-size: 18px; }
    label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 12px; }
    input, textarea { width: 100%; box-sizing: border-box; margin-top: 5px; padding: 9px 11px;
      border: 1px solid var(--border); border-radius: 9px; font-size: 14px; font-family: inherit; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
    .actions button { padding: 9px 16px; border-radius: 10px; border: 1px solid var(--border);
      background: transparent; cursor: pointer; }
    .actions .primary { border: none; }
    .error { color: #c0392b; font-size: 13px; }
  `],
})
export class AlbumsComponent implements OnInit {
  albums = signal<Album[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  name = '';
  eventDate = '';
  description = '';

  constructor(private albumSvc: AlbumService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.albumSvc.listAlbums().subscribe({
      next: (list) => { this.albums.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cover(a: Album): string {
    const u = assetUrl(a.coverUrl);
    return u ? `url("${u}")` : 'none';
  }

  openCreate(): void {
    this.name = '';
    this.eventDate = '';
    this.description = '';
    this.error.set(null);
    this.showCreate.set(true);
  }

  create(): void {
    if (!this.name.trim()) { this.error.set('イベント名は必須です'); return; }
    this.saving.set(true);
    this.albumSvc
      .createAlbum({ name: this.name.trim(), eventDate: this.eventDate || undefined, description: this.description || undefined })
      .subscribe({
        next: (album) => {
          this.saving.set(false);
          this.showCreate.set(false);
          this.albums.update((a) => [album, ...a]);
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(e?.error?.error?.message || '作成に失敗しました');
        },
      });
  }
}
