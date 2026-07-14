// SC-3 アルバム詳細（FR-2 編集 / FR-3 削除 / FR-4 アップロード / FR-5 整理）
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../core/album.service';
import { Album, Photo } from '../../core/models';
import { assetUrl } from '../../core/config';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (album(); as a) {
      <div class="page">
        <button class="back" (click)="router.navigate(['/albums'])">← 一覧へ</button>

        <header class="head">
          <div>
            @if (editing()) {
              <input class="title-edit" [(ngModel)]="editName" />
              <input type="date" [(ngModel)]="editDate" />
            } @else {
              <h1>{{ a.name }}</h1>
              <span class="sub">{{ a.eventDate || '日付未設定' }} ・ {{ photos().length }}枚</span>
            }
          </div>
          <div class="head-actions">
            @if (editing()) {
              <button (click)="cancelEdit()">キャンセル</button>
              <button class="primary" (click)="saveEdit()">保存</button>
            } @else {
              <button (click)="startEdit()">編集</button>
              <button class="danger" (click)="removeAlbum()">削除</button>
            }
          </div>
        </header>

        @if (a.description && !editing()) { <p class="desc">{{ a.description }}</p> }

        <div class="upload-row">
          <label class="upload-btn">
            ＋ 写真を追加
            <input type="file" multiple accept="image/*" (change)="onFiles($event)" hidden />
          </label>
          @if (uploading()) { <span class="muted">アップロード中…</span> }
          @if (uploadError()) { <span class="error">{{ uploadError() }}</span> }
        </div>

        @if (photos().length === 0) {
          <div class="empty">写真がまだありません。「写真を追加」から取り込みましょう。</div>
        } @else {
          <div class="grid">
            @for (p of photos(); track p.id) {
              <figure class="photo" [class.cover]="p.isCover">
                <img [src]="url(p)" [alt]="p.originalName" loading="lazy" />
                @if (p.isCover) { <span class="badge">カバー</span> }
                <div class="ptools">
                  <button title="カバーに設定" (click)="setCover(p)">★</button>
                  <button title="削除" (click)="deletePhoto(p)">🗑</button>
                </div>
              </figure>
            }
          </div>
        }
      </div>
    } @else if (loading()) {
      <p class="muted center">読み込み中…</p>
    } @else {
      <p class="muted center">アルバムが見つかりません。</p>
    }
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; padding: 20px 16px; }
    .back { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 14px; padding: 4px 0; }
    .head { display: flex; align-items: flex-start; justify-content: space-between; margin: 8px 0 4px; gap: 12px; }
    h1 { margin: 0; font-size: 22px; }
    .sub { color: var(--muted); font-size: 13px; }
    .desc { color: var(--muted); margin: 4px 0 12px; }
    .title-edit { font-size: 20px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; margin-right: 8px; }
    input[type=date] { padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; }
    .head-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .head-actions button { padding: 8px 14px; border-radius: 9px; border: 1px solid var(--border);
      background: transparent; cursor: pointer; }
    .primary { background: var(--accent); color: #fff; border: none !important; font-weight: 700; }
    .danger { color: #c0392b; border-color: #e5b3ad !important; }
    .upload-row { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .upload-btn { background: var(--accent); color: #fff; padding: 9px 16px; border-radius: 10px;
      font-weight: 700; cursor: pointer; display: inline-block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    .photo { position: relative; margin: 0; border-radius: 12px; overflow: hidden; aspect-ratio: 1;
      background: #eef0f4; border: 2px solid transparent; }
    .photo.cover { border-color: var(--accent); }
    .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .badge { position: absolute; top: 6px; left: 6px; background: var(--accent); color: #fff;
      font-size: 11px; padding: 2px 7px; border-radius: 20px; }
    .ptools { position: absolute; bottom: 6px; right: 6px; display: flex; gap: 6px; opacity: 0; transition: opacity .1s; }
    .photo:hover .ptools { opacity: 1; }
    .ptools button { border: none; background: rgba(0,0,0,.6); color: #fff; width: 30px; height: 30px;
      border-radius: 8px; cursor: pointer; font-size: 14px; }
    .empty { text-align: center; color: var(--muted); padding: 50px 0; }
    .muted { color: var(--muted); } .center { text-align: center; padding: 40px; }
    .error { color: #c0392b; font-size: 13px; }
  `],
})
export class AlbumDetailComponent implements OnInit {
  album = signal<Album | null>(null);
  photos = signal<Photo[]>([]);
  loading = signal(true);
  editing = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  editName = '';
  editDate = '';
  private id!: number;

  constructor(private route: ActivatedRoute, public router: Router, private albumSvc: AlbumService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.albumSvc.getAlbum(this.id).subscribe({
      next: (a) => { this.album.set(a); this.loading.set(false); this.loadPhotos(); },
      error: () => this.loading.set(false),
    });
  }

  private loadPhotos(): void {
    this.albumSvc.listPhotos(this.id).subscribe((p) => this.photos.set(p));
  }

  url(p: Photo): string {
    return assetUrl(p.url)!;
  }

  onFiles(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.uploadError.set(null);
    this.uploading.set(true);
    this.albumSvc.uploadPhotos(this.id, input.files).subscribe({
      next: () => { this.uploading.set(false); input.value = ''; this.loadPhotos(); this.refreshAlbum(); },
      error: (e) => {
        this.uploading.set(false);
        this.uploadError.set(e?.error?.error?.message || 'アップロードに失敗しました');
      },
    });
  }

  setCover(p: Photo): void {
    this.albumSvc.setCover(p.id).subscribe(() => { this.loadPhotos(); this.refreshAlbum(); });
  }

  deletePhoto(p: Photo): void {
    if (!confirm('この写真を削除しますか？')) return;
    this.albumSvc.deletePhoto(p.id).subscribe(() => { this.loadPhotos(); this.refreshAlbum(); });
  }

  startEdit(): void {
    const a = this.album()!;
    this.editName = a.name;
    this.editDate = a.eventDate || '';
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    if (!this.editName.trim()) return;
    this.albumSvc
      .updateAlbum(this.id, { name: this.editName.trim(), eventDate: this.editDate || null })
      .subscribe((a) => { this.album.set(a); this.editing.set(false); });
  }

  removeAlbum(): void {
    if (!confirm('このアルバムと配下の写真をすべて削除します。よろしいですか？')) return;
    this.albumSvc.deleteAlbum(this.id).subscribe(() => this.router.navigate(['/albums']));
  }

  private refreshAlbum(): void {
    this.albumSvc.getAlbum(this.id).subscribe((a) => this.album.set(a));
  }
}
