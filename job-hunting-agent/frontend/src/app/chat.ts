import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService, Profile } from './chat.service';
import { ProfileInput } from './profile-input';

// ChatComponent（設計書 2.3 / 4.2 SC-1）: 会話表示・入力欄・送信・ローディング/エラー表示
@Component({
  selector: 'app-chat',
  imports: [FormsModule, ProfileInput],
  template: `
    <div class="chat-page">
      <header class="chat-header">
        <h1>就活相談チャット</h1>
        <p>悩みや疑問を、いつでも気軽に相談してください。</p>
      </header>

      <app-profile-input [(profile)]="profile" />

      <div class="messages" #messagesArea>
        @if (messages().length === 0 && !loading()) {
          <p class="empty-hint">
            こんにちは！就活のこと、それ以外のことでも、なんでも話しかけてくださいね。
          </p>
        }
        @for (msg of messages(); track $index) {
          <div class="bubble-row" [class.user]="msg.role === 'user'">
            <div class="bubble" [class.user]="msg.role === 'user'">{{ msg.content }}</div>
          </div>
        }
        @if (loading()) {
          <div class="bubble-row">
            <div class="bubble loading-bubble">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        }
      </div>

      @if (error(); as err) {
        <div class="error-bar">
          <span>{{ err }}</span>
          @if (draft().trim()) {
            <button type="button" (click)="send()">再送信</button>
          }
        </div>
      }

      <form class="input-form" (ngSubmit)="send()">
        <textarea
          name="draft"
          rows="2"
          placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
          [ngModel]="draft()"
          (ngModelChange)="draft.set($event)"
          [disabled]="loading()"
          (keydown.enter)="onEnter($event)"
        ></textarea>
        <button type="submit" [disabled]="loading() || !canSend()">送信</button>
      </form>
      @if (tooLong()) {
        <p class="length-warning">
          メッセージは{{ maxLen }}文字以内で入力してください（現在 {{ draft().length }} 文字）。
        </p>
      }
    </div>
  `,
})
export class Chat implements OnInit, AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly messagesArea = viewChild<ElementRef<HTMLDivElement>>('messagesArea');

  readonly maxLen = 2000; // P-1（BE側でも検証）

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly draft = signal('');
  readonly profile = signal<Profile>({ grade: '', industry: '', situation: '' });

  private shouldScroll = false;

  ngOnInit(): void {
    // FR-6: 再アクセス時に過去会話を復元
    this.chatService.getHistory().subscribe({
      next: (res) => {
        this.messages.set(res.messages);
        this.shouldScroll = true;
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.extractMessage(err, '履歴の読み込みに失敗しました。ページを再読み込みしてください。'));
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      const el = this.messagesArea()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }

  tooLong(): boolean {
    return this.draft().length > this.maxLen;
  }

  canSend(): boolean {
    return this.draft().trim().length > 0 && !this.tooLong();
  }

  onEnter(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.shiftKey || e.isComposing) return; // 改行 / IME確定は送信しない
    e.preventDefault();
    this.send();
  }

  // FR-2: 送信。失敗時は入力を保持したままエラー表示し、再送信可能にする（FR-8）
  send(): void {
    if (this.loading() || !this.canSend()) return;
    const message = this.draft().trim();

    this.error.set(null);
    this.loading.set(true);
    this.messages.update((list) => [...list, { role: 'user', content: message }]);
    this.shouldScroll = true;

    this.chatService.sendMessage(message, this.profile()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.draft.set('');
        this.messages.update((list) => [...list, { role: 'assistant', content: res.reply }]);
        this.shouldScroll = true;
      },
      error: (err: HttpErrorResponse) => {
        // 失敗した発話はBE側で未保存（P-4）のため、表示からも取り下げて入力欄に残す
        this.loading.set(false);
        this.messages.update((list) => list.slice(0, -1));
        this.error.set(this.extractMessage(err, 'AIの応答取得に失敗しました。再送信してください。'));
      },
    });
  }

  private extractMessage(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'サーバに接続できませんでした。バックエンドの起動を確認して再送信してください。';
    }
    return err.error?.error?.message ?? fallback;
  }
}
