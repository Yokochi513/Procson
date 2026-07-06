import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Profile {
  grade: string;
  industry: string;
  situation: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

// ChatService（設計書 2.3）: 匿名IDの発行/取得（FR-7）と BE API 呼び出し（FR-6）
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'jobAgentAnonId';

  /** localStorage の匿名IDを返す。無ければ `anon-` + UUID を生成して保存（FR-7, P-6） */
  getUserId(): string {
    let id = localStorage.getItem(this.storageKey);
    if (!id) {
      id = 'anon-' + crypto.randomUUID();
      localStorage.setItem(this.storageKey, id);
    }
    return id;
  }

  sendMessage(message: string, profile: Profile): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${environment.apiBaseUrl}/api/chat`, {
      userId: this.getUserId(),
      message,
      profile,
    });
  }

  getHistory(): Observable<{ messages: ChatMessage[] }> {
    return this.http.get<{ messages: ChatMessage[] }>(`${environment.apiBaseUrl}/api/history`, {
      params: { userId: this.getUserId() },
    });
  }
}
