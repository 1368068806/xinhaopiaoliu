import type { SaveData, UpgradeLevels } from './types';

export const SAVE_KEY = 'signal-drift-save-v1';

export const UPGRADE_KEYS = ['speed', 'dash', 'pulse', 'armor'] as const;
export type UpgradeKey = (typeof UPGRADE_KEYS)[number];

export interface UpgradeDef {
  key: UpgradeKey;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costStep: number;
}

export const UPGRADE_DEFS: UpgradeDef[] = [
  { key: 'speed', name: '推进器速度', description: '提升移动速度，每级 +18', maxLevel: 3, baseCost: 45, costStep: 25 },
  { key: 'dash', name: '冲刺充能', description: '增加冲刺充能上限，每级 +1', maxLevel: 3, baseCost: 35, costStep: 20 },
  { key: 'pulse', name: '脉冲半径', description: '扩大眩晕范围，每级 +25', maxLevel: 3, baseCost: 40, costStep: 25 },
  { key: 'armor', name: '数据包护甲', description: '降低受损并减缓衰减，每级 -2 受损', maxLevel: 3, baseCost: 50, costStep: 30 },
];

export const DEFAULT_UPGRADES: UpgradeLevels = { speed: 0, dash: 0, pulse: 0, armor: 0 };

export function defaultSave(): SaveData {
  return {
    bandwidth: 60,
    delivered: 0,
    streak: 0,
    bestStreak: 0,
    upgrades: { ...DEFAULT_UPGRADES },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = defaultSave();
    return {
      bandwidth: typeof parsed.bandwidth === 'number' ? parsed.bandwidth : base.bandwidth,
      delivered: typeof parsed.delivered === 'number' ? parsed.delivered : base.delivered,
      streak: typeof parsed.streak === 'number' ? parsed.streak : base.streak,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : base.bestStreak,
      upgrades: { ...base.upgrades, ...(parsed.upgrades ?? {}) },
    };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // 存档失败不阻断游戏
  }
}

export function upgradeCost(def: UpgradeDef, level: number): number {
  return def.baseCost + def.costStep * level;
}

export function buyUpgrade(save: SaveData, key: UpgradeKey): boolean {
  const def = UPGRADE_DEFS.find((d) => d.key === key);
  if (!def) return false;
  const level = save.upgrades[key];
  if (level >= def.maxLevel) return false;
  const cost = upgradeCost(def, level);
  if (save.bandwidth < cost) return false;
  save.bandwidth -= cost;
  save.upgrades[key] = level + 1;
  persistSave(save);
  return true;
}
