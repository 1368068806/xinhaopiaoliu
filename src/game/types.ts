export interface UpgradeLevels {
  speed: number;
  dash: number;
  pulse: number;
  armor: number;
}

export interface SaveData {
  bandwidth: number;
  delivered: number;
  streak: number;
  bestStreak: number;
  upgrades: UpgradeLevels;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  difficulty: '平稳' | '危险' | '致命';
  reward: number;
  ghostCount: number;
  ghostSpeed: number;
  chaseSpeed: number;
  packetMax: number;
  destination: { i: number; j: number };
}

export interface GhostState {
  id: number;
  x: number;
  y: number;
  speed: number;
  chaseSpeed: number;
  waypoints: { x: number; y: number }[];
  wpIndex: number;
  stunned: number;
  chasing: boolean;
  variant: number;
}

export interface PlayerState {
  x: number;
  y: number;
  radius: number;
  dashCharges: number;
  dashMax: number;
  dashTimer: number;
  dashRecharge: number;
  dashRechargeMax: number;
  dashDirX: number;
  dashDirY: number;
  pulseCooldown: number;
  invuln: number;
}

export interface CacheState {
  x: number;
  y: number;
  used: boolean;
}

export interface RunState {
  contract: Contract;
  player: PlayerState;
  integrity: number;
  maxIntegrity: number;
  start: { x: number; y: number };
  destination: { x: number; y: number };
  ghosts: GhostState[];
  caches: CacheState[];
  time: number;
  status: 'running' | 'delivered' | 'failed';
  speed: number;
  pulseRadius: number;
  pulseCooldownMax: number;
  hitDamage: number;
  decayRate: number;
  dashDuration: number;
}

export interface RunEvent {
  type: 'dash' | 'pulse' | 'ghost-hit' | 'cache' | 'delivered' | 'failed';
  x?: number;
  y?: number;
  message?: string;
}

export interface InputFrame {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  dash: boolean;
  pulse: boolean;
}
