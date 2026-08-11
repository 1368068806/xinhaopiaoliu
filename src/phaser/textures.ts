import Phaser from 'phaser';
import { mulberry32 } from '../game/simulation';

function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  const g = new Phaser.GameObjects.Graphics(scene, { x: 0, y: 0 });
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

function ghostTexture(scene: Phaser.Scene, key: string, color: number): void {
  makeTexture(scene, key, 48, 52, (g) => {
    g.fillStyle(color, 0.22);
    g.fillCircle(24, 25, 17);
    g.fillStyle(color, 0.5);
    g.fillCircle(24, 25, 12);
    g.fillStyle(0x0b1016, 1);
    g.fillCircle(20, 23, 3);
    g.fillCircle(28, 23, 3);
    g.lineStyle(3, color, 0.85);
    g.beginPath();
    g.moveTo(12, 36);
    g.lineTo(8, 45);
    g.moveTo(24, 38);
    g.lineTo(24, 47);
    g.moveTo(36, 36);
    g.lineTo(40, 45);
    g.strokePath();
  });
}

export function generateGameTextures(scene: Phaser.Scene): void {
  makeTexture(scene, 'water', 96, 96, (g) => {
    g.fillStyle(0x0a1f2c, 1);
    g.fillRect(0, 0, 96, 96);
    g.lineStyle(2, 0x1b5566, 0.5);
    g.strokeRect(6, 6, 84, 84);
    g.lineStyle(1, 0x2d7d8a, 0.4);
    g.beginPath();
    g.moveTo(4, 28);
    g.lineTo(26, 22);
    g.lineTo(46, 28);
    g.lineTo(70, 22);
    g.strokePath();
    g.beginPath();
    g.moveTo(18, 62);
    g.lineTo(42, 68);
    g.lineTo(64, 62);
    g.lineTo(88, 68);
    g.strokePath();
  });

  makeTexture(scene, 'block', 220, 180, (g) => {
    g.fillStyle(0x12222e, 1);
    g.fillRect(0, 0, 220, 180);
    g.lineStyle(2, 0x2c4a58, 0.9);
    g.strokeRect(1, 1, 218, 178);
    const rand = mulberry32(7);
    for (let y = 16; y < 170; y += 24) {
      for (let x = 14; x < 206; x += 26) {
        const roll = rand();
        if (roll > 0.72) {
          g.fillStyle(0xf2b35c, 0.8);
          g.fillRect(x, y, 8, 10);
        } else if (roll > 0.6) {
          g.fillStyle(0x57c7d4, 0.55);
          g.fillRect(x, y, 8, 10);
        }
      }
    }
  });

  const towerDraw = (g: Phaser.GameObjects.Graphics, glow: number) => {
    g.fillStyle(0x1c3544, 1);
    g.fillRect(22, 18, 20, 110);
    g.fillStyle(glow, 1);
    g.fillRect(27, 2, 10, 16);
    g.fillStyle(0xff6b5e, 0.9);
    g.fillRect(29, 4, 6, 12);
    g.fillStyle(0x2d7d8a, 0.9);
    g.fillRect(12, 30, 5, 5);
    g.fillRect(47, 34, 5, 5);
    g.fillRect(12, 58, 5, 5);
    g.fillRect(47, 62, 5, 5);
    g.fillRect(12, 86, 5, 5);
    g.fillRect(47, 90, 5, 5);
    g.fillStyle(0x0a1f2c, 1);
    g.fillRect(0, 124, 64, 4);
  };
  makeTexture(scene, 'tower', 64, 128, (g) => towerDraw(g, 0xf2b35c));
  makeTexture(scene, 'tower-dest', 64, 128, (g) => towerDraw(g, 0x39d98e));

  makeTexture(scene, 'courier', 48, 48, (g) => {
    g.fillStyle(0xe8f4f5, 1);
    g.fillCircle(24, 24, 12);
    g.fillStyle(0x20c8d4, 1);
    g.fillCircle(24, 24, 8);
    g.fillStyle(0x0a1f2c, 1);
    g.fillCircle(24, 24, 4);
    g.fillStyle(0xf2b35c, 1);
    g.fillRect(4, 20, 9, 4);
    g.fillRect(35, 20, 9, 4);
    g.fillRect(10, 30, 4, 10);
    g.fillRect(34, 30, 4, 10);
  });

  makeTexture(scene, 'packet', 44, 30, (g) => {
    g.fillStyle(0xf2b35c, 0.25);
    g.fillRoundedRect(4, 4, 36, 22, 4);
    g.fillStyle(0xf2b35c, 1);
    g.fillRect(6, 6, 32, 18);
    g.fillStyle(0xfff2d8, 1);
    g.fillRect(6, 6, 32, 4);
    g.fillStyle(0xd9822b, 1);
    g.fillRect(18, 8, 8, 14);
  });

  makeTexture(scene, 'cache', 64, 64, (g) => {
    g.fillStyle(0x39d98e, 0.18);
    g.fillCircle(32, 32, 28);
    g.lineStyle(4, 0x39d98e, 0.95);
    g.strokeCircle(32, 32, 24);
    g.fillStyle(0x39d98e, 1);
    g.fillCircle(32, 32, 8);
    g.fillStyle(0x0a1f2c, 1);
    g.fillRect(29, 24, 6, 16);
  });

  makeTexture(scene, 'glow', 64, 64, (g) => {
    g.fillStyle(0xfff2d8, 0.08);
    g.fillCircle(32, 32, 30);
    g.fillStyle(0xffd98a, 0.18);
    g.fillCircle(32, 32, 20);
    g.fillStyle(0xfff2d8, 0.4);
    g.fillCircle(32, 32, 10);
  });

  makeTexture(scene, 'pulse-ring', 256, 256, (g) => {
    g.lineStyle(7, 0xff5f6b, 0.9);
    g.strokeCircle(128, 128, 90);
    g.lineStyle(3, 0xffa13d, 0.8);
    g.strokeCircle(128, 128, 108);
  });

  makeTexture(scene, 'cache-ring', 128, 128, (g) => {
    g.lineStyle(6, 0x39d98e, 0.9);
    g.strokeCircle(64, 64, 44);
    g.lineStyle(2, 0x57f0c2, 0.8);
    g.strokeCircle(64, 64, 54);
  });

  ghostTexture(scene, 'ghost-0', 0xff4d5e);
  ghostTexture(scene, 'ghost-1', 0xffa13d);
  ghostTexture(scene, 'ghost-2', 0x4fd0e8);
}
