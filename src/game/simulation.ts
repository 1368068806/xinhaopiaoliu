import type { Contract, GhostState, InputFrame, RunEvent, RunState } from './types';
import { OBSTACLES, PLAYER_RADIUS, WORLD_H, WORLD_W, NODES, nodeIndex } from './world';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CreateRunOptions {
  contract: Contract;
  upgrades: { speed: number; dash: number; pulse: number; armor: number };
}

export function createRun(options: CreateRunOptions): RunState {
  const { contract, upgrades } = options;
  const startNode = NODES[0];
  const destNode = NODES[nodeIndex(contract.destination.i, contract.destination.j)];
  const rand = mulberry32(contract.id.length * 97 + contract.ghostCount * 31);

  const ghosts: GhostState[] = [];
  const waypointPool = NODES.filter((n) => n.i + n.j > 0);
  for (let id = 0; id < contract.ghostCount; id += 1) {
    const shuffled = [...waypointPool].sort(() => rand() - 0.5);
    const count = 3 + Math.floor(rand() * 2);
    const waypoints = shuffled.slice(0, count).map((n) => ({ x: n.x, y: n.y }));
    ghosts.push({
      id,
      x: waypoints[0].x + (rand() - 0.5) * 40,
      y: waypoints[0].y + (rand() - 0.5) * 40,
      speed: contract.ghostSpeed,
      chaseSpeed: contract.chaseSpeed,
      waypoints,
      wpIndex: 1,
      stunned: 0,
      chasing: false,
      variant: id % 3,
    });
  }

  const cacheNodes = [NODES[8], NODES[12], NODES[15]];
  const caches = cacheNodes
    .filter((n) => n !== startNode && n !== destNode)
    .map((n) => ({ x: n.x, y: n.y, used: false }));

  return {
    contract,
    player: {
      x: startNode.x,
      y: startNode.y,
      radius: PLAYER_RADIUS,
      dashCharges: 1 + upgrades.dash,
      dashMax: 1 + upgrades.dash,
      dashTimer: 0,
      dashRecharge: 0,
      dashRechargeMax: 2.8 - upgrades.dash * 0.25,
      dashDirX: 1,
      dashDirY: 0,
      pulseCooldown: 0,
      invuln: 0,
    },
    integrity: contract.packetMax,
    maxIntegrity: contract.packetMax,
    start: { x: startNode.x, y: startNode.y },
    destination: { x: destNode.x, y: destNode.y },
    ghosts,
    caches,
    time: 0,
    status: 'running',
    speed: 210 + upgrades.speed * 18,
    pulseRadius: 120 + upgrades.pulse * 25,
    pulseCooldownMax: 7 - upgrades.pulse * 0.6,
    hitDamage: Math.max(4, 14 - upgrades.armor * 2),
    decayRate: Math.max(0.03, 0.09 - upgrades.armor * 0.015),
    dashDuration: 0.18,
  };
}

const DASH_SPEED = 660;
const GHOST_CHASE_RANGE = 190;
const DELIVER_RANGE = 64;
const CACHE_RANGE = 55;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

function collideWithBlocks(x: number, y: number, radius: number): { x: number; y: number } {
  let px = x;
  let py = y;
  for (const block of OBSTACLES) {
    const cx = clamp(px, block.x, block.x + block.w);
    const cy = clamp(py, block.y, block.y + block.h);
    const dx = px - cx;
    const dy = py - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < radius * radius) {
      const d = Math.sqrt(d2) || 0.001;
      const nx = dx / d;
      const ny = dy / d;
      px = cx + nx * radius;
      py = cy + ny * radius;
    }
  }
  px = clamp(px, radius, WORLD_W - radius);
  py = clamp(py, radius, WORLD_H - radius);
  return { x: px, y: py };
}

function updateGhost(ghost: GhostState, playerX: number, playerY: number, dt: number): void {
  if (ghost.stunned > 0) {
    ghost.stunned -= dt;
    return;
  }
  const distToPlayer = distance(ghost.x, ghost.y, playerX, playerY);
  ghost.chasing = distToPlayer < GHOST_CHASE_RANGE;
  if (ghost.chasing) {
    const dx = playerX - ghost.x;
    const dy = playerY - ghost.y;
    const d = Math.hypot(dx, dy) || 1;
    ghost.x += (dx / d) * ghost.chaseSpeed * dt;
    ghost.y += (dy / d) * ghost.chaseSpeed * dt;
    return;
  }
  const target = ghost.waypoints[ghost.wpIndex];
  const dx = target.x - ghost.x;
  const dy = target.y - ghost.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) {
    ghost.wpIndex = (ghost.wpIndex + 1) % ghost.waypoints.length;
  } else {
    ghost.x += (dx / d) * ghost.speed * dt;
    ghost.y += (dy / d) * ghost.speed * dt;
  }
}

export function updateRun(state: RunState, input: InputFrame, dt: number): RunEvent[] {
  if (state.status !== 'running') return [];
  const events: RunEvent[] = [];
  state.time += dt;
  const p = state.player;

  p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
  p.invuln = Math.max(0, p.invuln - dt);

  if (p.dashTimer > 0) {
    p.dashTimer -= dt;
    p.x += p.dashDirX * DASH_SPEED * dt;
    p.y += p.dashDirY * DASH_SPEED * dt;
  } else {
    let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const len = Math.hypot(mx, my);
    if (len > 0) {
      mx /= len;
      my /= len;
      p.dashDirX = mx;
      p.dashDirY = my;
    }
    p.x += mx * state.speed * dt;
    p.y += my * state.speed * dt;

    if (input.dash && p.dashCharges > 0) {
      p.dashCharges -= 1;
      p.dashTimer = state.dashDuration;
      p.dashRecharge = p.dashRechargeMax;
      p.invuln = 0.38;
      events.push({ type: 'dash', x: p.x, y: p.y });
    }
  }

  if (p.dashCharges < p.dashMax) {
    p.dashRecharge -= dt;
    if (p.dashRecharge <= 0) {
      p.dashCharges += 1;
      p.dashRecharge = p.dashRechargeMax;
    }
  }

  if (input.pulse && p.pulseCooldown <= 0) {
    p.pulseCooldown = state.pulseCooldownMax;
    events.push({ type: 'pulse', x: p.x, y: p.y });
    for (const ghost of state.ghosts) {
      if (distance(ghost.x, ghost.y, p.x, p.y) <= state.pulseRadius) {
        ghost.stunned = Math.max(ghost.stunned, 2.2);
        ghost.chasing = false;
      }
    }
  }

  const pos = collideWithBlocks(p.x, p.y, p.radius);
  p.x = pos.x;
  p.y = pos.y;

  for (const ghost of state.ghosts) {
    updateGhost(ghost, p.x, p.y, dt);
    if (p.invuln <= 0 && ghost.stunned <= 0 && distance(ghost.x, ghost.y, p.x, p.y) < p.radius + 18) {
      state.integrity = Math.max(0, state.integrity - state.hitDamage);
      p.invuln = 0.8;
      events.push({ type: 'ghost-hit', x: ghost.x, y: ghost.y, message: `数据包受损 -${state.hitDamage}` });
    }
  }

  state.integrity = Math.max(0, state.integrity - state.decayRate * dt);

  for (const cache of state.caches) {
    if (!cache.used && distance(p.x, p.y, cache.x, cache.y) < CACHE_RANGE) {
      cache.used = true;
      state.integrity = Math.min(state.maxIntegrity, state.integrity + 18);
      events.push({ type: 'cache', x: cache.x, y: cache.y, message: '数据包修复 +18' });
    }
  }

  if (state.integrity <= 0) {
    state.status = 'failed';
    events.push({ type: 'failed', message: '数据包完整度归零' });
  } else if (distance(p.x, p.y, state.destination.x, state.destination.y) < DELIVER_RANGE) {
    state.status = 'delivered';
    events.push({ type: 'delivered', message: '数据包已送达' });
  }

  return events;
}
