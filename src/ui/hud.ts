import type { RunState } from '../game/types';

export interface HudCallbacks {
  onResume(): void;
  onQuit(): void;
}

export interface ResultInfo {
  success: boolean;
  reward: number;
  reason: string;
  contractName: string;
  integrity: number;
  streak: number;
}

export class HudController {
  private root = document.getElementById('hud-overlay');
  private pauseRoot = document.getElementById('pause-overlay');
  private resultRoot = document.getElementById('result-overlay');
  private integrityFill!: HTMLElement;
  private integrityText!: HTMLElement;
  private dashPips!: HTMLElement;
  private pulseFill!: HTMLElement;
  private pulseText!: HTMLElement;
  private objective!: HTMLElement;

  constructor(private callbacks: HudCallbacks, private contractName: string) {
    this.build();
  }

  private build(): void {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="hud">
        <div class="hud-top">
          <div class="objective-chip" id="hud-objective"></div>
          <div class="hud-bars">
            <div class="bar-row">
              <span>数据包完整度</span>
              <div class="bar"><div id="hud-integrity"></div></div>
              <b id="hud-integrity-text"></b>
            </div>
          </div>
          <button class="hud-pause" id="hud-pause" type="button">暂停</button>
        </div>
        <div class="hud-bottom">
          <div class="ability-chip">
            <span class="ability-name">冲刺</span>
            <div class="dash-pips" id="hud-dash"></div>
          </div>
          <div class="ability-chip">
            <span class="ability-name">脉冲</span>
            <div class="pulse-bar"><div id="hud-pulse"></div></div>
            <b id="hud-pulse-text" class="ability-status"></b>
          </div>
        </div>
      </div>
    `;
    this.objective = document.getElementById('hud-objective') as HTMLElement;
    this.integrityFill = document.getElementById('hud-integrity') as HTMLElement;
    this.integrityText = document.getElementById('hud-integrity-text') as HTMLElement;
    this.dashPips = document.getElementById('hud-dash') as HTMLElement;
    this.pulseFill = document.getElementById('hud-pulse') as HTMLElement;
    this.pulseText = document.getElementById('hud-pulse-text') as HTMLElement;
    (document.getElementById('hud-pause') as HTMLElement).addEventListener('click', () => this.setPaused(true));

    if (this.pauseRoot) {
      this.pauseRoot.innerHTML = `
        <div class="modal-card">
          <h2>已暂停</h2>
          <p>信号暂时中断，城市还在等你。</p>
          <div class="modal-actions">
            <button class="primary" id="resume-btn" type="button">继续</button>
            <button class="secondary" id="quit-btn" type="button">返回枢纽</button>
          </div>
        </div>
      `;
      this.pauseRoot.querySelector('#resume-btn')?.addEventListener('click', () => this.callbacks.onResume());
      this.pauseRoot.querySelector('#quit-btn')?.addEventListener('click', () => this.callbacks.onQuit());
    }
  }

  show(): void {
    this.root?.classList.remove('hidden');
  }

  hide(): void {
    this.root?.classList.add('hidden');
    this.pauseRoot?.classList.add('hidden');
    this.resultRoot?.classList.add('hidden');
  }

  setPaused(value: boolean): void {
    this.pauseRoot?.classList.toggle('hidden', !value);
  }

  toast(message: string): void {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    stack.appendChild(node);
    window.setTimeout(() => node.remove(), 2200);
  }

  update(run: RunState): void {
    if (!this.integrityFill) return;
    const integrityPct = Math.max(0, Math.min(1, run.integrity / run.maxIntegrity));
    this.integrityFill.style.width = `${Math.round(integrityPct * 100)}%`;
    this.integrityText.textContent = `${Math.ceil(run.integrity)} / ${run.maxIntegrity}`;
    this.objective.textContent = `目标：把数据包送到中继塔（${this.contractName}）`;
    this.dashPips.innerHTML = Array.from(
      { length: run.player.dashMax },
      (_, i) => `<i class="${i < run.player.dashCharges ? 'on' : ''}"></i>`,
    ).join('');
    const pulsePct =
      run.player.pulseCooldown <= 0
        ? 1
        : Math.max(0, 1 - run.player.pulseCooldown / run.pulseCooldownMax);
    this.pulseFill.style.width = `${Math.round(pulsePct * 100)}%`;
    this.pulseText.textContent = run.player.pulseCooldown > 0 ? `${run.player.pulseCooldown.toFixed(1)}s` : '就绪';
  }

  showResult(info: ResultInfo, onReturn: () => void): void {
    if (!this.resultRoot) return;
    this.resultRoot.innerHTML = `
      <div class="result-card ${info.success ? 'win' : 'lose'}">
        <h2>${info.success ? '送达成功' : '任务失败'}</h2>
        <p>${info.reason}</p>
        <dl>
          <div><dt>契约</dt><dd>${info.contractName}</dd></div>
          <div><dt>奖励</dt><dd>${info.reward} 带宽</dd></div>
          <div><dt>剩余完整度</dt><dd>${info.integrity}</dd></div>
          <div><dt>连胜</dt><dd>${info.streak}</dd></div>
        </dl>
        <button class="primary" id="result-return" type="button">返回枢纽</button>
      </div>
    `;
    this.resultRoot.classList.remove('hidden');
    this.resultRoot.querySelector('#result-return')?.addEventListener('click', onReturn);
  }
}
