import * as THREE from 'three';

/**
 * 建物ポータル（MVP）。
 * 建物に近づくと画面下に「○○のサイトへ入る（Eキー）」を表示し、
 * E キーでそのURLを新規タブで開く。将来は遷移演出やオーバーレイ表示に拡張予定。
 */
export interface Portal {
  /** 表示名（例: 岡山城） */
  name: string;
  /** 反応の中心となるワールド座標（建物入口付近の地表点） */
  position: THREE.Vector3;
  /** この距離以内に入ると入場可能になる（ワールド単位） */
  radius: number;
  /** 入場先URL */
  url: string;
}

export class PortalManager {
  private portals: Portal[] = [];
  private active: Portal | null = null;

  private promptEl: HTMLDivElement;
  private nameEl: HTMLSpanElement;

  constructor() {
    // プロンプトUIを動的に生成（index.html を汚さない）
    const el = document.createElement('div');
    el.id = 'portal-prompt';
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:64px',
      'transform:translateX(-50%) translateY(8px)',
      'padding:12px 20px',
      'background:rgba(20,24,40,0.82)',
      'color:#eef3ff',
      'font-family:system-ui, sans-serif',
      'font-size:15px',
      'border:1px solid rgba(160,190,255,0.5)',
      'border-radius:10px',
      'box-shadow:0 6px 24px rgba(0,0,0,0.35)',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.18s ease, transform 0.18s ease',
      'z-index:10',
      'white-space:nowrap',
    ].join(';');
    el.innerHTML =
      '<b style="color:#ffd66b" id="portal-name"></b> のサイトへ入る　' +
      '<span style="opacity:0.85">［ <b>E</b> キー ］</span>';
    document.body.appendChild(el);
    this.promptEl = el;
    this.nameEl = el.querySelector('#portal-name') as HTMLSpanElement;
  }

  add(portal: Portal): void {
    this.portals.push(portal);
  }

  /** 毎フレーム呼ぶ：最も近い範囲内のポータルを active にし、プロンプト表示を更新 */
  update(charPos: THREE.Vector3): void {
    let nearest: Portal | null = null;
    let best = Infinity;
    for (const p of this.portals) {
      const d = charPos.distanceTo(p.position);
      if (d <= p.radius && d < best) {
        best = d;
        nearest = p;
      }
    }

    if (nearest !== this.active) {
      this.active = nearest;
      if (nearest) {
        this.nameEl.textContent = nearest.name;
        this.promptEl.style.opacity = '1';
        this.promptEl.style.transform = 'translateX(-50%) translateY(0)';
      } else {
        this.promptEl.style.opacity = '0';
        this.promptEl.style.transform = 'translateX(-50%) translateY(8px)';
      }
    }
  }

  /** E キー押下時に呼ぶ：範囲内のポータルがあればURLを開く（ユーザー操作起点なのでポップアップ可） */
  enter(): boolean {
    if (!this.active) return false;
    window.open(this.active.url, '_blank', 'noopener');
    return true;
  }

  /** 現在入場可能なポータル（なければ null） */
  get current(): Portal | null {
    return this.active;
  }
}
