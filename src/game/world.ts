import type { Rect } from './types';

export const BLOCK_W = 220;
export const BLOCK_H = 180;
export const STREET = 100;
export const COLS = 4;
export const ROWS = 3;

export const WORLD_W = COLS * BLOCK_W + (COLS + 1) * STREET;
export const WORLD_H = ROWS * BLOCK_H + (ROWS + 1) * STREET;

export const PLAYER_RADIUS = 16;

export interface NodeRef {
  x: number;
  y: number;
  i: number;
  j: number;
}

export function nodeX(i: number): number {
  return STREET / 2 + i * (BLOCK_W + STREET);
}

export function nodeY(j: number): number {
  return STREET / 2 + j * (BLOCK_H + STREET);
}

export function nodeIndex(i: number, j: number): number {
  return j * (COLS + 1) + i;
}

export const NODES: NodeRef[] = (() => {
  const nodes: NodeRef[] = [];
  for (let j = 0; j <= ROWS; j += 1) {
    for (let i = 0; i <= COLS; i += 1) {
      nodes.push({ x: nodeX(i), y: nodeY(j), i, j });
    }
  }
  return nodes;
})();

export const OBSTACLES: Rect[] = (() => {
  const rects: Rect[] = [];
  for (let j = 0; j < ROWS; j += 1) {
    for (let i = 0; i < COLS; i += 1) {
      rects.push({
        x: nodeX(i) + STREET / 2,
        y: nodeY(j) + STREET / 2,
        w: BLOCK_W,
        h: BLOCK_H,
      });
    }
  }
  return rects;
})();
