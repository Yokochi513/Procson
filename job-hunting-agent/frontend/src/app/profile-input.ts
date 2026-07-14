import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Profile } from './chat.service';

// ProfileInput（設計書 2.3 / FR-1）: 画面上部の簡易プロフィール入力（全項目任意）
@Component({
  selector: 'app-profile-input',
  imports: [FormsModule],
  template: `
    <details class="profile" open>
      <summary>プロフィール（任意）— 入力すると相談に反映されます</summary>
      <div class="profile-fields">
        <label>
          学年
          <input
            type="text"
            placeholder="例: 学部3年"
            [ngModel]="profile().grade"
            (ngModelChange)="update('grade', $event)"
          />
        </label>
        <label>
          志望業界・職種
          <input
            type="text"
            placeholder="例: IT / エンジニア"
            [ngModel]="profile().industry"
            (ngModelChange)="update('industry', $event)"
          />
        </label>
        <label>
          現在の状況・悩み
          <input
            type="text"
            placeholder="例: ESが書けない"
            [ngModel]="profile().situation"
            (ngModelChange)="update('situation', $event)"
          />
        </label>
      </div>
    </details>
  `,
})
export class ProfileInput {
  readonly profile = model<Profile>({ grade: '', industry: '', situation: '' });

  update(field: keyof Profile, value: string): void {
    this.profile.update((p) => ({ ...p, [field]: value }));
  }
}
