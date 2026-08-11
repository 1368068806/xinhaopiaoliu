import { CONTRACTS } from '../game/contracts';
import { SAVE_KEY, UPGRADE_DEFS, buyUpgrade, loadSave, upgradeCost, type UpgradeKey } from '../game/save';

const MEMORY_FRAGMENTS = [
  '第一份记忆回来了：雨声、铁桥、一个反复调试天线的背影。',
  '中继塔曾经是学校的天线操场，孩子们把风筝放得比塔还高。',
  '城市里所有人都会唱同一首潮汐歌，涨潮时从东岸唱到西岸。',
  '静电不是敌人，是还没有找到家的信号。',
  '你记得自己也有一个名字，只是还没想完整。',
  '最后一盏中继灯亮了，城市开始喊你的名字。',
];

function levelPips(level: number, maxLevel: number): string {
  return Array.from({ length: maxLevel }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
}

export function buildHub(container: HTMLElement, callbacks: { onStart(contractId: string): void }): void {
  const render = () => {
    const save = loadSave();
    container.innerHTML = `
      <div class="hub-scroll">
        <header class="hub-header">
          <div>
            <h1>信号漂流</h1>
            <p>把最后的数据包送回家。</p>
          </div>
          <div class="hub-stats">
            <span>带宽 <b>${save.bandwidth}</b></span>
            <span>连胜 <b>${save.streak}</b></span>
            <span>最高连胜 <b>${save.bestStreak}</b></span>
            <span>送达 <b>${save.delivered}</b></span>
          </div>
        </header>

        <section class="hub-band">
          <h2>契约板</h2>
          <div class="contract-grid">
            ${CONTRACTS.map((contract) => `
              <article class="contract-card">
                <div class="contract-head">
                  <h3>${contract.name}</h3>
                  <span class="difficulty diff-${contract.difficulty}">${contract.difficulty}</span>
                </div>
                <p>${contract.description}</p>
                <dl>
                  <div><dt>报酬</dt><dd>${contract.reward} 带宽</dd></div>
                  <div><dt>静电体</dt><dd>${contract.ghostCount}</dd></div>
                  <div><dt>完整度</dt><dd>${contract.packetMax}</dd></div>
                </dl>
                <button class="primary" type="button" data-start="${contract.id}">接受契约</button>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="hub-band">
          <h2>升级终端</h2>
          <div class="upgrade-list">
            ${UPGRADE_DEFS.map((def) => {
              const level = save.upgrades[def.key];
              const maxed = level >= def.maxLevel;
              const cost = upgradeCost(def, level);
              const affordable = save.bandwidth >= cost;
              return `
                <div class="upgrade-row">
                  <div class="upgrade-info">
                    <div class="upgrade-name">
                      <h3>${def.name}</h3>
                      <span class="level-pips">${levelPips(level, def.maxLevel)}</span>
                    </div>
                    <p>${def.description}</p>
                  </div>
                  <button class="secondary" type="button" data-upgrade="${def.key}" ${maxed || !affordable ? 'disabled' : ''}>
                    ${maxed ? '已满级' : `${cost} 带宽`}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <section class="hub-band">
          <h2>记忆档案</h2>
          <div class="memory-grid">
            ${MEMORY_FRAGMENTS.map((text, index) => {
              const unlocked = index < save.delivered;
              return `<div class="memory-fragment ${unlocked ? 'unlocked' : ''}">${unlocked ? text : '尚未恢复'}</div>`;
            }).join('')}
          </div>
        </section>

        <footer class="hub-footer">
          <button class="ghost-button" id="reset-save" type="button">清空进度</button>
        </footer>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>('[data-start]').forEach((btn) => {
      btn.addEventListener('click', () => callbacks.onStart(btn.dataset.start ?? 'near'));
    });
    container.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.upgrade as UpgradeKey;
        const save = loadSave();
        if (buyUpgrade(save, key)) render();
      });
    });
    container.querySelector('#reset-save')?.addEventListener('click', () => {
      localStorage.removeItem(SAVE_KEY);
      render();
    });
  };

  render();
}
